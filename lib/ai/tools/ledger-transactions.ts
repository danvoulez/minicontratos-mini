import { tool } from "ai";
import { z } from "zod";

export const ledgerTransactions = ({ origin }: { origin: string }) =>
  tool({
    description: "Record a transaction against a ledger object (and bump its version)",
    inputSchema: z.object({
      objectId: z.string().uuid(),
      operationType: z.enum(["CREATE","UPDATE","DELETE"]),
      changes: z.record(z.any()),
      createdBy: z.string().uuid().optional(),
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
