# Unstack Todo

A modern task management app built with React, TypeScript, and Appwrite.

## Features

- **Multi-view task organization** — Inbox, Today, Upcoming, Completed, and Trash
- **Kanban board** — Drag-and-drop task management with @dnd-kit
- **Projects & categories** — Group and organize tasks
- **Priority levels** — P1 through P4
- **Sub-tasks & comments** — Break down work, discuss in context
- **Task templates** — Save and reuse task structures
- **Reminders** — Discord DM notifications via Inngest cron
- **AI-powered suggestions** — Task generation, auto-priority, and description generation via Google Gemini
- **Authentication** — Email/password, Google OAuth, Discord OAuth
- **Dark/light theme** — System-aware with manual toggle
- **PWA** — Installable, offline-capable with Workbox
- **Keyboard shortcuts** — `N` new task, `?` help, `Cmd+K` command palette
- **Virtualized lists** — Smooth performance with large task lists

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript 5.9, Vite 7.2 |
| **Routing** | TanStack Router (file-based, lazy code-splitting) |
| **Data** | TanStack Query (caching, optimistic updates, persistence) |
| **Styling** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **Forms** | react-hook-form + Zod validation |
| **Backend** | Appwrite (auth, database, storage, functions) |
| **AI** | Google Gemini via Vercel serverless proxy |
| **Cron** | Inngest (reminders, trash purge, daily summary) |
| **Logging** | Better Stack (Logtail) |
| **CI/CD** | GitHub Actions (lint + typecheck + build) |

## Getting Started

### Prerequisites

- Node.js 18+, pnpm, and an [Appwrite](https://appwrite.io) project

### Setup

```bash
git clone https://github.com/hasnaintypes/unstack-todo.git
cd unstack-todo
pnpm install
cp .env.example .env
```

Fill in your Appwrite credentials in `.env`, then create the database collections:

```bash
pnpm setup:db
```

Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment Variables

See `.env.example` for all variables. Key groups:

| Variable | Purpose |
|----------|---------|
| `VITE_APPWRITE_*` | Appwrite client config (endpoint, project, database, collections, bucket) |
| `APPWRITE_API_KEY` | Server-side Appwrite key (setup script, Inngest functions) |
| `GEMINI_API_KEY` | Google Gemini API key (Vercel serverless only) |
| `INNGEST_SIGNING_KEY` | Inngest webhook authentication |
| `DISCORD_BOT_TOKEN` | Discord DM reminders |
| `VITE_BETTERSTACK_TOKEN` | Browser-side structured logging |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | TypeScript check + production build |
| `pnpm typecheck` | Run TypeScript compiler (no emit) |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build locally |
| `pnpm setup:db` | Create Appwrite database collections |

## API Routes

Vercel serverless functions in `api/`:

### `POST /api/ai`

Proxies requests to Google Gemini. Keeps the API key server-side.

| Action | Params | Response |
|--------|--------|----------|
| `suggest-tasks` | `projectName`, `projectDescription` | `{ title, description, priority }[]` |
| `auto-priority` | `taskTitle`, `taskDescription?` | `{ priority: 1\|2\|3\|4 }` |
| `generate-description` | `taskTitle` | `{ description: string }` |

### `POST /api/inngest`

Handles Inngest webhooks for scheduled functions:
- **check-reminders** — Every 15 min: send due reminders via Discord DM
- **daily-summary** — Hourly: generate productivity summaries
- **purge-trash** — Daily: delete trash items older than 30 days

### Local AI Development

AI features require Vercel's serverless runtime. To use them locally:

```bash
pnpm add -g vercel
vercel link
vercel env pull .env.local
vercel dev
```

Without this, AI features fall back to template-based suggestions.

## OAuth Setup

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID
2. Authorized redirect URI: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/<PROJECT_ID>`
3. Enter Client ID and Secret in Appwrite Console → Auth → Settings → Google

### Discord

1. [Discord Developer Portal](https://discord.com/developers/applications) → New Application → OAuth2
2. Redirect URL: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/discord/<PROJECT_ID>`
3. Enter Client ID and Secret in Appwrite Console → Auth → Settings → Discord

## Project Structure

```
unstack-todo/
├── api/                    # Vercel serverless functions
├── appwrite-functions/     # Appwrite cloud functions (Discord OAuth)
├── src/
│   ├── app/
│   │   ├── context/        # React context definitions
│   │   └── providers/      # Auth, task, project, category, query, theme
│   ├── config/             # Appwrite client, Zod env validation
│   ├── features/
│   │   ├── auth/           # Auth form, services, hooks
│   │   ├── tasks/          # Task CRUD, kanban, virtualized list, forms
│   │   ├── projects/       # Project management, AI task generator
│   │   ├── categories/     # Category services and hooks
│   │   ├── profile/        # Profile, security, account deletion
│   │   ├── reminders/      # Reminder settings and toggles
│   │   ├── comments/       # Task comments
│   │   ├── templates/      # Task templates
│   │   ├── onboarding/     # First-run onboarding
│   │   └── marketing/      # Landing page sections
│   ├── routes/             # TanStack Router file-based routes
│   │   ├── _protected/     # Inbox, today, upcoming, completed, trash, projects, profile, settings
│   │   └── _public/        # Auth (sign-in, sign-up), marketing (home, about, features, privacy, terms)
│   └── shared/             # UI components, hooks, lib, services
└── public/                 # Static assets
```

## License

MIT — see [LICENSE](LICENSE) for details.
