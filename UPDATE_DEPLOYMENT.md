# Update Live Deployment - Quick Guide

## Current Deployments

- **Frontend**: https://flowstate-app-vnlr.vercel.app (Vercel)
- **Backend**: https://flowstate-app.onrender.com (Render)

## Auto-Deployment Setup

Both services are configured for automatic deployment from the `main` branch.

## How to Update

### 1. Push Changes to GitHub

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add new feature / Fix bug / Update UI"

# Push to main branch
git push origin main
```

### 2. Automatic Deployment

**Vercel (Frontend):**
- Automatically detects push to main
- Builds and deploys in ~2-3 minutes
- Check status at: https://vercel.com/dashboard

**Render (Backend):**
- Automatically detects push to main
- Builds and deploys in ~3-5 minutes
- Check status at: https://dashboard.render.com

### 3. Manual Redeploy (if needed)

**Vercel:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Redeploy" on latest deployment

**Render:**
1. Go to https://dashboard.render.com
2. Select your service
3. Click "Manual Deploy"
4. Select "Deploy latest commit"

## Environment Variables

### Update Frontend Environment Variables (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update variables:
   ```
   NEXT_PUBLIC_API_URL=https://flowstate-app.onrender.com
   NEXT_PUBLIC_ANALYTICS_URL=https://your-analytics-service.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Redeploy for changes to take effect

### Update Backend Environment Variables (Render)

1. Go to Render Dashboard → Your Service → Environment
2. Update variables:
   ```
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=your_secret
   GROQ_API_KEY=your_groq_api_key
   FRONTEND_URL=https://flowstate-app-vnlr.vercel.app
   NODE_ENV=production
   PORT=3001
   ```
3. Service will auto-restart with new variables

## Deployment Checklist

Before pushing to production:

- [ ] Test locally (`npm run dev`)
- [ ] Check for console errors
- [ ] Verify API endpoints work
- [ ] Test authentication flow
- [ ] Check analytics page loads
- [ ] Verify chat AI responds
- [ ] Test on mobile view
- [ ] Update environment variables if needed
- [ ] Commit and push to main
- [ ] Monitor deployment logs
- [ ] Test live site after deployment

## Troubleshooting

### Frontend Issues

**Build fails on Vercel:**
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Check for TypeScript errors
- Ensure environment variables are set

**Site loads but API calls fail:**
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Verify backend is running

### Backend Issues

**Build fails on Render:**
- Check build logs in Render dashboard
- Verify package.json scripts
- Check for missing dependencies
- Ensure TypeScript compiles

**API returns 500 errors:**
- Check Render logs
- Verify database connection
- Check environment variables
- Test database queries

### Database Issues

**Connection errors:**
- Verify DATABASE_URL is correct
- Use Transaction Pooler (port 6543) not direct connection
- Check Supabase service status
- Verify IP allowlist (should allow all for Render)

## Monitoring

### Check Deployment Status

**Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Check deployments
vercel ls
```

**Render:**
- Dashboard shows deployment status
- Green = healthy, Yellow = deploying, Red = error

### Check Live Services

```bash
# Test backend health
curl https://flowstate-app.onrender.com/health

# Test frontend
curl https://flowstate-app-vnlr.vercel.app
```

## Rollback

### Vercel Rollback

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"

### Render Rollback

1. Go to service dashboard
2. Click "Manual Deploy"
3. Select previous commit from dropdown
4. Click "Deploy"

## Performance Tips

### Render Free Tier

- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading to Starter ($7/month) for production

### Optimization

- Enable Vercel Analytics for monitoring
- Use Render metrics to track performance
- Monitor Supabase query performance
- Set up error tracking (Sentry)

## Quick Commands

```bash
# Check git status
git status

# View recent commits
git log --oneline -5

# Push to main
git push origin main

# Force redeploy (create empty commit)
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

## Support

If deployment fails:
1. Check logs in Vercel/Render dashboard
2. Review error messages
3. Test locally first
4. Check environment variables
5. Verify database connection
6. Review DEPLOY_NOW.md for setup

## Success Indicators

✅ Vercel shows "Ready" status
✅ Render shows "Live" status
✅ Frontend loads without errors
✅ Backend health endpoint responds
✅ Login/signup works
✅ Dashboard displays data
✅ Analytics page loads
✅ Chat AI responds

---

**Last Updated**: March 1, 2026
**Repository**: https://github.com/kartik1pandey/flowstate-app
