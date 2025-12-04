# TaskFlow Pro

TaskFlow Pro is a workflow automation platform that helps product teams orchestrate tasks, manage projects, define automation rules, and collaborate with an AI assistant. The stack combines a Next.js + Tailwind frontend with an Express + MongoDB backend, JWT auth, Socket.IO real-time updates, and an OpenAI integration for conversational assistance.

## Monorepo Layout

```
backend/                  # Express API, automation services, socket gateway
frontend/                 # Next.js 14 App Router UI
README.md                 # Project-wide documentation (this file)
```

### Backend Highlights (`backend/`)

- `src/server.js` – Express bootstrap, MongoDB connection, Socket.IO server
- `src/routes/` – Auth, projects, tasks, automation, and chat routes
- `src/controllers/` – Business logic for each domain
- `src/models/` – Mongoose models (Users, Projects, Tasks, AutomationRules, ChatLogs)
- `src/services/automationService.js` – Automation rule execution engine
- `src/services/chatService.js` – OpenAI chat pipeline
- `src/services/socketService.js` – Project-scoped real-time events

### Frontend Highlights (`frontend/`)

- Next.js App Router with Tailwind styling
- `contexts/AuthContext.jsx` – JWT-aware auth state/store
- `components/dashboard/*` – Project selector, task board, automation designer, AI chat, insights
- `app/dashboard/page.jsx` – Main authenticated workspace with Socket.IO client integration

## Requirements

- Node.js 18+
- MongoDB 6+ (local or hosted)
- OpenAI API key (optional but recommended for the assistant)

## Environment Variables

Copy `.env.example` from both the `frontend` and `backend` directories and fill in values:

```
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Key variables:

- `MONGODB_URI` – connection string to MongoDB
- `JWT_SECRET` – signing secret for access tokens
- `FRONTEND_URL` – comma-separated list of allowed origins
- `OPENAI_API_KEY` – API key for OpenAI chat completions
- `NEXT_PUBLIC_API_URL` – points the frontend to the backend REST API
- `NEXT_PUBLIC_SOCKET_URL` – points the frontend to the Socket.IO server

## Install & Run Locally

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

- The backend listens on `http://localhost:4000`
- The frontend runs on `http://localhost:3000`

Log in or register, create a project, and start defining tasks and automation rules. The AI assistant becomes available after configuring `OPENAI_API_KEY`.

## Testing & Linting

```bash
# Backend linting
cd backend
npm run lint

# Frontend linting
cd frontend
npm run lint
```

## Deployment Notes

1. Provide production-ready environment variables via Vercel project settings.
2. Deploy the Next.js frontend with `npm run build && npm run start` or directly via `vercel`.
3. Host the Express API (e.g., Vercel Serverless Functions, Render, Railway) and update `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` accordingly.

## API Overview

All endpoints are scoped under `/api`.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/auth/register` | Create user account and receive JWT |
| `POST` | `/auth/login` | Authenticate and receive JWT |
| `GET` | `/auth/me` | Fetch current user profile |
| `GET` | `/projects` | List projects |
| `POST` | `/projects` | Create project |
| `PUT` | `/projects/:id` | Update project |
| `DELETE` | `/projects/:id` | Delete project |
| `GET` | `/projects/:projectId/tasks` | List project tasks |
| `POST` | `/projects/:projectId/tasks` | Create task |
| `PUT` | `/projects/:projectId/tasks/:taskId` | Update task |
| `DELETE` | `/projects/:projectId/tasks/:taskId` | Delete task |
| `GET` | `/projects/:projectId/automation` | List automation rules |
| `POST` | `/projects/:projectId/automation` | Create automation rule |
| `PUT` | `/projects/:projectId/automation/:ruleId` | Update rule |
| `DELETE` | `/projects/:projectId/automation/:ruleId` | Remove rule |
| `POST` | `/projects/:projectId/automation/execute` | Manually execute rules |
| `POST` | `/projects/:projectId/chat` | Send message to AI assistant |

All routes except `/auth/*` require `Authorization: Bearer <token>`.

## Automation Engine

Automation rules follow a simple schema:

- `trigger` – defines when the rule fires (status change, overdue, manual)
- `condition` – optional field/operator/value check
- `action` – operation to perform (`update_status`, `create_task`, `notify`)

Rules are evaluated during task updates and via the manual execution endpoint.

## Real-time Events

Socket.IO namespaces events per project room:

- `task:created`, `task:updated`, `task:deleted`
- `chat:assistant` – AI responses broadcast to connected clients

The frontend automatically joins the relevant project room and keeps task lists/chat in sync.

## License

MIT © TaskFlow Pro
