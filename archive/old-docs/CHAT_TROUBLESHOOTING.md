# Chat Troubleshooting Guide

## Error: "Sorry, I encountered an error. Please try syncing your data first."

This error occurs when the RAG service is not running or not accessible. Here's how to fix it:

### Quick Fix (3 Steps)

1. **Start the RAG Service**
   ```powershell
   .\start-rag-service.ps1
   ```
   Wait 10-15 seconds for the service to initialize.

2. **Verify RAG Service is Running**
   ```powershell
   curl http://localhost:8002/v1/statistics -Method POST
   ```
   You should see a JSON response with statistics.

3. **Sync Your Data**
   - Go to http://localhost:3000/spaces/chat
   - Click the "Sync Data" button
   - Wait for success message
   - Ask your question!

### Alternative: Use Without RAG Service

The chat now has a fallback mode that works without the RAG service for basic questions:

**Questions that work without RAG:**
- "What's my average focus score?"
- "What is my focus score?"
- "Show me my average focus"

These will use the analytics API directly instead of the RAG service.

### Full Setup (If RAG Service Won't Start)

#### Prerequisites:
1. Docker Desktop installed and running
2. API keys configured in `.env`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   GROQ_API_KEY=gsk-your-key-here
   ```

#### Step-by-Step:

1. **Check Docker is Running**
   ```powershell
   docker info
   ```
   If this fails, start Docker Desktop.

2. **Configure API Keys**
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key (for embeddings)
   - Add your Groq API key (for LLM - free at https://console.groq.com)

3. **Start RAG Service**
   ```powershell
   .\start-rag-service.ps1
   ```

4. **Check Logs**
   ```powershell
   docker-compose -f docker-compose-rag.yml logs -f
   ```
   Look for "Starting FlowState RAG Server"

5. **Test RAG Service**
   ```powershell
   curl http://localhost:8002/v1/statistics -Method POST
   ```

### Common Issues

#### Issue: "Docker is not running"
**Solution:** Start Docker Desktop and wait for it to fully start.

#### Issue: "API key not found"
**Solution:** 
1. Check `.env` file has `OPENAI_API_KEY` and `GROQ_API_KEY`
2. Get free Groq API key at https://console.groq.com
3. Get OpenAI API key at https://platform.openai.com

#### Issue: "Port 8002 already in use"
**Solution:**
```powershell
# Stop existing container
docker-compose -f docker-compose-rag.yml down

# Start fresh
.\start-rag-service.ps1
```

#### Issue: "Backend not responding"
**Solution:**
```powershell
cd backend
npm run dev
```
Backend should be on port 3001.

#### Issue: "Authentication failed"
**Solution:** Sign out and sign in again to get a fresh token.

### Error Messages Explained

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| "Backend server is not responding" | Backend not running | Start backend: `cd backend && npm run dev` |
| "RAG service is not available" | RAG service not running | Start RAG: `.\start-rag-service.ps1` |
| "Authentication failed" | Token expired | Sign in again |
| "Failed to sync data" | Can't write to rag_data folder | Check folder permissions |

### Testing the System

Run this test script to verify everything:
```powershell
.\test-rag-system.ps1
```

This will:
1. Check RAG service health
2. Sync your data
3. Ask a test question
4. Show results

### Manual Testing

1. **Test Backend**
   ```powershell
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

2. **Test RAG Service**
   ```powershell
   curl http://localhost:8002/v1/statistics -Method POST
   ```
   Should return statistics JSON.

3. **Test Sync (with your token)**
   ```powershell
   curl -Method POST -Uri http://localhost:3001/api/rag/sync `
     -Headers @{"Authorization"="Bearer YOUR_TOKEN"} `
     -ContentType "application/json"
   ```

4. **Test Question (with your token)**
   ```powershell
   $body = @{question="What is my average focus score?"} | ConvertTo-Json
   curl -Method POST -Uri http://localhost:3001/api/rag/ask `
     -Headers @{"Authorization"="Bearer YOUR_TOKEN"} `
     -ContentType "application/json" `
     -Body $body
   ```

### Still Not Working?

1. **Check all services are running:**
   - Backend: http://localhost:3001/health
   - Frontend: http://localhost:3000
   - RAG: http://localhost:8002/v1/statistics

2. **Check logs:**
   ```powershell
   # Backend logs
   cd backend
   npm run dev
   
   # RAG logs
   docker-compose -f docker-compose-rag.yml logs -f
   ```

3. **Restart everything:**
   ```powershell
   # Stop RAG
   docker-compose -f docker-compose-rag.yml down
   
   # Stop backend (Ctrl+C)
   
   # Start RAG
   .\start-rag-service.ps1
   
   # Start backend
   cd backend
   npm run dev
   ```

### Need Help?

Check these files for more info:
- `RAG_IMPLEMENTATION_GUIDE.md` - Full setup guide
- `RAG_SYSTEM_COMPLETE.md` - System overview
- Backend logs in terminal
- RAG logs: `docker-compose -f docker-compose-rag.yml logs`
