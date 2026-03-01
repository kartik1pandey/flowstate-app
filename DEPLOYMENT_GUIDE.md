# Deployment Guide - FlowState App

## Pre-Deployment Checklist

### 1. Environment Variables Setup

#### Backend (.env)
```env
# Database
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT
JWT_SECRET=your_secure_jwt_secret_here

# Email (Optional - logs to console in dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Spotify (Optional)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# AI Services
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# URLs
FRONTEND_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.onrender.com

# RAG Service
RAG_API_URL=http://localhost:8002
RAG_DATA_DIR=./rag_data
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Update CORS Settings

Update `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

### 3. Update API URLs

Update `snitfront/app/analytics/page.tsx`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL || 'http://localhost:8003';
```

## GitHub Setup

### 1. Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - FlowState App with complete analytics"
```

### 2. Create .gitignore
```bash
# Already exists, verify it includes:
node_modules/
.env
.env.local
dist/
build/
.next/
*.log
```

### 3. Create GitHub Repository
```bash
# On GitHub, create a new repository named "flowstate-app"
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/flowstate-app.git
git branch -M main
git push -u origin main
```

## Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) - RECOMMENDED

#### Deploy Frontend to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy Frontend**
```bash
cd snitfront
vercel
```

3. **Configure Environment Variables in Vercel Dashboard**
- Go to your project settings
- Add all environment variables from `.env.local`
- Redeploy

4. **Custom Domain (Optional)**
- Add your domain in Vercel dashboard
- Update DNS records

#### Deploy Backend to Render

1. **Create Render Account**: https://render.com

2. **Create New Web Service**
- Connect your GitHub repository
- Select `backend` folder as root directory
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

3. **Add Environment Variables**
- Add all variables from `backend/.env`
- Make sure to use production database URL

4. **Deploy Services**
- RAG Service: Create another web service for `services/pathway_rag`
- Analytics Service: Create another web service for `services/pathway_analytics`

### Option 2: Railway (All-in-One)

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Deploy Backend**
```bash
cd backend
railway login
railway init
railway up
```

3. **Deploy Frontend**
```bash
cd snitfront
railway init
railway up
```

4. **Deploy Services**
```bash
cd services/pathway_rag
railway init
railway up

cd ../pathway_analytics
railway init
railway up
```

### Option 3: Docker + Cloud Provider

#### Build Docker Images

**Backend:**
```bash
cd backend
docker build -t flowstate-backend .
docker tag flowstate-backend your-registry/flowstate-backend:latest
docker push your-registry/flowstate-backend:latest
```

**Frontend:**
```bash
cd snitfront
docker build -t flowstate-frontend .
docker tag flowstate-frontend your-registry/flowstate-frontend:latest
docker push your-registry/flowstate-frontend:latest
```

**Services:**
```bash
cd services/pathway_rag
docker build -t flowstate-rag .
docker push your-registry/flowstate-rag:latest

cd ../pathway_analytics
docker build -t flowstate-analytics .
docker push your-registry/flowstate-analytics:latest
```

## Database Setup (Supabase)

### 1. Run Migrations

Execute these SQL files in Supabase SQL Editor:
1. `COMPLETE_FIX_ALL_ISSUES.sql` - Main schema
2. `add_email_verification.sql` - Email verification

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON flow_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
```

## Post-Deployment Steps

### 1. Test All Endpoints

```bash
# Test backend health
curl https://your-backend-url.onrender.com/health

# Test authentication
curl -X POST https://your-backend-url.onrender.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test analytics
curl https://your-backend-url.onrender.com/api/analytics-insights/insights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Frontend

- Visit your Vercel URL
- Test sign up/sign in
- Test dashboard
- Test analytics page
- Test all spaces (code, chat, etc.)

### 3. Monitor Services

- Check Render/Vercel logs
- Monitor database connections
- Check API response times
- Monitor error rates

## Environment-Specific Configuration

### Production Optimizations

**Backend (package.json):**
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
  }
}
```

**Frontend (next.config.js):**
```javascript
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-domain.com']
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }
}
```

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        # Add Render deployment steps
```

## Monitoring & Maintenance

### 1. Set Up Monitoring

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Vercel Analytics**: Performance monitoring
- **Render Metrics**: Backend monitoring

### 2. Backup Strategy

- **Database**: Enable Supabase automatic backups
- **Code**: GitHub repository
- **Environment Variables**: Store securely in password manager

### 3. Update Strategy

```bash
# Pull latest changes
git pull origin main

# Update dependencies
cd backend && npm update
cd snitfront && npm update

# Test locally
npm run dev

# Deploy
git push origin main
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL is whitelisted

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check Supabase connection pooler settings
   - Use transaction pooler (port 6543) not direct (5432)

3. **Environment Variables Not Loading**
   - Verify .env files are not in .gitignore
   - Check Vercel/Render dashboard for correct values
   - Restart services after updating

4. **Build Failures**
   - Check Node version compatibility
   - Clear node_modules and reinstall
   - Check for TypeScript errors

## Security Checklist

- [ ] All .env files in .gitignore
- [ ] JWT_SECRET is strong and unique
- [ ] Database has RLS enabled
- [ ] CORS is properly configured
- [ ] API rate limiting enabled
- [ ] HTTPS enforced
- [ ] Secrets stored in environment variables
- [ ] Regular dependency updates

## Performance Optimization

1. **Frontend**
   - Enable Next.js image optimization
   - Use dynamic imports for heavy components
   - Enable SWC minification
   - Configure caching headers

2. **Backend**
   - Enable compression middleware
   - Use connection pooling
   - Cache frequently accessed data
   - Optimize database queries

3. **Services**
   - Use Redis for caching (optional)
   - Enable CDN for static assets
   - Optimize Docker images

## Cost Estimation

### Free Tier (Development)
- Vercel: Free (Hobby plan)
- Render: Free (with limitations)
- Supabase: Free (up to 500MB)
- Total: $0/month

### Production (Recommended)
- Vercel Pro: $20/month
- Render Standard: $7/month per service × 3 = $21/month
- Supabase Pro: $25/month
- Total: ~$66/month

## Support & Resources

- **Documentation**: Check README files in each directory
- **Issues**: Create GitHub issues for bugs
- **Community**: Join Discord/Slack for support
- **Updates**: Watch GitHub repository for updates

## Quick Deploy Commands

```bash
# 1. Commit all changes
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy frontend
cd snitfront
vercel --prod

# 3. Deploy backend (via Render dashboard or CLI)
# Visit https://render.com and connect repository

# 4. Update environment variables in dashboards

# 5. Test deployment
curl https://your-backend-url.onrender.com/health
```

## Success Criteria

✅ Frontend loads without errors
✅ Backend API responds to health check
✅ Authentication works (sign up/sign in)
✅ Dashboard displays correctly
✅ Analytics page shows all features
✅ Real-time services are accessible
✅ Database connections are stable
✅ All environment variables are set

---

**Ready to deploy!** Follow the steps above and your FlowState app will be live! 🚀
