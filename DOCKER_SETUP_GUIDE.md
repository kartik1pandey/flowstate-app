# 🐳 Docker Setup and Pathway Verification Guide

## Quick Start

Run this script to start everything:
```powershell
.\start-pathway-and-verify.ps1
```

If Docker Desktop isn't running, follow the manual steps below.

---

## Manual Setup Steps

### Step 1: Start Docker Desktop

1. **Open Docker Desktop**
   - Press `Windows Key`
   - Type "Docker Desktop"
   - Click to open

2. **Wait for Docker to Start**
   - Look for the whale icon in system tray
   - Wait until it says "Docker Desktop is running"
   - This takes 30-60 seconds

3. **Verify Docker is Running**
   ```powershell
   docker --version
   docker ps
   ```
   
   Should show Docker version and running containers (may be empty).

---

### Step 2: Build Pathway Docker Image

```powershell
# Navigate to project root
cd D:\attentionapp

# Build the image (takes 2-3 minutes)
docker build -t flowstate-pathway services/pathway_engine
```

**Expected output:**
```
[+] Building 120.5s (12/12) FINISHED
 => [internal] load build definition
 => => transferring dockerfile
 => [internal] load .dockerignore
 => [internal] load metadata for docker.io/library/python:3.11-slim
 ...
 => => naming to docker.io/library/flowstate-pathway
```

---

### Step 3: Start Pathway Container

```powershell
# Stop any existing container
docker stop flowstate-pathway 2>$null
docker rm flowstate-pathway 2>$null

# Start new container
docker run -d `
    --name flowstate-pathway `
    -p 8001:8001 `
    -e INPUT_DIR=/app/input_stream `
    -e OUTPUT_DIR=/app/output `
    flowstate-pathway
```

**Expected output:**
```
<container-id>
```

---

### Step 4: Verify Pathway is Running

```powershell
# Check container status
docker ps

# Should show:
# CONTAINER ID   IMAGE                 STATUS         PORTS
# <id>           flowstate-pathway     Up X seconds   0.0.0.0:8001->8001/tcp
```

```powershell
# Check Pathway health
curl http://localhost:8001/

# Should return:
# {
#   "status": "healthy",
#   "service": "FlowState Pathway Analytics Engine",
#   "version": "2.0.0",
#   "python_version": "3.11+",
#   "streaming": true
# }
```

---

### Step 5: View Pathway Logs

```powershell
# View all logs
docker logs flowstate-pathway

# Follow logs in real-time
docker logs flowstate-pathway -f

# View last 50 lines
docker logs flowstate-pathway --tail 50
```

**Expected logs:**
```
INFO:root:🚀 Starting FlowState Pathway Analytics Engine
INFO:root:📂 Input Directory: /app/input_stream
INFO:root:📤 Output Directory: /app/output
INFO:root:🐍 Python Version: 3.11+
INFO:root:⚡ Pathway Real-time Streaming: ENABLED
INFO:root:✅ CSV streaming connector initialized
INFO:root:✅ Basic aggregations configured
INFO:root:✅ Pattern detection configured
INFO:root:✅ Output connectors configured
INFO:root:🎯 Pathway pipeline ready for real-time processing
INFO:root:🚀 Starting FastAPI server on port 8001...
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

---

## Verification Checklist

### ✅ Docker Desktop
- [ ] Docker Desktop is running
- [ ] Whale icon visible in system tray
- [ ] `docker ps` command works

### ✅ Pathway Container
- [ ] Image built successfully
- [ ] Container is running
- [ ] Port 8001 is accessible
- [ ] Health check returns success

### ✅ Pathway Endpoints
- [ ] `GET /` - Health check works
- [ ] `GET /stats` - Stats endpoint works
- [ ] No errors in logs

---

## Test Pathway Endpoints

### 1. Health Check
```powershell
curl http://localhost:8001/
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "FlowState Pathway Analytics Engine",
  "version": "2.0.0",
  "python_version": "3.11+",
  "streaming": true,
  "sessions_processed": 0,
  "events_received": 0,
  "input_dir": "/app/input_stream",
  "output_dir": "/app/output"
}
```

### 2. System Stats
```powershell
curl http://localhost:8001/stats
```

**Expected Response:**
```json
{
  "total_sessions_processed": 0,
  "total_events_received": 0,
  "active_users": 0,
  "streaming_active": true,
  "python_version": "3.11+",
  "pathway_version": "0.13.0+"
}
```

### 3. Ingest Test Session
```powershell
$body = @{
    user_id = "test-user-123"
    session_type = "code"
    timestamp = (Get-Date).ToString("o")
    duration = 3600
    focus_score = 85
    quality_score = 90
    distractions = 3
    language = "typescript"
    lines_of_code = 150
    creativity_score = 0
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8001/ingest/session" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

**Expected Response:**
```json
{
  "status": "accepted",
  "session_id": null,
  "message": "Session data ingested successfully",
  "csv_file": "/app/input_stream/session_1_<timestamp>.csv",
  "pathway_processing": true
}
```

---

## Common Issues and Solutions

### Issue 1: Docker Desktop Not Starting

**Symptoms:**
```
ERROR: failed to connect to the docker API
```

**Solution:**
1. Open Docker Desktop manually
2. Wait 30-60 seconds
3. Check system tray for whale icon
4. Try `docker ps` again

### Issue 2: Port 8001 Already in Use

**Symptoms:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:8001: bind: address already in use
```

**Solution:**
```powershell
# Find process using port 8001
netstat -ano | findstr :8001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port
docker run -d --name flowstate-pathway -p 8002:8001 flowstate-pathway
```

### Issue 3: Container Exits Immediately

**Symptoms:**
```
docker ps  # Shows no container
docker ps -a  # Shows container with "Exited" status
```

**Solution:**
```powershell
# Check logs for errors
docker logs flowstate-pathway

# Common fixes:
# 1. Rebuild image
docker build --no-cache -t flowstate-pathway services/pathway_engine

# 2. Check Python dependencies
docker run -it flowstate-pathway python --version

# 3. Run interactively to see errors
docker run -it --rm -p 8001:8001 flowstate-pathway
```

### Issue 4: Pathway Not Responding

**Symptoms:**
```
curl: (7) Failed to connect to localhost port 8001
```

**Solution:**
```powershell
# Check if container is running
docker ps

# Check logs
docker logs flowstate-pathway --tail 50

# Restart container
docker restart flowstate-pathway

# Wait 10 seconds and try again
Start-Sleep -Seconds 10
curl http://localhost:8001/
```

---

## Docker Commands Reference

### Container Management
```powershell
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start container
docker start flowstate-pathway

# Stop container
docker stop flowstate-pathway

# Restart container
docker restart flowstate-pathway

# Remove container
docker rm flowstate-pathway

# Remove container (force)
docker rm -f flowstate-pathway
```

### Logs and Debugging
```powershell
# View logs
docker logs flowstate-pathway

# Follow logs
docker logs flowstate-pathway -f

# Last 50 lines
docker logs flowstate-pathway --tail 50

# Execute command in container
docker exec -it flowstate-pathway bash

# Inspect container
docker inspect flowstate-pathway
```

### Image Management
```powershell
# List images
docker images

# Remove image
docker rmi flowstate-pathway

# Build image
docker build -t flowstate-pathway services/pathway_engine

# Build without cache
docker build --no-cache -t flowstate-pathway services/pathway_engine
```

---

## Integration with Backend

Once Pathway is running, update your backend `.env`:

```env
PATHWAY_API_URL=http://localhost:8001
```

Then restart your backend:
```powershell
cd backend
npm run dev
```

---

## Integration Testing

After Pathway is running, test the complete flow:

```powershell
# Run the complete test script
.\test-analytics.ps1
```

This will test:
1. Backend health
2. Pathway health
3. Generate sample data
4. Analytics endpoints
5. Pathway integration

---

## Production Deployment

For production (Render), Pathway is already deployed at:
```
https://flowstate-app-1.onrender.com
```

Update backend production environment:
```env
PATHWAY_API_URL=https://flowstate-app-1.onrender.com
```

---

## Monitoring

### Check Container Health
```powershell
# Container status
docker ps --filter "name=flowstate-pathway"

# Resource usage
docker stats flowstate-pathway

# Inspect details
docker inspect flowstate-pathway
```

### Check Pathway Metrics
```powershell
# System stats
curl http://localhost:8001/stats

# Health check
curl http://localhost:8001/
```

---

## Cleanup

To completely remove Pathway:

```powershell
# Stop and remove container
docker stop flowstate-pathway
docker rm flowstate-pathway

# Remove image
docker rmi flowstate-pathway

# Remove all unused Docker resources
docker system prune -a
```

---

## Next Steps

After Pathway is running:

1. ✅ Pathway container running
2. ⬜ Start backend: `cd backend && npm run dev`
3. ⬜ Start frontend: `cd snitfront && npm run dev`
4. ⬜ Run tests: `.\test-analytics.ps1`
5. ⬜ Visit analytics pages
6. ⬜ Generate sample data
7. ⬜ Verify analytics display

---

## Quick Reference

| Service | Port | URL | Status Check |
|---------|------|-----|--------------|
| Pathway | 8001 | http://localhost:8001 | `curl http://localhost:8001/` |
| Backend | 3001 | http://localhost:3001 | `curl http://localhost:3001/health` |
| Frontend | 3000 | http://localhost:3000 | Open in browser |

---

**For automated setup, run: `.\start-pathway-and-verify.ps1`**
