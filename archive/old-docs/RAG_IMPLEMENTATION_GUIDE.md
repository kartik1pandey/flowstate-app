# FlowState RAG Implementation Guide

## Overview

We've implemented a Retrieval-Augmented Generation (RAG) system using Pathway that allows users to ask questions about their productivity data and get personalized AI-powered insights.

## Architecture

```
User → Frontend Chat UI → Backend API → RAG Service (Pathway) → LLM (Groq)
                                ↓
                         User Data Sync
                                ↓
                         RAG Data Directory
                                ↓
                         Vector Embeddings (OpenAI)
```

## Components

### 1. Pathway RAG Service (`services/pathway_rag/`)

- **Port**: 8002
- **Technology**: Pathway + FastAPI
- **LLM**: Groq Llama 3.1 70B (fast, free)
- **Embeddings**: OpenAI text-embedding-3-small
- **Features**:
  - Real-time document indexing
  - Vector similarity search
  - Question answering with context
  - Document summarization

### 2. Backend RAG Routes (`backend/src/routes/rag.ts`)

#### Endpoints:

- `POST /api/rag/sync` - Sync user data to RAG system
- `POST /api/rag/ask` - Ask questions using RAG
- `GET /api/rag/stats` - Get RAG service statistics
- `POST /api/rag/retrieve` - Retrieve similar documents

### 3. Frontend Chat UI (`snitfront/app/spaces/chat/page.tsx`)

- Beautiful chat interface
- Auto-sync user data on mount
- Suggested questions
- Real-time responses
- Context-aware answers

## How It Works

### Data Flow:

1. **User Data Generation**:
   - User completes coding sessions
   - Sessions stored in database
   - Analytics calculated by Pathway engine

2. **Data Sync to RAG**:
   - User clicks "Sync Data" or auto-syncs on chat page load
   - Backend generates markdown document with:
     - User statistics
     - Session breakdown
     - Language usage
     - Recent activity
     - Productivity insights
   - Document saved to `rag_data/` directory
   - Pathway automatically detects and indexes new document

3. **Question Answering**:
   - User asks question in chat
   - Question sent to RAG service
   - RAG retrieves relevant context from user's documents
   - LLM generates personalized answer based on actual data
   - Answer returned to user with context

## Setup Instructions

### Prerequisites:

- Docker Desktop installed and running
- OpenAI API key (for embeddings)
- Groq API key (for LLM - free at https://console.groq.com)

### Step 1: Configure API Keys

Update `.env` file in project root:

```env
OPENAI_API_KEY=sk-your-openai-key
GROQ_API_KEY=gsk_your-groq-key
```

### Step 2: Start RAG Service

```powershell
.\start-rag-service.ps1
```

This will:
- Build Docker image
- Start RAG service on port 8002
- Create `rag_data/` directory
- Verify service health

### Step 3: Start Backend

```powershell
cd backend
npm run dev
```

Backend will be available on port 3001.

### Step 4: Start Frontend

```powershell
cd snitfront
npm run dev
```

Frontend will be available on port 3000.

### Step 5: Use the Chat

1. Navigate to http://localhost:3000/spaces/chat
2. Click "Sync Data" to index your sessions
3. Ask questions about your productivity!

## Example Questions

- "What's my average focus score?"
- "Which programming language do I use most?"
- "How many coding sessions have I completed?"
- "What are my productivity patterns?"
- "Am I at risk of burnout?"
- "What's my total coding time?"
- "Show me my recent activity"
- "How consistent is my focus?"
- "What languages have I been learning?"

## API Examples

### Sync User Data

```bash
curl -X POST http://localhost:3001/api/rag/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Ask a Question

```bash
curl -X POST http://localhost:3001/api/rag/ask \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is my average focus score?"
  }'
```

### Get RAG Statistics

```bash
curl -X GET http://localhost:3001/api/rag/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Document Format

User data is synced as markdown documents:

```markdown
# User Productivity Profile

## User ID: user123

## Overview Statistics
- Total Sessions: 20
- Average Focus Score: 81.35/100
- Total Time Spent: 10.5 hours
- Distraction Rate: 2.5 per session

## Programming Languages Used
- JavaScript: 12 sessions, 1500 lines of code, 85.2 avg focus
- Python: 8 sessions, 800 lines of code, 77.8 avg focus

## Recent Activity (Last 10 Sessions)
...
```

## Customization

### Change LLM Model

Edit `services/pathway_rag/app.py`:

```python
llm = llms.LiteLLMChat(
    model="groq/llama-3.1-8b-instant",  # Faster, smaller model
    # or
    model="groq/mixtral-8x7b-32768",    # Larger context window
    api_key=GROQ_API_KEY,
)
```

### Change Embeddings

```python
embedder = embedders.OpenAIEmbedder(
    model="text-embedding-3-large",  # More accurate, more expensive
    api_key=OPENAI_API_KEY,
)
```

### Customize Prompts

Edit the prompt templates in `services/pathway_rag/app.py`:

```python
short_prompt_template="""
Your custom prompt here...

Context: {context}
Question: {query}
"""
```

## Troubleshooting

### RAG Service Won't Start

1. Check Docker is running: `docker info`
2. Check API keys in `.env`
3. View logs: `docker-compose -f docker-compose-rag.yml logs -f`

### No Data in Responses

1. Sync user data first: Click "Sync Data" button
2. Check `rag_data/` directory has files
3. Wait a few seconds for indexing

### Connection Refused

1. Verify RAG service is running: `curl http://localhost:8002/v1/statistics`
2. Check backend RAG_API_URL in `.env`
3. Restart services

## Performance

- **Embedding Speed**: ~1-2 seconds per document
- **Query Speed**: ~2-3 seconds per question
- **Index Update**: Real-time (< 1 second)
- **Context Window**: 6 most relevant chunks
- **Token Limit**: 400 tokens per chunk

## Cost Estimation

- **OpenAI Embeddings**: ~$0.0001 per 1K tokens
- **Groq LLM**: FREE (rate limited)
- **Typical Cost**: < $0.01 per 100 questions

## Benefits

1. **Personalized Insights**: Answers based on actual user data
2. **Real-time Updates**: New sessions automatically indexed
3. **Context-Aware**: LLM sees relevant session details
4. **Fast Responses**: Groq provides sub-second inference
5. **Cost-Effective**: Free LLM, cheap embeddings
6. **Scalable**: Pathway handles streaming data efficiently

## Next Steps

- Add more data sources (user settings, interventions, etc.)
- Implement conversation history
- Add voice input/output
- Create analytics dashboards from chat insights
- Add multi-user support with data isolation
- Implement caching for common questions

## Resources

- [Pathway Documentation](https://pathway.com/developers)
- [Pathway RAG Template](https://pathway.com/developers/templates/rag/demo-question-answering)
- [Groq API](https://console.groq.com)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
