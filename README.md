# FlowState - AI-Powered Productivity Platform

A comprehensive productivity platform with real-time flow state tracking, AI-powered insights, and personalized scheduling.

## Features

- 🎯 Real-time flow state tracking
- 🧠 AI-powered productivity insights
- 📊 Advanced analytics dashboard
- 📅 Personalized optimal scheduling
- 💬 AI chat assistant with RAG
- 🔥 Streak tracking and gamification
- ⚠️ Burnout prevention alerts
- 📈 30-day trend analysis
- 🎨 Multiple focus spaces (code, writing, whiteboard, etc.)

## Tech Stack

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

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- Docker (for services)

### Installation

1. Clone the repository
\\\ash
git clone https://github.com/YOUR_USERNAME/flowstate-app.git
cd flowstate-app
\\\

2. Install dependencies
\\\ash
# Backend
cd backend
npm install

# Frontend
cd ../snitfront
npm install
\\\

3. Set up environment variables
\\\ash
# Copy example files
cp backend/.env.example backend/.env
cp snitfront/.env.example snitfront/.env.local

# Edit with your values
\\\

4. Set up database
\\\ash
# Run migrations in Supabase SQL Editor
# 1. COMPLETE_FIX_ALL_ISSUES.sql
# 2. add_email_verification.sql
\\\

5. Start services
\\\ash
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
\\\

6. Visit http://localhost:3000

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
\\\ash
cd snitfront
vercel --prod
\\\

**Backend (Render):**
- Connect GitHub repository
- Select backend folder
- Add environment variables
- Deploy

## Environment Variables

### Backend
\\\env
DATABASE_URL=your_supabase_url
JWT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
FRONTEND_URL=your_frontend_url
\\\

### Frontend
\\\env
NEXT_PUBLIC_API_URL=your_backend_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\\\

## Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Analytics System](ANALYTICS_SYSTEM_COMPLETE.md)
- [Dashboard Features](DASHBOARD_AUTO_UPDATE_COMPLETE.md)
- [Complete Analytics Page](COMPLETE_ANALYTICS_PAGE.md)

## Features Overview

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

### Focus Spaces
- Code Editor with syntax highlighting
- AI Chat with RAG
- Whiteboard for brainstorming
- Reading and Writing spaces
- Music integration
- Breathing exercises

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create a GitHub issue
- Check documentation in /docs
- Review deployment guide

## Acknowledgments

- Built with Next.js and Express
- AI powered by Groq
- Database by Supabase
- Deployed on Vercel and Render

---

Made with ❤️ for productivity enthusiasts
