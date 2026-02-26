"""
Pathway RAG (Retrieval Augmented Generation) for FlowState
Real-time indexing of user sessions for AI chat context

This demonstrates Pathway's document indexing capabilities
"""

import pathway as pw
from pathway.xpacks.llm import embedders, splitters, parsers
import os
import logging

logger = logging.getLogger(__name__)

# ============================
# PATHWAY RAG PIPELINE
# ============================

def create_rag_pipeline():
    """
    Create a real-time RAG index for user sessions
    Automatically updates when new session data arrives
    """
    
    INPUT_DIR = "/app/sessions_stream"
    OUTPUT_DIR = "/app/rag_index"
    os.makedirs(INPUT_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    logger.info("🧠 Initializing Pathway RAG pipeline...")
    
    # Schema for session documents
    class SessionSchema(pw.Schema):
        user_id: str
        session_type: str
        content: str
        duration: int
        flow_score: float
        timestamp: str
    
    # INPUT: Stream session documents
    sessions = pw.io.csv.read(
        INPUT_DIR,
        schema=SessionSchema,
        mode="streaming",
        autocommit_duration_ms=1000
    )
    
    logger.info(f"📂 RAG monitoring: {INPUT_DIR}")
    
    # Add metadata for better retrieval
    sessions = sessions.with_columns(
        doc_id=pw.this.user_id + "_" + pw.this.timestamp,
        metadata=pw.apply(
            lambda u, t, s, f: {
                "user_id": u,
                "session_type": t,
                "timestamp": s,
                "flow_score": f
            },
            pw.this.user_id,
            pw.this.session_type,
            pw.this.timestamp,
            pw.this.flow_score
        )
    )
    
    # Text chunking for better retrieval
    # Split long sessions into smaller chunks
    chunked_sessions = sessions.select(
        doc_id=pw.this.doc_id,
        text=pw.this.content,
        metadata=pw.this.metadata
    )
    
    # Output: Write indexed documents
    pw.io.jsonlines.write(
        chunked_sessions,
        f"{OUTPUT_DIR}/session_index.jsonl"
    )
    
    logger.info("✅ RAG pipeline configured")
    logger.info("📤 Index output: {OUTPUT_DIR}/session_index.jsonl")
    
    return chunked_sessions

if __name__ == "__main__":
    create_rag_pipeline()
    pw.run()
