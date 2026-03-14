# 🌤️ WeatherGenie

A smart weather chatbot for hobby weather enthusiasts — powered by **Claude Haiku 4.5**, a **RAG knowledge base**, and **Databricks Genie** for data analytics.

## Features

| Feature | Details |
|---|---|
| 💬 **AI Chat** | Streaming responses via Claude Haiku 4.5 |
| 📚 **Knowledge Base** | Upload PDF, DOCX, TXT, MD — RAG with pgvector |
| 📊 **Data Analytics** | Databricks Genie rooms for SQL-powered weather insights |
| 🔐 **Auth** | Email/password via Supabase Auth |
| 🌙 **Dark/Light Mode** | System-aware with manual toggle |
| 📱 **Mobile Responsive** | Full mobile layout with slide-over panels |
| 🛡️ **Admin Panel** | Document management, Genie rooms, user roles |

## Architecture

```
WeatherGenie
├── Frontend        Next.js 16 App Router (Vercel free tier)
├── Auth + DB       Supabase (PostgreSQL + pgvector + Storage)
├── LLM             Anthropic Claude Haiku 4.5
├── Embeddings      Voyage AI voyage-3-lite (1024 dims)
├── Analytics       Databricks Genie REST API (AWS)
└── Intent Router   Classifies queries → General / Research / Analytics
```

### Query Flow

```
User Message
    │
    ▼
Intent Classification (Haiku)
    │
    ├── GENERAL    → Haiku answers directly (weather expertise)
    ├── RESEARCH   → Similarity search in pgvector → Haiku + citations
    └── ANALYTICS  → Databricks Genie API → SQL result as markdown table
```

## Quick Start

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier)
- An [Anthropic](https://console.anthropic.com) API key
- A [Voyage AI](https://www.voyageai.com) API key (free tier)
- *(Optional)* Databricks workspace on AWS with Genie enabled

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/WeatherGenie.git
cd WeatherGenie
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase — copy from Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Voyage AI (embeddings)
VOYAGE_API_KEY=pa-...

# Databricks (optional — for analytics queries)
DATABRICKS_HOST=https://dbc-xxxxx.cloud.databricks.com
DATABRICKS_TOKEN=dapi...
```

### 3. Set Up Supabase

In your Supabase project, run the migrations in order:

```sql
-- In Supabase SQL Editor, run each file:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_enable_pgvector.sql
supabase/migrations/003_rls_policies.sql
supabase/migrations/004_storage_bucket.sql
```

> **Tip:** You can also use the Supabase CLI:
> ```bash
> npx supabase db push
> ```

### 4. Create Admin User

1. Start the dev server: `npm run dev`
2. Sign up at `http://localhost:3000/signup`
3. In Supabase Dashboard → Table Editor → `profiles` → update your row: set `role = 'admin'`

### 5. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

## Deploying to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/WeatherGenie)

### Manual deploy

1. Push to GitHub
2. Import the repo in [Vercel Dashboard](https://vercel.com/new)
3. Add all environment variables from `.env.example` in Vercel → Settings → Environment Variables
4. Deploy

> Vercel's free tier is generous enough for a 10-15 user hobby group (<25 requests/day).

## Cost Estimate (Monthly)

| Service | Free Tier | Est. Cost |
|---|---|---|
| Vercel | 100GB bandwidth, unlimited deployments | **$0** |
| Supabase | 500MB DB, 1GB storage, 50k auth users | **$0** |
| Voyage AI | 200M tokens/month | **$0** |
| Claude Haiku 4.5 | Paid per token | **~$1–2** |
| Databricks | Your existing AWS workspace | varies |
| **Total** | | **~$1–2/mo** |

## Admin Panel

Access at `/admin` (requires `role = 'admin'` in profiles table).

### Documents
- Upload PDF, DOCX, TXT, or Markdown files (max 10 MB each)
- Documents are automatically chunked (500 tokens, 50 overlap), embedded, and stored in pgvector
- Monitor processing status (queued → processing → ready / failed)
- Delete documents (removes chunks and storage file)

### Genie Rooms
- Configure Databricks Genie room IDs for different datasets
- Enable/disable rooms (only enabled rooms are offered to users)
- Each room maps to a Databricks Genie conversation space

### Users
- View all registered users
- Promote users to `admin` role or demote back to `user`

## Project Structure

```
src/
├── app/
│   ├── (auth)/         # Login & signup pages
│   ├── (app)/          # Protected app pages
│   │   ├── chat/       # Chat UI
│   │   └── admin/      # Admin panel
│   └── api/            # API routes (chat, conversations, documents, etc.)
├── components/
│   ├── chat/           # Chat UI components
│   ├── admin/          # Admin panel components
│   └── shared/         # Logo, ThemeToggle, UserMenu
├── hooks/              # useChat, useConversations, useDocuments, etc.
├── lib/
│   ├── anthropic/      # Claude client, prompts, intent router
│   ├── databricks/     # Genie API client
│   ├── rag/            # Extractor, chunker, retriever, pipeline
│   ├── supabase/       # Client, server, admin, middleware helpers
│   ├── voyage/         # Embeddings client
│   └── utils/          # SSE stream helpers
└── types/              # TypeScript interfaces
supabase/
└── migrations/         # SQL migrations (run in order)
```

## Tech Stack

- **[Next.js 16](https://nextjs.org)** — App Router, SSE streaming
- **[Supabase](https://supabase.com)** — Postgres, pgvector, Auth, Storage
- **[Anthropic SDK](https://github.com/anthropic-sdk/sdk-python)** — Claude Haiku 4.5
- **[Voyage AI](https://www.voyageai.com)** — voyage-3-lite embeddings
- **[shadcn/ui v4](https://ui.shadcn.com)** — Component library (base-ui)
- **[Tailwind CSS v4](https://tailwindcss.com)** — Styling
- **[next-themes](https://github.com/pacocoursey/next-themes)** — Dark/light mode
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** + **[mammoth](https://github.com/mwilliamson/mammoth.js)** — Document parsing
- **[js-tiktoken](https://github.com/dqbd/tiktoken)** — Token counting for chunking
- **[react-markdown](https://github.com/remarkjs/react-markdown)** — Markdown rendering in chat

## License

MIT — free for personal and commercial use.
