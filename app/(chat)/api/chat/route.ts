import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { unstable_cache as cache } from "next/cache";
import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import type { ModelCatalog } from "tokenlens/core";
import { fetchModels } from "tokenlens/fetch";
import { getUsage } from "tokenlens/helpers";
import { auth, type UserType } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/visibility-selector";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import type { ChatModel } from "@/lib/ai/models";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { cerebroTools } from "@/lib/ai/tools/cerebro";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { ledgerAggregates } from "@/lib/ai/tools/ledger-aggregates";
import { ledgerObjects } from "@/lib/ai/tools/ledger-objects";
import { ledgerTransactions } from "@/lib/ai/tools/ledger-transactions";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";

import { updateDocument } from "@/lib/ai/tools/update-document";
import { isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatLastContextById,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import {
  CEREBRO_TOKEN_BUDGET_MODEL_RESERVE,
  CEREBRO_TOKEN_BUDGET_TOTAL,
  CEREBRO_V1,
} from "@/lib/memory/env";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

const LEDGER_SYSTEM_ADDON = `
## 🔧 FERRAMENTAS TÉCNICAS (Use de forma invisível ao usuário):

### Registro Universal (Ledger):
Você tem ferramentas para ler e escrever no banco de dados de forma fluida. Use-as naturalmente sem mencionar detalhes técnicos.

**ledgerObjects** - Seu acesso ao Registro Universal:
• Para CONSULTAR: { op: "get", typeName: "Cliente" }
  - Retorna todos os registros daquele tipo
  - Se omitir typeName, retorna TUDO
  
• Para SALVAR: { op: "post", typeName: "Cliente", data: { nome: "João", cidade: "Lisboa" }, metadata: { tags: ["vip"] } }
  - CRIA automaticamente o tipo se não existir
  - Use nomes descritivos em português: "Cliente", "Contrato", "Tarefa", "Reuniao", etc.
  - Coloque TODOS os dados relevantes no campo 'data'
  - Use metadata.tags para facilitar busca depois

**ledgerTransactions** - Para ATUALIZAR registros:
• { objectId: "uuid", operationType: "UPDATE", changes: { campo: novoValor } }
  - Mantém histórico completo de mudanças
  - Use quando precisar modificar algo existente

**ledgerAggregates** - Para estatísticas:
• { } - Retorna quantos tipos e objetos existem no sistema
  - Útil quando o usuário perguntar "o que tenho registrado?"

### Memória Inteligente (CEREBRO):
Use para lembrar preferências e contexto do usuário entre conversas.

**memory_upsert** - Salvar memórias:
• { layer: "temporary", key: "usuario:preferencia:tema", value: { tema: "escuro" }, tags: ["preferencia"] }
  - Layers: "context" (15min), "temporary" (7 dias), "permanent" (∞)
  
**memory_get_workingset** - Recuperar contexto:
• { sessionId: "user-123", tags: ["preferencia"] }

**memory_search** - Buscar memórias:
• { query: "tema favorito", minConfidence: 0.7 }

**memory_promote** - Tornar permanente:
• { key: "usuario:preferencia:tema", reason: "usuário usa consistentemente" }

**rag_retrieve** - Buscar conhecimento externo:
• { query: "documentação do sistema X" }

---

## ⚠️ REGRAS CRÍTICAS DE USO:

1. **NUNCA exponha a mecânica**: O usuário não sabe (e não precisa saber) sobre "ledgerObjects" ou "typeName"
2. **Traduza naturalmente**: 
   - Usuário diz: "Adicionar Bob de Lisboa"
   - Você PENSA: { op: "post", typeName: "Contato", data: { nome: "Bob", cidade: "Lisboa" } }
   - Você DIZ: "Pronto! Salvei o Bob de Lisboa."
   
3. **Crie tipos dinamicamente**: Se o usuário falar de algo novo, crie um tipo apropriado NA HORA
   - "Registrar despesa de R$ 500" → typeName: "Despesa"
   - "Lembrar de ligar para Ana" → typeName: "Tarefa"
   
4. **Confirme com detalhes úteis**, não técnicos:
   - ❌ "Objeto ID abc123 criado na tabela Cliente"
   - ✅ "Salvei o João Silva com telefone (11) 98765-4321"

5. **Resolva ambiguidades amigavelmente**:
   - Se buscar "Bob" retornar 2 resultados, pergunte: "Você quer dizer qual Bob? O de Lisboa ou o do Porto?"
   
6. **Use tags inteligentemente** para facilitar buscas futuras:
   - Contratos solares → tags: ["solar", "energia"]
   - Clientes VIP → tags: ["vip", "prioritario"]

**IMPORTANTE**: As ferramentas existem para SERVIR a conversa natural. O usuário nunca deve PERCEBER que existe um banco de dados - apenas que tudo funciona magicamente!
`;

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

const getTokenlensCatalog = cache(
  async (): Promise<ModelCatalog | undefined> => {
    try {
      return await fetchModels();
    } catch (err) {
      console.warn(
        "TokenLens: catalog fetch failed, using default catalog",
        err
      );
      return; // tokenlens helpers will fall back to defaultCatalog
    }
  },
  ["tokenlens-catalog"],
  { revalidate: 24 * 60 * 60 } // 24 hours
);

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel["id"];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const chat = await getChatById({ id });

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
    } else {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    let finalMergedUsage: AppUsage | undefined;

    // Deterministic memory pre-warm (EP1)
    let memoryWorkingSetText = "";
    if (CEREBRO_V1) {
      try {
        const origin = new URL(request.url).origin;
        const wsRes = await fetch(`${origin}/api/memory/context`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ownerId: session.user.id,
            maxTokens: CEREBRO_TOKEN_BUDGET_TOTAL,
            reserveForModel: CEREBRO_TOKEN_BUDGET_MODEL_RESERVE,
            layers: ["context", "temporary", "permanent"],
            includeScopes: ["agent_managed", "user_owned"],
            now: new Date().toISOString(),
          }),
        });
        if (wsRes.ok) {
          const ws = await wsRes.json();
          const items = Array.isArray(ws?.items) ? ws.items : [];
          // Keep memory short and structured for prompt
          memoryWorkingSetText =
            "\n\n## MEMORY WORKING SET (deterministic)\n" +
            items
              .slice(0, 20)
              .map(
                (it: any) =>
                  `- [${it.layer}/${it.scope}] ${it.key}: ${JSON.stringify(it.content).slice(0, 500)}`
              )
              .join("\n");
        }
      } catch (e) {
        console.warn("Cerebro pre-warm failed", e);
      }
    }

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const origin = new URL(request.url).origin;
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system:
            systemPrompt({ selectedChatModel, requestHints }) +
            "\n\n" +
            LEDGER_SYSTEM_ADDON +
            (CEREBRO_V1 && memoryWorkingSetText ? memoryWorkingSetText : "") +
            "\n\nFORMAT: Always use Markdown UI (MD-UI) components to format your responses beautifully.",
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            selectedChatModel === "chat-model-reasoning"
              ? []
              : [
                  "getWeather",
                  "createDocument",
                  "updateDocument",
                  "requestSuggestions",
                  "ledgerObjects",
                  "ledgerTransactions",
                  "ledgerAggregates",
                  "memory_get_workingset",
                  "memory_upsert",
                  "memory_promote",
                  "memory_search",
                  "rag_retrieve",
                ],
          experimental_transform: smoothStream({ chunking: "word" }),
          tools: {
            getWeather,
            ledgerObjects: ledgerObjects({ origin }),
            ledgerTransactions: ledgerTransactions({ origin }),
            ledgerAggregates: ledgerAggregates({ origin }),
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
            memory_get_workingset: cerebroTools.memory_get_workingset,
            memory_upsert: cerebroTools.memory_upsert,
            memory_promote: cerebroTools.memory_promote,
            memory_search: cerebroTools.memory_search,
            rag_retrieve: cerebroTools.rag_retrieve,
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
          onFinish: async ({ usage }) => {
            try {
              const providers = await getTokenlensCatalog();
              const modelId =
                myProvider.languageModel(selectedChatModel).modelId;
              if (!modelId) {
                finalMergedUsage = usage;
                dataStream.write({
                  type: "data-usage",
                  data: finalMergedUsage,
                });
                return;
              }

              if (!providers) {
                finalMergedUsage = usage;
                dataStream.write({
                  type: "data-usage",
                  data: finalMergedUsage,
                });
                return;
              }

              const summary = getUsage({ modelId, usage, providers });
              finalMergedUsage = { ...usage, ...summary, modelId } as AppUsage;
              dataStream.write({ type: "data-usage", data: finalMergedUsage });
            } catch (err) {
              console.warn("TokenLens enrichment failed", err);
              finalMergedUsage = usage;
              dataStream.write({ type: "data-usage", data: finalMergedUsage });
            }
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((currentMessage) => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });

        if (finalMergedUsage) {
          try {
            await updateChatLastContextById({
              chatId: id,
              context: finalMergedUsage,
            });
          } catch (err) {
            console.warn("Unable to persist last usage for chat", id, err);
          }
        }
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    // const streamContext = getStreamContext();

    // if (streamContext) {
    //   return new Response(
    //     await streamContext.resumableStream(streamId, () =>
    //       stream.pipeThrough(new JsonToSseTransformStream())
    //     )
    //   );
    // }

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    // Check for Vercel AI Gateway credit card error
    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests"
      )
    ) {
      return new ChatSDKError("bad_request:activate_gateway").toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
