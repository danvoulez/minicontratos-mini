import { tool } from "ai";
import { z } from "zod";

export const ledgerAggregates = ({ origin }: { origin: string }) =>
  tool({
    description:
      "Mostra estatísticas e resumo do Registro Universal (quantos registros de cada tipo existem). Use quando o usuário perguntar 'o que tenho salvo?', 'quantos clientes tenho?', 'me mostra um resumo', etc. Retorna uma visão geral de tudo que está registrado no sistema.",
    inputSchema: z.object({}),
    execute: async () => {
      const r = await fetch(`${origin}/api/ledger/aggregates`);
      if (!r.ok) throw new Error(`ledgerAggregates:get failed: ${r.status}`);
      return await r.json();
    },
  });
