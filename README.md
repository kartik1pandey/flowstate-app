# FlowState - AI-Powered Productivity Platform

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://flowstate-app-vnlr.vercel.app)
[![Backend](https://img.shields.io/badge/backend-render-blue)](https://flowstate-app.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A comprehensive productivity platform with real-time flow state tracking, AI-powered insights, and personalized scheduling.

## 🚀 Live Demo

- **Frontend**: https://flowstate-app-vnlr.vercel.app
- **Backend API**: https://flowstate-app.onrender.com
- **Test Account**: newuser@example.com / password123

## ✨ Features

- 🎯 Real-time flow state tracking
- 🧠 AI-powered productivity insights (Groq + Llama 3.3)
- 📊 Advanced analytics dashboard with live stats
- 📅 Personalized optimal scheduling
- 💬 AI chat assistant with RAG (Retrieval-Augmented Generation)
- 🔥 Streak tracking and gamification
- ⚠️ Burnout prevention alerts
- 📈 30-day trend analysis
- 🎨 Multiple focus spaces (code, writing, whiteboard, etc.)
- 🔐 Email verification system
- 📱 Responsive design

## 🛠 Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Chart.js

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (Supabase)
- JWT Authentication

### AI Services
- Groq LLM (Llama 3.3)
- Real-time analytics with Pathway
- RAG system for personalized insights

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- Docker (for services)

### Installation

1. Clone the repository
```bash
git clone https://github.com/kartik1pandey/flowstate-app.git
cd flowstate-app
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../snitfront
npm install
```

3. Set up environment variables
```bash
# Copy example files
cp backend/.env.example backend/.env
cp snitfront/.env.example snitfront/.env.local

# Edit with your values
```

4. Set up database
```bash
# Run migrations in Supabase SQL Editor
# 1. COMPLETE_FIX_ALL_ISSUES.sql
# 2. add_email_verification.sql
```

5. Start services
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd snitfront
npm run dev

# RAG Service (new terminal)
docker-compose -f docker-compose-rag.yml up -d

# Analytics Service (new terminal)
docker-compose -f docker-compose-analytics.yml up -d
```

6. Visit http://localhost:3000

## 🌐 Deployment

The app is currently deployed on:
- **Frontend**: Vercel - https://flowstate-app-vnlr.vercel.app
- **Backend**: Render - https://flowstate-app.onrender.com

### Updating Live Deployments

Both Vercel and Render are configured for auto-deployment from the main branch.

**To update deployments:**
```bash
git add .
git commit -m "Your update message"
git push origin main
```

**Manual redeploy:**
- Vercel: Dashboard → Deployments → Redeploy
- Render: Dashboard → Manual Deploy → Deploy latest commit

See [DEPLOY_NOW.md](DEPLOY_NOW.md) for detailed deployment instructions.

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=your_supabase_url
JWT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
FRONTEND_URL=https://flowstate-app-vnlr.vercel.app
NODE_ENV=production
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://flowstate-app.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📚 Documentation

- [Deployment Guide](DEPLOY_NOW.md)
- [Analytics System](ANALYTICS_SYSTEM_COMPLETE.md)
- [Dashboard Features](DASHBOARD_AUTO_UPDATE_COMPLETE.md)
- [Complete Analytics Page](COMPLETE_ANALYTICS_PAGE.md)

## 🎯 Features Overview

### Dashboard
- Real-time session tracking
- Auto-updating stats cards
- Flow score monitoring
- Recent sessions display

### Analytics
- AI-powered insights
- 30-day trend visualization
- Peak hours and best days analysis
- Personalized schedule recommendations
- Burnout risk detection
- Productivity score tracking
- Live stats with real-time updates
- AI predictions for optimal work times

### Focus Spaces
- Code Editor with syntax highlighting
- AI Chat with RAG
- Whiteboard for brainstorming
- Reading and Writing spaces
- Music integration
- Breathing exercises

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

For issues and questions:
- Create a GitHub issue
- Check documentation in /docs
- Review deployment guide

## 🙏 Acknowledgments

- Built with Next.js and Express
- AI powered by Groq
- Database by Supabase
- Deployed on Vercel and Render

---

Made with ❤️ for productivity enthusiasts
