# Unstack Todo

A modern, feature-rich task management application built with React, TypeScript, and Appwrite. Unstack Todo helps you organize your tasks efficiently with a clean, intuitive interface and powerful features.

## Repository

- **GitHub**: [hasnaintypes/unstack-todo](https://github.com/hasnaintypes/unstack-todo)
- **Owner**: hasnaintypes
- **License**: MIT

## Features

### Current Features

- **Task Organization**
  - Inbox for quick task capture
  - Today view for daily focus
  - Upcoming tasks with date-based filtering
  - Completed tasks archive
  - Trash with soft delete

- **Task Management**
  - Create tasks with titles and descriptions
  - Add sub-tasks for complex projects
  - Set due dates with calendar picker
  - Assign priority levels (P1, P2, P3)
  - Categorize tasks (Personal, Work)
  - Rich text descriptions

- **User Experience**
  - Clean, modern UI with dark/light theme support
  - Responsive design for all devices
  - Smooth animations and transitions
  - Empty state illustrations
  - Keyboard shortcuts support

- **Authentication**
  - Secure user authentication via Appwrite
  - Protected routes
  - User profile management

### Planned AI Features

- **AI Task Generation**
  - Generate task breakdowns from natural language input
  - Automatic priority assignment based on task content
  - Smart deadline suggestions
  - Sub-task generation for complex tasks
  - Task categorization using machine learning

- **Intelligent Reminders**
  - WhatsApp integration for task reminders
  - Discord bot for team notifications
  - Smart reminder timing based on task priority
  - Customizable notification preferences
  - Snooze and reschedule options

- **AI-Powered Insights**
  - Productivity analytics and patterns
  - Task completion trend analysis
  - Time estimation for similar tasks
  - Smart task scheduling recommendations
  - Workload balancing suggestions

### Additional Feature Suggestions

#### Collaboration Features

- Share tasks and projects with team members
- Real-time collaboration on task lists
- Comment threads on tasks
- @mentions and notifications
- Task assignment and delegation

#### Advanced Task Management

- Recurring tasks (daily, weekly, monthly)
- Custom task templates
- Bulk task operations
- Task dependencies and blocking
- Kanban board view
- Calendar integration (Google Calendar, Outlook)

#### Productivity Enhancements

- Pomodoro timer integration
- Focus mode with distraction blocking
- Task effort estimation
- Time tracking per task
- Daily/weekly goals and streaks
- Habit tracking

#### Data & Analytics

- Export to CSV/JSON
- Backup and sync across devices
- Advanced search and filtering
- Custom tags and labels
- Saved smart filters
- Performance dashboard

## Tech Stack

### Frontend

- **React 19.2.0** - UI library with latest features
- **TypeScript 5.9** - Type safety and better DX
- **Vite 7.2** - Fast build tool and dev server
- **TanStack Router** - Type-safe routing
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Shadcn UI** - Accessible component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Beautiful icon library
- **date-fns** - Date manipulation
- **next-themes** - Dark mode support
- **Sonner** - Toast notifications

### Backend & Services

- **Appwrite 22.0** - Backend as a Service (Auth, Database, Storage)

### Recommended Additions for AI Features

#### AI & Machine Learning

- **OpenAI GPT-4** or **Anthropic Claude** - Natural language processing for task generation
- **LangChain** - LLM application framework
- **Vercel AI SDK** - Streamlined AI integration
- **Hugging Face Transformers** - Custom ML models (optional)

#### Notification Services

- **Twilio API** - WhatsApp Business API integration
- **Discord.js** - Discord bot implementation
- **Node-cron** - Scheduled task runner
- **Bull Queue** - Job queue for handling reminders

#### Backend Enhancement

- **Node.js/Express** or **Next.js API Routes** - Custom API endpoints
- **Prisma** - Type-safe ORM (if moving from Appwrite)
- **PostgreSQL** or **MongoDB** - Database for AI data
- **Redis** - Caching and session management

#### DevOps & Monitoring

- **Vercel** or **Netlify** - Frontend deployment
- **Railway** or **Render** - Backend deployment
- **Sentry** - Error tracking
- **PostHog** or **Plausible** - Analytics
- **GitHub Actions** - CI/CD pipeline

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Appwrite account and project
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/hasnaintypes/unstack-todo.git
cd unstack-todo
```

2. Install dependencies

```bash
pnpm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

4. Configure your Appwrite credentials in `.env`

```env
VITE_APPWRITE_ENDPOINT=your_endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
```

5. Start the development server

```bash
pnpm dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
pnpm build
pnpm preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | TypeScript check + production build |
| `pnpm typecheck` | Run TypeScript compiler (no emit) |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build locally |
| `pnpm setup:db` | Create Appwrite database collections |

## API Routes (Vercel Serverless Functions)

The `api/` directory contains Vercel serverless functions that run server-side. These are **not** part of the Vite client bundle.

### `POST /api/ai`

Proxies AI requests to Google Gemini, keeping the API key server-side only.

**Environment variable:** `GEMINI_API_KEY` (set in Vercel Dashboard > Settings > Environment Variables)

**Request body:**

```json
{ "action": "<action-name>", ...params }
```

**Actions:**

| Action | Params | Response |
|--------|--------|----------|
| `suggest-tasks` | `projectName`, `projectDescription` | `TaskSuggestion[]` — array of `{ title, description, priority }` |
| `auto-priority` | `taskTitle`, `taskDescription?` | `{ priority: 1\|2\|3\|4 }` |
| `generate-description` | `taskTitle` | `{ description: string }` |

**Example:**

```bash
curl -X POST https://your-app.vercel.app/api/ai \
  -H "Content-Type: application/json" \
  -d '{"action": "suggest-tasks", "projectName": "My App", "projectDescription": "A todo app"}'
```

### Local Development with AI

The AI proxy runs on Vercel, so it won't work with `pnpm dev` by default. To use AI features locally:

1. Install the Vercel CLI:
   ```bash
   pnpm add -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Pull environment variables (includes `GEMINI_API_KEY`):
   ```bash
   vercel env pull .env.local
   ```

4. Run the dev server with Vercel (serves both Vite + API routes):
   ```bash
   vercel dev
   ```

   This starts the app at `http://localhost:3000` with the `/api/ai` route working locally.

> **Note:** If you skip this, AI features gracefully fall back to template-based suggestions — no errors, just no Gemini-powered responses.

### `POST /api/inngest`

Handles Inngest webhook events for scheduled functions (reminders, daily summary).

**Environment variables:** `INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY` (set in Vercel Dashboard)

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized JavaScript origins: `https://your-app.vercel.app`
4. Add authorized redirect URI: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/<APPWRITE_PROJECT_ID>`
5. In Appwrite Console > Auth > Settings > Google, enter the Client ID and Secret

### Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications) > New Application
2. Go to OAuth2 tab, copy Client ID and reset/copy Client Secret
3. Add redirect URL: `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/discord/<APPWRITE_PROJECT_ID>`
4. In Appwrite Console > Auth > Settings > Discord, enter the Client ID and Secret

## Project Structure

```
unstack-todo/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── empty-states/ # Empty state components
│   │   ├── layout/       # Layout components
│   │   └── auth/         # Authentication components
│   ├── routes/           # TanStack Router routes
│   │   ├── _protected/   # Protected routes
│   │   └── _public/      # Public routes
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and configs
│   ├── services/         # API services
│   └── assets/           # Static assets
├── public/               # Public assets
└── ...config files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [ ] Implement AI task generation
- [ ] WhatsApp reminder integration
- [ ] Discord bot for notifications
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Mobile applications
- [ ] Collaboration features
- [ ] Calendar integrations
- [ ] Analytics dashboard
- [ ] Browser extension

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern React and TypeScript
- UI components from Shadcn UI and Radix UI
- Icons from Lucide React
- Backend powered by Appwrite

---

**Built with care by hasnaintypes**
