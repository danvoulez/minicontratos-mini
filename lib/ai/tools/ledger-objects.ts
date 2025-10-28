import { tool } from "ai";
import { z } from "zod";

export const ledgerObjects = ({ origin }: { origin: string }) =>
  tool({
    description:
      "Acessa o Registro Universal para CONSULTAR ou SALVAR informações. Use 'get' para buscar o que já está salvo ou 'post' para registrar algo novo. QUALQUER tipo de informação pode ser salva: Cliente, Projeto, Contrato, Tarefa, Despesa, Nota, Reuniao, etc. Se o tipo não existir, será criado automaticamente. Use esta ferramenta quando o usuário quiser registrar ou consultar qualquer informação.",
    inputSchema: z.object({
      op: z
        .enum(["get", "post"])
        .describe(
          "Operação: 'get' para consultar registros existentes, 'post' para salvar novo registro"
        ),
      typeName: z
        .string()
        .optional()
        .describe(
          "Nome descritivo do tipo de registro em português (ex: 'Cliente', 'Projeto', 'Contrato', 'Despesa'). Para POST é obrigatório. Para GET, se omitido retorna TODOS os registros"
        ),
      data: z
        .record(z.any())
        .optional()
        .describe(
          "Dados a serem salvos (obrigatório apenas para 'post'). Coloque TODOS os campos relevantes aqui. Ex: { nome: 'João Silva', telefone: '11-98765-4321', cidade: 'Lisboa' }"
        ),
      metadata: z
        .record(z.any())
        .optional()
        .describe(
          "Metadados opcionais. Use 'tags' aqui para facilitar buscas futuras. Ex: { tags: ['vip', 'solar'] }"
        ),
    }),
    execute: async (input) => {
      const base = origin;
      if (input.op === "get") {
        const qs = input.typeName
          ? `?type=${encodeURIComponent(input.typeName)}`
          : "";
        const r = await fetch(`${base}/api/ledger/objects${qs}`);
        if (!r.ok) throw new Error(`ledgerObjects:get failed: ${r.status}`);
        return await r.json();
      }
      if (input.op === "post") {
        const r = await fetch(`${base}/api/ledger/objects`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            typeName: input.typeName,
            data: input.data,
            metadata: input.metadata,
          }),
        });
        if (!r.ok) throw new Error(`ledgerObjects:post failed: ${r.status}`);
        return await r.json();
      }
      throw new Error("Unsupported op for ledgerObjects");
    },
  });
