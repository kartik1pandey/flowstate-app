<div align="center">

# 🧠 FlowState

### AI-Powered Cognitive Workspace for Peak Productivity

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://flowstate-app-vnlr.vercel.app)
[![Backend API](https://img.shields.io/badge/API-online-blue?style=for-the-badge)](https://flowstate-app.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)](LICENSE)
[![Pathway](https://img.shields.io/badge/Powered%20by-Pathway-orange?style=for-the-badge)](https://pathway.com)

**Prevent developer burnout through real-time flow state detection and intelligent interventions**

[🚀 Live Demo](https://flowstate-app-vnlr.vercel.app) • [📖 Documentation](./docs) • [🐛 Report Bug](https://github.com/yourusername/flowstate/issues) • [✨ Request Feature](https://github.com/yourusername/flowstate/issues)

</div>

---

## 🎯 What is FlowState?

FlowState is an intelligent productivity platform that monitors your work patterns in real-time, detects when you're in a flow state, and provides timely interventions to prevent burnout. Built with cutting-edge streaming analytics using **Pathway**, it processes behavioral data instantly to keep you productive and healthy.

### ⚡ Quick Navigation

- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Feature Architecture Map](#-feature-architecture-map)
- [Repository Layout](#-repository-layout)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Documentation](#-documentation)

### ✨ Key Features

- **🎨 Dual Workspace Modes**
  - **Code Space**: Syntax highlighted editor with real-time flow tracking
  - **Whiteboard Space**: Creative canvas for brainstorming and visual thinking

- **📊 Real-Time Analytics**
  - Live flow score computation using Pathway streaming
  - Keystroke velocity and pattern analysis
  - Distraction detection and alerts
  - Session quality metrics

- **🧘 Smart Interventions**
  - Breathing exercises when stress detected
  - Eye rest reminders for screen fatigue
  - Posture check notifications
  - Hydration reminders

- **📈 Comprehensive Analytics**
  - Daily, weekly, and monthly flow trends
  - Language-specific productivity insights
  - Distraction pattern analysis
  - Burnout risk indicators

- **🎵 Spotify Integration**
  - Flow-optimized music recommendations
  - Automatic playlist switching based on work mode
  - Focus music curation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Code Space  │  │  Whiteboard  │  │  Analytics   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Sessions │  │ Settings │  │  Spotify │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Supabase   │  │   Pathway   │  │   Spotify   │
│ PostgreSQL  │  │  Analytics  │  │     API     │
└─────────────┘  └─────────────┘  └─────────────┘
```

### 🛠️ Tech Stack

**Frontend**

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Framer Motion
- Monaco Editor
- Excalidraw

**Backend**

- Node.js + Express
- TypeScript
- PostgreSQL (Supabase)
- JWT Authentication
- Spotify Web API

**Analytics Engine**

- **Pathway** (Real-time streaming)
- Python 3.11
- FastAPI
- Docker

---

## 🧩 Feature Architecture Map

| Feature                                     | Frontend                                                              | Backend/API                                                   | External/Engine                  |
| ------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------- |
| Authentication & profile                    | `snitfront/app/auth`                                                  | `/api/auth` (`backend/src/routes/auth.ts`)                    | JWT + PostgreSQL                 |
| Flow monitoring                             | `snitfront/hooks/useFlowMonitoring.ts`                                | `/api/sessions`, `/api/pathway/event`                         | Pathway ingestion                |
| Interventions & reminders                   | `snitfront/components/InterventionOverlay.tsx`, `ReminderManager.tsx` | `/api/interventions`, `/api/settings`                         | Pathway intervention logic       |
| Analytics dashboard                         | `snitfront/app/analytics`                                             | `/api/analytics`, `/api/pathway/flow`, `/api/pathway/metrics` | Pathway metrics pipeline         |
| Focus spaces (code/whiteboard/writing/etc.) | `snitfront/app/spaces/*`                                              | `/api/sessions`, `/api/execute`                               | Monaco, Excalidraw, runtime exec |
| AI productivity chat                        | `snitfront/app/spaces/chat`                                           | `/api/ai/chat`                                                | Groq API                         |
| Music focus assistant                       | `snitfront/app/spaces/music`                                          | `/api/spotify/*`                                              | Spotify Web API + Groq           |
| Settings & personalization                  | `snitfront/app/settings`                                              | `/api/settings`                                               | User settings model              |
| Reports/notifications                       | `snitfront/app/settings/reports`                                      | `/api/whatsapp/*` (stub), reporting routes                    | WhatsApp integration placeholder |

---

## 📁 Repository Layout

```text
flowstate-app/
├─ snitfront/                 # Main Next.js frontend
├─ backend/                   # Main Express + TypeScript API
├─ services/pathway_engine/   # Python Pathway real-time analytics engine
├─ edu-hack-class-classif/    # Separate Flask + TensorFlow engagement classifier
├─ snitback/                  # Legacy/alternate Next.js API backend surface
├─ docs/                      # Product + setup docs
└─ devdocs/                   # Repository/process docs moved from root
```

### Core runtime components

- **User Experience:** `snitfront` (spaces, dashboard, analytics, settings)
- **Primary API:** `backend` (auth, sessions, interventions, analytics, spotify, ai/ml)
- **Streaming analytics:** `services/pathway_engine` (event ingestion + flow scoring)
- **Optional ML microservice:** `edu-hack-class-classif` (image-based engagement scoring)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker (for Pathway)
- Supabase account
- Spotify Developer account (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/flowstate.git
cd flowstate
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run build
npm start
```

**Backend runs on:** `http://localhost:3001`

### 3. Setup Frontend

```bash
cd snitfront
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

### 4. Setup Pathway Engine

```bash
cd services/pathway_engine
docker build -t pathway-engine .
docker run -p 8001:8001 pathway-engine
```

**Pathway runs on:** `http://localhost:8001`

### 5. Setup Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script from `docs/setup/database-schema.sql`
3. Copy the connection string (use transaction pooler)
4. Update `DATABASE_URL` in backend `.env`

---

## 📦 Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://postgres.xxx:password@aws-xxx.pooler.supabase.com:6543/postgres

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server
PORT=3001
NODE_ENV=development

# Spotify (Optional)
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/api/spotify/callback

# Services
PATHWAY_API_URL=http://localhost:8001
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PATHWAY_URL=http://localhost:8001
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd snitfront
npm test

# Test complete system
npm run test:integration

# Test Pathway engine
curl http://localhost:8001/
```

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs) directory:

- **[Quick Start Guide](./docs/setup/QUICK_START.md)** - Get up and running in 5 minutes
- **[API Reference](./docs/api/API_REFERENCE.md)** - Complete API documentation
- **[Architecture Guide](./docs/architecture/SYSTEM_ARCHITECTURE.md)** - System design and data flow
- **[Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Contributing Guide](./devdocs/CONTRIBUTING.md)** - How to contribute to FlowState
- **[Developer Docs](./devdocs)** - Repository standards, improvement plans, and project structure notes

---

## 🚢 Deployment

### Deploy to Production

**Frontend (Vercel)**

```bash
# Connect your GitHub repo to Vercel
# Set root directory: snitfront
# Framework: Next.js
# Add environment variables from .env.example
```

**Backend (Render)**

```bash
# Create new Web Service
# Root directory: backend
# Build: npm install && npm run build
# Start: npm start
# Add environment variables
```

**Pathway (Render)**

```bash
# Create new Web Service
# Root directory: services/pathway_engine
# Environment: Docker
# Dockerfile path: ./Dockerfile
```

See [Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./devdocs/CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📊 Project Status

- ✅ **Backend**: Fully operational with PostgreSQL/Supabase
- ✅ **Frontend**: Deployed on Vercel
- ✅ **Pathway**: Real-time streaming analytics active
- ✅ **Database**: 5 tables with complete schema
- ✅ **Authentication**: JWT-based auth working
- ✅ **Spotify Integration**: OAuth flow implemented

---

## 🐛 Known Issues

- Generate sample data requires database schema update (see [Fix Guide](./docs/troubleshooting/COMMON_ISSUES.md))
- Spotify integration requires developer credentials

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Pathway](https://pathway.com)** - Real-time streaming analytics engine
- **[Supabase](https://supabase.com)** - PostgreSQL database hosting
- **[Vercel](https://vercel.com)** - Frontend hosting
- **[Render](https://render.com)** - Backend hosting
- **[Spotify](https://developer.spotify.com)** - Music API integration


## ⭐ Star History

If you find FlowState useful, please consider giving it a star! ⭐

---

<div align="center">

**Built with ❤️ by the FlowState Team**

[Website](https://flowstate-app-vnlr.vercel.app) • [Documentation](./docs) • [API](https://flowstate-app.onrender.com) • [GitHub](https://github.com/yourusername/flowstate)

</div>
