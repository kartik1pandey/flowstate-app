"""
FlowState RAG System - Simplified with Groq
"""

import os
from dotenv import load_dotenv
import logging
from flask import Flask, request, jsonify
from groq import Groq

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DATA_DIR = os.getenv("RAG_DATA_DIR", "/app/rag_data")
HOST = os.getenv("RAG_HOST", "0.0.0.0")
PORT = int(os.getenv("RAG_PORT", "8002"))

os.makedirs(DATA_DIR, exist_ok=True)

logger.info(f"🚀 Starting FlowState RAG Service")
logger.info(f"📂 Data directory: {DATA_DIR}")
logger.info(f"🌐 Server: {HOST}:{PORT}")

# Initialize Groq client
groq_client = None
if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("✅ Groq client initialized")
    except Exception as e:
        logger.error(f"Failed to initialize Groq: {e}")
else:
    logger.warning("⚠️  No Groq API key found")

# Create Flask app
app = Flask(__name__)

# Store for documents
document_store = {}

def load_documents():
    """Load all documents from data directory"""
    global document_store
    document_store = {}
    
    try:
        if not os.path.exists(DATA_DIR):
            logger.warning(f"Data directory does not exist: {DATA_DIR}")
            return
            
        for filename in os.listdir(DATA_DIR):
            if filename.endswith('.md'):
                filepath = os.path.join(DATA_DIR, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    document_store[filename] = content
        logger.info(f"📚 Loaded {len(document_store)} documents")
    except Exception as e:
        logger.error(f"Error loading documents: {e}")

def find_relevant_context(query: str, top_k: int = 3) -> str:
    """Find most relevant documents for query"""
    if not document_store:
        load_documents()
    
    if not document_store:
        return "No user data available yet. Please sync your data first."
    
    # Simple keyword matching
    relevant_docs = []
    query_lower = query.lower()
    
    for filename, content in document_store.items():
        # Score based on keyword matches
        score = sum(1 for word in query_lower.split() if word in content.lower())
        if score > 0:
            relevant_docs.append((score, content))
    
    # Sort by score and take top_k
    relevant_docs.sort(reverse=True, key=lambda x: x[0])
    contexts = [doc[1] for doc in relevant_docs[:top_k]]
    
    return "\n\n---\n\n".join(contexts) if contexts else "No relevant data found in your analytics."

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'documents': len(document_store),
        'groq_configured': groq_client is not None
    })

@app.route('/v1/pw_ai_answer', methods=['POST'])
def answer_question():
    """Answer questions using RAG"""
    try:
        data = request.json
        query = data.get('prompt', '')
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        # Find relevant context
        context = find_relevant_context(query)
        
        # Generate answer using Groq
        if groq_client:
            prompt = f"""You are a personal productivity assistant for FlowState app users. 
Answer questions based on the user's coding session data, analytics, and productivity metrics.

Context from user's data:
{context}

User question: {query}

Provide a helpful, personalized response based on their actual data. 
Be specific with numbers and insights. If the data shows patterns, mention them.
Keep responses concise but informative (2-3 paragraphs max)."""
            
            try:
                # Call Groq API
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                    max_tokens=500
                )
                
                response_text = chat_completion.choices[0].message.content
                return jsonify({'response': response_text})
                
            except Exception as e:
                logger.error(f"Groq API error: {e}")
                return jsonify({'error': f'AI service error: {str(e)}'}), 500
        else:
            # Fallback without Groq
            return jsonify({
                'response': f"Based on your data:\n\n{context[:500]}...\n\nPlease configure GROQ_API_KEY for AI-powered insights."
            })
            
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/v1/pw_list_documents', methods=['GET'])
def list_documents():
    """List all documents in the store"""
    return jsonify({
        'documents': list(document_store.keys()),
        'count': len(document_store)
    })

@app.route('/reload', methods=['POST'])
def reload_documents():
    """Reload documents from disk"""
    load_documents()
    return jsonify({
        'status': 'reloaded',
        'documents': len(document_store)
    })

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("🚀 FlowState RAG Server Starting")
    logger.info(f"📍 Endpoint: http://{HOST}:{PORT}")
    logger.info(f"🤖 Groq: {'Configured' if groq_client else 'Not configured'}")
    logger.info("=" * 60)
    
    # Load documents on startup
    load_documents()
    
    # Run Flask server
    app.run(host=HOST, port=PORT, debug=False)
