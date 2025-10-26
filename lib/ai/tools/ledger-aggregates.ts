import { tool } from "ai";
import { z } from "zod";

type Factory = (opts: { origin: string }) => ReturnType<typeof tool>;

export const ledgerAggregates: Factory = ({ origin }) =>
  tool({
    description: "Get aggregate counters for the ledger (objects, transactions)",
    inputSchema: z.object({}),
    execute: async () => {
      const r = await fetch(`${origin}/app/(chat)/api/ledger/aggregates`);
      if (!r.ok) throw new Error(`ledgerAggregates:get failed: ${r.status}`);
      return await r.json();
    },
  });
