<a href="https://chat.vercel.ai/">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">Chat SDK</h1>
</a>

<p align="center">
    Chat SDK is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://ai-sdk.dev/docs/introduction)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports xAI (default), OpenAI, Fireworks, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) for saving chat history and user data
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication

## Model Providers

This template uses the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) to access multiple AI models through a unified interface. The default configuration includes [xAI](https://x.ai) models (`grok-2-vision-1212`, `grok-3-mini`) routed through the gateway.

### AI Gateway Authentication

**For Vercel deployments**: Authentication is handled automatically via OIDC tokens.

**For non-Vercel deployments**: You need to provide an AI Gateway API key by setting the `AI_GATEWAY_API_KEY` environment variable in your `.env.local` file.

With the [AI SDK](https://ai-sdk.dev/docs/introduction), you can also switch to direct LLM providers like [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [many more](https://ai-sdk.dev/providers/ai-sdk-providers) with just a few lines of code.

## Deploy Your Own

You can deploy your own version of the Next.js AI Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/templates/next.js/nextjs-ai-chatbot)

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000).


## Ledger additions (minimal)
- Drizzle tables in `lib/db/ledger.ts` (ObjectType, Object, Transaction, Log)
- Migration SQL added under `lib/db/migrations/` (ledger bootstrap)
- API routes:
  - `GET/POST /app/(chat)/api/ledger/objects`
  - `POST /app/(chat)/api/ledger/transactions`
  - `GET /app/(chat)/api/ledger/aggregates`

> Runs on the same `POSTGRES_URL`. Use `pnpm db:migrate` or `npm run db:migrate` depending on manager.


### Ledger logs
As rotas de ledger agora **registram logs** na tabela `Ledger_Log`:
- `ledger.objects.get` (com/sem filtro `typeName`)
- `ledger.objects.post` (e `.error`)
- `ledger.transactions.post` (e `.error`)
- `ledger.aggregates.get` (e `.error`)

Cada log inclui `level`, `message` e `context` (JSONB).



### Logs como Objetos (unificado)
- Abolimos o uso efetivo da tabela `Ledger_Log`. A partir de agora, **logs são objetos** do tipo `Log`, armazenados em `Ledger_Object` (com `objectType.name = 'Log'`).
- As rotas de ledger criam entradas `Log` automaticamente para sucesso/erro com `{ level, message, context }` em `data`.
- Vantagem: tudo fica **no mesmo mecanismo** de consulta/visualização (objects), facilitando histórico e analytics.
- Observação: a tabela `Ledger_Log` ainda existe por compatibilidade (não executamos `DROP` por política de migração segura), mas **não é mais escrita**.

## CEREBRO Memory System

CEREBRO is a comprehensive agent memory and knowledge management system implementing the Blueprint v1.1 specification.

### Features

**Memory Layers:**
- Context (15min) - Ephemeral session data
- Temporary (7 days) - Working memory with auto-promotion
- Permanent (∞) - Validated long-term knowledge

**Security (EP2):**
- RBAC with roles and permissions
- Selective AES-256-GCM encryption
- Append-only audit trail

**Quality (EP3):**
- Schema validation with auto-detection
- Memory promotion workflow
- Confidence scoring and review flags
- Semantic search

**RAG (EP4):**
- Multi-source retrieval with circuit breaker
- Fallback mechanisms and degraded mode
- Result caching and drift detection

**Auto-Optimization (EP5):**
- Real-time metrics collection
- Automatic cache tuning
- Performance monitoring and alerts
- Guardrails with automatic rollback

### API Routes

- `POST /api/memory/context` - Get working set
- `POST /api/memory/upsert` - Create/update memory
- `POST /api/memory/promote` - Promote temporary → permanent
- `POST /api/memory/search` - Search memories
- `POST /api/memory/rag` - RAG retrieval
- `GET /api/memory/metrics` - Get metrics and alerts

### AI Tools

CEREBRO provides AI SDK tools for LLM integration:
```typescript
import { cerebroTools } from "@/lib/ai/tools/cerebro";
// Tools: memory_get_workingset, memory_upsert, memory_promote, memory_search, rag_retrieve
```

See [lib/memory/README.md](lib/memory/README.md) for full documentation.
