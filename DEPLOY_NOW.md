# 🚀 Deploy FlowState App - Quick Guide

## ✅ Code Pushed to GitHub Successfully!

Repository: https://github.com/kartik1pandey/flowstate-app

## Next Steps for Deployment

### 1. Deploy Frontend to Vercel (5 minutes)

#### Option A: Vercel Dashboard (Easiest)
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from GitHub: `kartik1pandey/flowstate-app`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `snitfront`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. Click "Deploy"

#### Option B: Vercel CLI
```bash
cd snitfront
npm install -g vercel
vercel login
vercel --prod
```

### 2. Deploy Backend to Render (10 minutes)

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository: `kartik1pandey/flowstate-app`
4. Configure:
   - **Name**: flowstate-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter $7/month for better performance)

5. Add Environment Variables:
   ```
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=your_secure_secret_here
   GROQ_API_KEY=your_groq_api_key
   FRONTEND_URL=https://your-vercel-url.vercel.app
   NODE_ENV=production
   PORT=3001
   ```

6. Click "Create Web Service"

### 3. Deploy RAG Service to Render (5 minutes)

1. In Render, click "New +" → "Web Service"
2. Same repository: `kartik1pandey/flowstate-app`
3. Configure:
   - **Name**: flowstate-rag
   - **Root Directory**: `services/pathway_rag`
   - **Environment**: Docker
   - **Dockerfile Path**: `services/pathway_rag/Dockerfile`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   GROQ_API_KEY=your_groq_api_key
   RAG_DATA_DIR=/app/rag_data
   RAG_HOST=0.0.0.0
   RAG_PORT=8002
   ```

5. Click "Create Web Service"

### 4. Deploy Analytics Service to Render (5 minutes)

1. In Render, click "New +" → "Web Service"
2. Same repository: `kartik1pandey/flowstate-app`
3. Configure:
   - **Name**: flowstate-analytics
   - **Root Directory**: `services/pathway_analytics`
   - **Environment**: Docker
   - **Dockerfile Path**: `services/pathway_analytics/Dockerfile`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   ANALYTICS_DATA_DIR=/app/analytics_data
   ANALYTICS_HOST=0.0.0.0
   ANALYTICS_PORT=8003
   ```

5. Click "Create Web Service"

### 5. Update Backend Environment Variables

Once all services are deployed, update backend with service URLs:

```
RAG_API_URL=https://flowstate-rag.onrender.com
ANALYTICS_API_URL=https://flowstate-analytics.onrender.com
```

### 6. Update Frontend Environment Variables

Update Vercel with backend URL:

```
NEXT_PUBLIC_API_URL=https://flowstate-backend.onrender.com
NEXT_PUBLIC_ANALYTICS_URL=https://flowstate-analytics.onrender.com
```

### 7. Setup Database (Supabase)

1. Go to https://supabase.com
2. Create new project (if not already done)
3. Go to SQL Editor
4. Run these files in order:
   - `COMPLETE_FIX_ALL_ISSUES.sql`
   - `add_email_verification.sql`

5. Get connection strings from Settings → Database
   - Use **Transaction Pooler** (port 6543) for production

### 8. Update CORS in Backend

After deployment, update `backend/src/server.ts`:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-actual-vercel-url.vercel.app'
  ],
  credentials: true
}));
```

Commit and push:
```bash
git add backend/src/server.ts
git commit -m "Update CORS for production"
git push origin main
```

Render will auto-deploy the update.

## Testing Deployment

### 1. Test Frontend
Visit: `https://your-vercel-url.vercel.app`
- Sign up with new account
- Sign in
- Check dashboard loads
- Check analytics page

### 2. Test Backend
```bash
curl https://your-backend-url.onrender.com/health
```

### 3. Test RAG Service
```bash
curl https://flowstate-rag.onrender.com/health
```

### 4. Test Analytics Service
```bash
curl https://flowstate-analytics.onrender.com/health
```

### 5. Test Full Flow
1. Sign up on frontend
2. Create a session
3. Visit analytics page
4. Check if insights load
5. Test chat with AI

## Troubleshooting

### Frontend Issues
- Check Vercel logs
- Verify environment variables
- Check browser console

### Backend Issues
- Check Render logs
- Verify database connection
- Test endpoints with curl

### Database Issues
- Check Supabase logs
- Verify connection string
- Check RLS policies

### Service Communication
- Verify all URLs are correct
- Check CORS settings
- Test with Postman/curl

## Performance Tips

### Free Tier Limitations
- Render free tier sleeps after 15 min inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading to Starter plan ($7/month) for production

### Optimization
- Enable caching in Vercel
- Use CDN for static assets
- Optimize images
- Enable compression

## Monitoring

### Set Up Monitoring
1. **Vercel Analytics**: Enable in dashboard
2. **Render Metrics**: Check service metrics
3. **Supabase Logs**: Monitor database queries
4. **Error Tracking**: Consider Sentry

### Health Checks
Create a simple monitoring script:
```bash
# check-health.sh
curl https://your-backend-url.onrender.com/health
curl https://flowstate-rag.onrender.com/health
curl https://flowstate-analytics.onrender.com/health
```

## Cost Breakdown

### Free Tier (Development)
- Vercel: Free
- Render: Free (3 services)
- Supabase: Free (500MB)
- **Total: $0/month**

### Production (Recommended)
- Vercel Pro: $20/month
- Render Starter: $7/month × 3 = $21/month
- Supabase Pro: $25/month
- **Total: $66/month**

## Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate

### Add Custom Domain to Render
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS records
4. Wait for SSL certificate

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and responding
- [ ] RAG service deployed
- [ ] Analytics service deployed
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] CORS configured
- [ ] All services communicating
- [ ] Sign up/sign in working
- [ ] Dashboard loading
- [ ] Analytics page working
- [ ] Chat AI responding
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backups enabled

## Support

If you encounter issues:
1. Check logs in Vercel/Render dashboards
2. Review DEPLOYMENT_GUIDE.md
3. Test locally first
4. Check GitHub issues

## Success! 🎉

Once all checks pass, your FlowState app is live!

**Frontend**: https://your-vercel-url.vercel.app
**Backend**: https://your-backend-url.onrender.com
**RAG**: https://flowstate-rag.onrender.com
**Analytics**: https://flowstate-analytics.onrender.com

Share your deployed app and start tracking productivity! 🚀

---

**Estimated Total Deployment Time**: 30-45 minutes

**Next Steps After Deployment**:
1. Share with users
2. Gather feedback
3. Monitor performance
4. Plan new features
5. Scale as needed
