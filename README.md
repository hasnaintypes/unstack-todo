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

#### Integration & Automation
- Email to task conversion
- Import from Todoist, Trello, Asana
- Zapier/Make automation support
- API for custom integrations
- Browser extension for quick task capture
- Mobile apps (iOS/Android)

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
