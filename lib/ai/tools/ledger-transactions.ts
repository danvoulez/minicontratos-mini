import { tool } from "ai";
import { z } from "zod";

export const ledgerTransactions = ({ origin }: { origin: string }) =>
  tool({
    description:
      "Atualiza um registro existente no Registro Universal, mantendo histórico completo de todas as mudanças. Use quando precisar MODIFICAR informações de algo que já está salvo (ex: mudar telefone de um cliente, atualizar valor de contrato, etc). NÃO use para criar novos registros - use ledgerObjects com op='post' para isso.",
    inputSchema: z.object({
      objectId: z
        .string()
        .uuid()
        .describe(
          "ID único do registro que será atualizado (você recebe este ID quando consulta ou cria um registro)"
        ),
      operationType: z
        .enum(["CREATE", "UPDATE", "DELETE"])
        .describe(
          "Tipo de operação: 'UPDATE' (atualizar campos), 'CREATE' (registrar criação no histórico), 'DELETE' (marcar como deletado)"
        ),
      changes: z
        .record(z.any())
        .describe(
          "Novos valores dos campos que estão sendo alterados. Ex: { telefone: '11-99999-9999', email: 'novo@email.com' }"
        ),
      createdBy: z
        .string()
        .uuid()
        .optional()
        .describe("ID do usuário que fez a alteração (opcional)"),
    }),
    execute: async (input) => {
      const r = await fetch(`${origin}/api/ledger/transactions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          objectId: input.objectId,
          operationType: input.operationType,
          changes: input.changes,
          createdBy: input.createdBy,
        }),
      });
      if (!r.ok) throw new Error(`ledgerTransactions:post failed: ${r.status}`);
      return await r.json();
    },
  });
