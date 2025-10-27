import { tool } from "ai";
import { z } from "zod";

export const ledgerObjects = ({ origin }: { origin: string }) =>
  tool({
    description: "Query or create ledger objects",
    inputSchema: z.object({
      op: z.enum(["get","post"]),
      typeName: z.string().optional(),
      data: z.record(z.any()).optional(),
      metadata: z.record(z.any()).optional(),
    }),
    execute: async (input) => {
      const base = origin;
      if (input.op === "get") {
        const qs = input.typeName ? `?type=${encodeURIComponent(input.typeName)}` : "";
        const r = await fetch(`${base}/api/ledger/objects${qs}`);
        if (!r.ok) throw new Error(`ledgerObjects:get failed: ${r.status}`);
        return await r.json();
      }
      if (input.op === "post") {
        const r = await fetch(`${base}/api/ledger/objects`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ typeName: input.typeName, data: input.data, metadata: input.metadata }),
        });
        if (!r.ok) throw new Error(`ledgerObjects:post failed: ${r.status}`);
        return await r.json();
      }
      throw new Error("Unsupported op for ledgerObjects");
    },
  });
