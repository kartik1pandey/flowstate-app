# ⚡ SIMPLE FIX - Get Analytics Working in 3 Minutes

## The Issue
Analytics page redirects to login = You're not signed in

## The Fix

### Step 1: Start Services (if not running)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd snitfront
npm run dev
```

Wait for both to say "ready" or "compiled successfully"

### Step 2: Sign In

1. Open: http://localhost:3000
2. Click "Sign In"
3. Enter your email and password
4. Click "Sign In"

**Don't have account?** Click "Sign Up" first

### Step 3: Visit Analytics

After signing in, go to:
- http://localhost:3000/spaces/code-analytics

### Step 4: Generate Data

Click the "Generate Sample Data" button on the page

Wait 10 seconds, then you'll see analytics!

---

## That's It!

The redirect happens because the page checks if you're signed in. Once you sign in, it works.

---

## Quick Test

Run this script to test everything:
```powershell
.\test-auth-and-analytics.ps1
```

It will:
- Check if services are running
- Help you sign in
- Test analytics
- Generate sample data

---

## Still Redirecting?

Try this:
1. Open browser console (F12)
2. Type: `localStorage.clear()`
3. Press Enter
4. Refresh page
5. Sign in again

---

**That's all! Just sign in and the analytics will work.** 🚀
