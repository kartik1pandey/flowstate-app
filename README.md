# FlowState - AI-Powered Cognitive Workspace

Prevent developer burnout through real-time flow state detection using Pathway streaming analytics.

## 🚀 Quick Deploy

### Frontend (Vercel)
- Root Directory: `snitfront`
- Framework: Next.js
- Build Command: `npm run build`
- Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
  NEXT_PUBLIC_PATHWAY_URL=https://your-pathway.onrender.com
  ```

### Backend (Render)
- Root Directory: `backend`
- Environment: Node
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment Variables:
  ```
  NODE_ENV=production
  PORT=3001
  DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
  JWT_SECRET=your_secret_key
  SPOTIFY_CLIENT_ID=your_client_id
  SPOTIFY_CLIENT_SECRET=your_client_secret
  SPOTIFY_REDIRECT_URI=https://your-backend.onrender.com/api/spotify/callback
  PATHWAY_API_URL=https://your-pathway.onrender.com
  FRONTEND_URL=https://your-app.vercel.app
  ```

### Pathway Engine (Render)
- Root Directory: `services/pathway_engine`
- Environment: Docker
- Dockerfile Path: `./Dockerfile`
- Environment Variables:
  ```
  PYTHONUNBUFFERED=1
  ```

## 📦 Structure

```
├── backend/          # Express.js API
├── snitfront/        # Next.js Frontend
└── services/
    └── pathway_engine/  # Pathway Analytics
```

## 🔧 Local Development

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd snitfront && npm install && npm run dev

# Pathway
docker-compose -f docker-compose-pathway.yml up
```

## 📝 License

MIT
