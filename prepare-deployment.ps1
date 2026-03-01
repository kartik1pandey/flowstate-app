# FlowState App - Deployment Preparation Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FlowState App - Deployment Preparation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Clean up documentation files
Write-Host "`n1. Cleaning up documentation..." -ForegroundColor Yellow
$docsToArchive = @(
    "APPLY_FIXES_NOW.md",
    "AUTH_TOKEN_FIXED.md",
    "CHAT_FIXED.md",
    "CHAT_TROUBLESHOOTING.md",
    "CHAT_UX_IMPROVEMENTS.md",
    "CODE_EXECUTION_WORKING.md",
    "CRITICAL_FIXES_AND_ANALYTICS_PLAN.md",
    "CRITICAL_FIXES_TO_APPLY.md",
    "DO_THIS_TO_FIX_EVERYTHING.md",
    "EMAIL_VERIFICATION_WORKING.md",
    "GET_ANALYTICS_WORKING_NOW.md",
    "IMPLEMENTATION_SUMMARY.md",
    "MAKE_ANALYTICS_IMPRESSIVE.md",
    "RAG_FINAL_STATUS.md",
    "RAG_IMPLEMENTATION_GUIDE.md",
    "RAG_QUICK_START.md",
    "RAG_SYSTEM_COMPLETE.md",
    "RAG_SYSTEM_WORKING.md",
    "RUN_THIS_NOW.md",
    "SIMPLE_FIX.md",
    "WORK_COMPLETED.md"
)

# Move to archive
foreach ($doc in $docsToArchive) {
    if (Test-Path $doc) {
        Move-Item $doc "archive/old-docs/" -Force
        Write-Host "   Archived: $doc" -ForegroundColor Gray
    }
}

# Step 2: Create production README
Write-Host "`n2. Creating production README..." -ForegroundColor Yellow
$readme = @"
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
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/flowstate-app.git
cd flowstate-app
\`\`\`

2. Install dependencies
\`\`\`bash
# Backend
cd backend
npm install

# Frontend
cd ../snitfront
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
# Copy example files
cp backend/.env.example backend/.env
cp snitfront/.env.example snitfront/.env.local

# Edit with your values
\`\`\`

4. Set up database
\`\`\`bash
# Run migrations in Supabase SQL Editor
# 1. COMPLETE_FIX_ALL_ISSUES.sql
# 2. add_email_verification.sql
\`\`\`

5. Start services
\`\`\`bash
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
\`\`\`

6. Visit http://localhost:3000

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
\`\`\`bash
cd snitfront
vercel --prod
\`\`\`

**Backend (Render):**
- Connect GitHub repository
- Select backend folder
- Add environment variables
- Deploy

## Environment Variables

### Backend
\`\`\`env
DATABASE_URL=your_supabase_url
JWT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
FRONTEND_URL=your_frontend_url
\`\`\`

### Frontend
\`\`\`env
NEXT_PUBLIC_API_URL=your_backend_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

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
"@

Set-Content -Path "README.md" -Value $readme
Write-Host "   Created README.md" -ForegroundColor Green

# Step 3: Check git status
Write-Host "`n3. Checking git status..." -ForegroundColor Yellow
git status --short

# Step 4: Add all changes
Write-Host "`n4. Adding all changes to git..." -ForegroundColor Yellow
git add .
Write-Host "   All changes staged" -ForegroundColor Green

# Step 5: Show what will be committed
Write-Host "`n5. Files to be committed:" -ForegroundColor Yellow
git status --short

# Step 6: Prompt for commit
Write-Host "`n6. Ready to commit!" -ForegroundColor Green
Write-Host "   Run: git commit -m 'Complete FlowState app with analytics and AI features'" -ForegroundColor Cyan
Write-Host "   Then: git push origin main" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Preparation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review changes: git status" -ForegroundColor White
Write-Host "2. Commit: git commit -m 'Your message'" -ForegroundColor White
Write-Host "3. Push: git push origin main" -ForegroundColor White
Write-Host "4. Deploy frontend: cd snitfront && vercel --prod" -ForegroundColor White
Write-Host "5. Deploy backend: Connect to Render dashboard" -ForegroundColor White
Write-Host "`nSee DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
