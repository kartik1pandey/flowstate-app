# 🔗 Connect All Services - Step by Step

## Your Live URLs ✅
- **Backend**: https://flowstate-app.onrender.com
- **Pathway**: https://flowstate-app-1.onrender.com
- **Frontend**: https://flowstate-app-vnlr.vercel.app

---

## 🗄️ Step 1: Setup Supabase Database (10 minutes)

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - Name: `flowstate`
   - Database Password: Generate strong password (SAVE THIS!)
   - Region: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes

### 1.2 Get Connection String
1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

### 1.3 Create Database Tables
1. Go to **SQL Editor**
2. Click "New query"
3. Paste this SQL:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  spotify_access_token TEXT,
  spotify_refresh_token TEXT,
  spotify_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Flow sessions table
CREATE TABLE flow_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(50) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER,
  focus_score INTEGER,
  quality_score INTEGER,
  code_metrics JSONB,
  whiteboard_metrics JSONB,
  writing_metrics JSONB,
  reading_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Interventions table
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  intervention_type VARCHAR(100) NOT NULL,
  trigger_reason TEXT,
  shown_at TIMESTAMP DEFAULT NOW(),
  dismissed_at TIMESTAMP,
  action_taken VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_flow_sessions_user_id ON flow_sessions(user_id);
CREATE INDEX idx_interventions_user_id ON interventions(user_id);
```

4. Click "Run"
5. Should see "Success. No rows returned"

---

## 🔧 Step 2: Configure Backend (Render)

### 2.1 Add Environment Variables
1. Go to https://render.com/dashboard
2. Click on **flowstate-app** (your backend service)
3. Click **Environment** tab
4. Add these variables (click "Add Environment Variable" for each):

```
NODE_ENV = production
PORT = 3001
DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET = (generate random 32+ chars - see below)
SPOTIFY_CLIENT_ID = (optional - from Spotify)
SPOTIFY_CLIENT_SECRET = (optional - from Spotify)
SPOTIFY_REDIRECT_URI = https://flowstate-app.onrender.com/api/spotify/callback
PATHWAY_API_URL = https://flowstate-app-1.onrender.com
FRONTEND_URL = https://flowstate-app-vnlr.vercel.app
```

### 2.2 Generate JWT Secret
Run this in PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```
Copy the output and use it as JWT_SECRET

### 2.3 Save and Redeploy
1. Click "Save Changes"
2. Backend will automatically redeploy
3. Wait 2-3 minutes

---

## 🎨 Step 3: Configure Frontend (Vercel)

### 3.1 Add Environment Variables
1. Go to https://vercel.com/dashboard
2. Click on **flowstate-app-vnlr** (your frontend)
3. Click **Settings** → **Environment Variables**
4. Add these variables:

```
NEXT_PUBLIC_API_URL = https://flowstate-app.onrender.com
NEXT_PUBLIC_PATHWAY_URL = https://flowstate-app-1.onrender.com
```

### 3.2 Redeploy
1. Go to **Deployments** tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 1-2 minutes

---

## 🔄 Step 4: Verify Pathway (Already Running)

Pathway is already running! The error you see is expected (we simplified it).

Test it:
```bash
curl https://flowstate-app-1.onrender.com/
```

Should return:
```json
{
  "status": "healthy",
  "service": "FlowState Pathway Analytics Engine"
}
```

---

## 🎵 Step 5: Setup Spotify (Optional - 5 minutes)

### 5.1 Create Spotify App
1. Go to https://developer.spotify.com/dashboard
2. Log in with Spotify account
3. Click "Create App"
4. Fill in:
   - App name: FlowState
   - App description: Cognitive workspace
   - Redirect URI: `https://flowstate-app.onrender.com/api/spotify/callback`
   - Check "Web API"
5. Click "Create"

### 5.2 Get Credentials
1. Click on your app
2. Copy "Client ID"
3. Click "Show Client Secret"
4. Copy "Client Secret"

### 5.3 Add to Backend
1. Go to Render → flowstate-app → Environment
2. Update:
   - SPOTIFY_CLIENT_ID = (your client id)
   - SPOTIFY_CLIENT_SECRET = (your client secret)
3. Save (backend will redeploy)

---

## ✅ Step 6: Test Everything

### 6.1 Test Backend
```bash
curl https://flowstate-app.onrender.com/health
```
Expected:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 6.2 Test Pathway
```bash
curl https://flowstate-app-1.onrender.com/
```
Expected:
```json
{
  "status": "healthy",
  "service": "FlowState Pathway Analytics Engine"
}
```

### 6.3 Test Frontend
1. Open: https://flowstate-app-vnlr.vercel.app
2. Should see landing page
3. Click "Sign Up"
4. Register new account
5. Should redirect to dashboard

### 6.4 Test Full Flow
1. Go to Code Editor
2. Start typing
3. Events should be tracked
4. Check Pathway stats:
```bash
curl https://flowstate-app-1.onrender.com/stats
```

---

## 🎯 Success Criteria

- ✅ Backend health check returns 200
- ✅ Pathway health check returns 200
- ✅ Frontend loads without errors
- ✅ Can register and login
- ✅ All 7 focus spaces load
- ✅ No CORS errors in browser console
- ✅ Events are being tracked (check Pathway stats)

---

## 🐛 Troubleshooting

### Frontend shows "Failed to fetch"
**Solution**: 
1. Check browser console for CORS errors
2. Verify NEXT_PUBLIC_API_URL is correct in Vercel
3. Verify FRONTEND_URL is correct in Render backend
4. Redeploy both services

### Backend shows "DATABASE_URL not defined"
**Solution**:
1. Go to Render → flowstate-app → Environment
2. Add DATABASE_URL with your Supabase connection string
3. Save (will auto-redeploy)

### Can't register/login
**Solution**:
1. Check Supabase tables were created
2. Verify DATABASE_URL is correct
3. Check backend logs on Render

### Spotify OAuth fails
**Solution**:
1. Verify redirect URI in Spotify Dashboard matches exactly:
   `https://flowstate-app.onrender.com/api/spotify/callback`
2. Check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Render
3. Try reconnecting from Music page

---

## 📊 Monitor Your Services

### Backend Logs
https://dashboard.render.com → flowstate-app → Logs

### Pathway Logs
https://dashboard.render.com → flowstate-app-1 → Logs

### Frontend Logs
https://vercel.com/dashboard → flowstate-app-vnlr → Deployments → View Function Logs

---

## 🎉 You're Live!

Your FlowState app is now fully connected and running!

**URLs**:
- Frontend: https://flowstate-app-vnlr.vercel.app
- Backend: https://flowstate-app.onrender.com
- Pathway: https://flowstate-app-1.onrender.com

**Share your app and win that hackathon! 🏆**
