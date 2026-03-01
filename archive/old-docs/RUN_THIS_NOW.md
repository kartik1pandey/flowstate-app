# 🚀 RUN THIS NOW - Start Pathway and Verify

## Option 1: Automated (Recommended)

Run this single command:

```powershell
.\start-pathway-and-verify.ps1
```

This script will:
1. Check if Docker Desktop is running
2. Start Docker Desktop if needed
3. Build Pathway Docker image
4. Start Pathway container
5. Verify all services
6. Show you the status

---

## Option 2: Manual Steps

If the script doesn't work, follow these steps:

### Step 1: Start Docker Desktop (1 minute)

1. Press `Windows Key`
2. Type "Docker Desktop"
3. Click to open
4. Wait for whale icon in system tray (30-60 seconds)

### Step 2: Build and Start Pathway (3 minutes)

```powershell
# Build image
docker build -t flowstate-pathway services/pathway_engine

# Start container
docker run -d --name flowstate-pathway -p 8001:8001 flowstate-pathway

# Check if running
docker ps
```

### Step 3: Verify Pathway (30 seconds)

```powershell
# Test health endpoint
curl http://localhost:8001/

# Should return JSON with "status": "healthy"
```

---

## What to Expect

### Successful Output:

```
✅ Docker Desktop is running
✅ Pathway image built successfully
✅ Pathway container started
✅ Pathway is ready!
   Service: FlowState Pathway Analytics Engine
   Version: 2.0.0
   Python: 3.11+
```

### If You See Errors:

1. **"Docker Desktop is not running"**
   - Start Docker Desktop manually
   - Wait 60 seconds
   - Run script again

2. **"Failed to build image"**
   - Check Docker Desktop is fully started
   - Check internet connection (downloads Python packages)
   - Try: `docker build --no-cache -t flowstate-pathway services/pathway_engine`

3. **"Port 8001 already in use"**
   - Stop existing process: `netstat -ano | findstr :8001`
   - Or use different port: `docker run -d --name flowstate-pathway -p 8002:8001 flowstate-pathway`

---

## After Pathway is Running

### Test the Complete System:

```powershell
.\test-analytics.ps1
```

This will test:
- ✅ Backend health
- ✅ Pathway health  
- ✅ Generate sample data
- ✅ Analytics endpoints
- ✅ Complete integration

---

## Quick Commands

```powershell
# View Pathway logs
docker logs flowstate-pathway

# Restart Pathway
docker restart flowstate-pathway

# Stop Pathway
docker stop flowstate-pathway

# Check Pathway health
curl http://localhost:8001/
```

---

## Next Steps After Verification

1. **Start Backend** (if not running):
   ```powershell
   cd backend
   npm run dev
   ```

2. **Start Frontend** (if not running):
   ```powershell
   cd snitfront
   npm run dev
   ```

3. **Visit Analytics Pages**:
   - http://localhost:3000/spaces/code-analytics
   - http://localhost:3000/spaces/whiteboard-analytics

4. **Generate Sample Data**:
   - Click "Generate Sample Data" button on analytics pages
   - Or use the test script

---

## Troubleshooting

See `DOCKER_SETUP_GUIDE.md` for detailed troubleshooting.

Common fixes:
- Restart Docker Desktop
- Rebuild image: `docker build --no-cache -t flowstate-pathway services/pathway_engine`
- Check logs: `docker logs flowstate-pathway`

---

## Status Check

Run this to see everything:

```powershell
Write-Host "Docker:" -ForegroundColor Cyan
docker ps --filter "name=flowstate-pathway"

Write-Host "`nPathway Health:" -ForegroundColor Cyan
curl http://localhost:8001/

Write-Host "`nBackend Health:" -ForegroundColor Cyan
curl http://localhost:3001/health
```

---

**START NOW: Run `.\start-pathway-and-verify.ps1`** 🚀
