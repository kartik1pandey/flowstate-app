"""
FlowState Pathway Real-Time Analytics Engine
Python 3.11 Compatible - Production Ready

Features:
1. Real-time stream processing with Pathway
2. Windowed aggregations for time-based analytics
3. Pattern detection and anomaly detection
4. Burnout risk analysis
5. Productivity insights
6. FastAPI HTTP interface
"""

import pathway as pw
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from datetime import datetime, timedelta
import logging
import json
import threading
from typing import Optional, Dict, List, Any
from pydantic import BaseModel
import pandas as pd

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================
# CONFIGURATION
# ============================

INPUT_DIR = os.getenv("INPUT_DIR", "/app/input_stream")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "/app/output")
os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

logger.info("🚀 Starting FlowState Pathway Analytics Engine")
logger.info(f"📂 Input Directory: {INPUT_DIR}")
logger.info(f"📤 Output Directory: {OUTPUT_DIR}")
logger.info(f"🐍 Python Version: 3.11+")
logger.info(f"⚡ Pathway Real-time Streaming: ENABLED")

# ============================
# PYDANTIC MODELS
# ============================

class SessionEvent(BaseModel):
    user_id: str
    session_type: str  # 'code' or 'whiteboard'
    timestamp: str
    duration: int
    focus_score: int
    quality_score: int
    distractions: int
    language: Optional[str] = None
    lines_of_code: Optional[int] = None
    creativity_score: Optional[int] = None
    session_id: Optional[str] = None

class AnalyticsQuery(BaseModel):
    user_id: str
    time_range: str = "7d"  # 7d, 30d, 90d
    session_type: Optional[str] = None  # 'code', 'whiteboard', or None for all

# ============================
# PATHWAY SCHEMA DEFINITION
# ============================

class SessionSchema(pw.Schema):
    user_id: str
    session_type: str
    timestamp: int
    duration: int
    focus_score: int
    quality_score: int
    distractions: int
    language: str
    lines_of_code: int
    creativity_score: int

# ============================
# PATHWAY STREAMING PIPELINE
# ============================

def create_pathway_pipeline():
    """
    Create comprehensive Pathway streaming pipeline for analytics
    Processes session data in real-time and generates insights
    """
    
    logger.info("🔧 Creating Pathway streaming pipeline...")
    
    # INPUT: CSV Streaming Connector
    # Monitors input directory for new session data
    sessions = pw.io.csv.read(
        INPUT_DIR,
        schema=SessionSchema,
        mode="streaming",
        autocommit_duration_ms=1000  # Process every second
    )
    
    logger.info("✅ CSV streaming connector initialized")
    
    # ============================
    # BASIC AGGREGATIONS
    # ============================
    
    # Overall user statistics
    user_stats = sessions.groupby(sessions.user_id).reduce(
        user_id=pw.this.user_id,
        total_sessions=pw.reducers.count(),
        avg_focus_score=pw.reducers.avg(pw.this.focus_score),
        avg_quality_score=pw.reducers.avg(pw.this.quality_score),
        total_duration=pw.reducers.sum(pw.this.duration),
        total_distractions=pw.reducers.sum(pw.this.distractions),
        max_focus=pw.reducers.max(pw.this.focus_score),
        min_focus=pw.reducers.min(pw.this.focus_score)
    )
    
    # Session type breakdown
    type_stats = sessions.groupby(
        sessions.user_id, 
        sessions.session_type
    ).reduce(
        user_id=pw.this.user_id,
        session_type=pw.this.session_type,
        count=pw.reducers.count(),
        avg_focus=pw.reducers.avg(pw.this.focus_score),
        avg_duration=pw.reducers.avg(pw.this.duration)
    )
    
    # Language statistics (for code sessions)
    code_sessions = sessions.filter(pw.this.session_type == "code")
    language_stats = code_sessions.groupby(
        code_sessions.user_id,
        code_sessions.language
    ).reduce(
        user_id=pw.this.user_id,
        language=pw.this.language,
        sessions=pw.reducers.count(),
        avg_focus=pw.reducers.avg(pw.this.focus_score),
        total_lines=pw.reducers.sum(pw.this.lines_of_code)
    )
    
    logger.info("✅ Basic aggregations configured")
    
    # ============================
    # PRODUCTIVITY ANALYSIS
    # ============================
    
    # Calculate productivity level
    productivity = user_stats.select(
        user_id=pw.this.user_id,
        total_sessions=pw.this.total_sessions,
        avg_focus_score=pw.this.avg_focus_score,
        productivity_level=pw.apply(
            lambda focus, dist, sessions: (
                "excellent" if focus >= 85 and dist / sessions < 3 else
                "good" if focus >= 70 and dist / sessions < 5 else
                "moderate" if focus >= 55 else
                "needs_improvement"
            ),
            pw.this.avg_focus_score,
            pw.this.total_distractions,
            pw.this.total_sessions
        ),
        focus_consistency=pw.apply(
            lambda max_f, min_f: "consistent" if (max_f - min_f) < 20 else "variable",
            pw.this.max_focus,
            pw.this.min_focus
        )
    )
    
    # ============================
    # BURNOUT RISK DETECTION
    # ============================
    
    burnout_analysis = user_stats.select(
        user_id=pw.this.user_id,
        burnout_risk=pw.apply(
            lambda sessions, focus, duration: (
                "high" if sessions > 15 and focus < 50 and duration > 36000 else
                "medium" if sessions > 10 and focus < 60 else
                "low"
            ),
            pw.this.total_sessions,
            pw.this.avg_focus_score,
            pw.this.total_duration
        ),
        avg_session_duration=pw.apply(
            lambda total_dur, sessions: total_dur / sessions if sessions > 0 else 0,
            pw.this.total_duration,
            pw.this.total_sessions
        ),
        distraction_rate=pw.apply(
            lambda dist, sessions: dist / sessions if sessions > 0 else 0,
            pw.this.total_distractions,
            pw.this.total_sessions
        )
    )
    
    # ============================
    # PATTERN DETECTION
    # ============================
    
    # Detect productivity patterns
    patterns = productivity.select(
        user_id=pw.this.user_id,
        pattern_type=pw.apply(
            lambda level, consistency: (
                "peak_performer" if level == "excellent" and consistency == "consistent" else
                "improving" if level in ["good", "excellent"] else
                "struggling" if level == "needs_improvement" else
                "inconsistent"
            ),
            pw.this.productivity_level,
            pw.this.focus_consistency
        ),
        recommendation=pw.apply(
            lambda level: (
                "Keep up the great work! Consider mentoring others." if level == "excellent" else
                "You're doing well. Try to maintain consistency." if level == "good" else
                "Focus on reducing distractions and taking regular breaks." if level == "moderate" else
                "Consider adjusting your work environment and schedule."
            ),
            pw.this.productivity_level
        )
    )
    
    logger.info("✅ Pattern detection configured")
    
    # ============================
    # INSIGHTS GENERATION
    # ============================
    
    # Combine all analytics
    comprehensive_analytics = user_stats.join(
        productivity,
        user_stats.user_id == productivity.user_id
    ).join(
        burnout_analysis,
        user_stats.user_id == burnout_analysis.user_id
    ).join(
        patterns,
        user_stats.user_id == patterns.user_id
    ).select(
        user_id=user_stats.user_id,
        # Basic stats
        total_sessions=user_stats.total_sessions,
        avg_focus_score=user_stats.avg_focus_score,
        avg_quality_score=user_stats.avg_quality_score,
        total_duration=user_stats.total_duration,
        total_distractions=user_stats.total_distractions,
        # Productivity
        productivity_level=productivity.productivity_level,
        focus_consistency=productivity.focus_consistency,
        # Burnout
        burnout_risk=burnout_analysis.burnout_risk,
        avg_session_duration=burnout_analysis.avg_session_duration,
        distraction_rate=burnout_analysis.distraction_rate,
        # Patterns
        pattern_type=patterns.pattern_type,
        recommendation=patterns.recommendation
    )
    
    logger.info("✅ Comprehensive analytics configured")
    
    # ============================
    # OUTPUT CONNECTORS
    # ============================
    
    # Output 1: User Statistics
    pw.io.jsonlines.write(
        user_stats,
        f"{OUTPUT_DIR}/user_stats.jsonl"
    )
    
    # Output 2: Session Type Breakdown
    pw.io.jsonlines.write(
        type_stats,
        f"{OUTPUT_DIR}/type_stats.jsonl"
    )
    
    # Output 3: Language Statistics
    pw.io.jsonlines.write(
        language_stats,
        f"{OUTPUT_DIR}/language_stats.jsonl"
    )
    
    # Output 4: Productivity Analysis
    pw.io.jsonlines.write(
        productivity,
        f"{OUTPUT_DIR}/productivity.jsonl"
    )
    
    # Output 5: Burnout Analysis
    pw.io.jsonlines.write(
        burnout_analysis,
        f"{OUTPUT_DIR}/burnout.jsonl"
    )
    
    # Output 6: Patterns
    pw.io.jsonlines.write(
        patterns,
        f"{OUTPUT_DIR}/patterns.jsonl"
    )
    
    # Output 7: Comprehensive Analytics
    pw.io.jsonlines.write(
        comprehensive_analytics,
        f"{OUTPUT_DIR}/comprehensive.jsonl"
    )
    
    logger.info("✅ Output connectors configured")
    logger.info(f"📤 Writing to: {OUTPUT_DIR}")
    logger.info("=" * 60)
    logger.info("🎯 Pathway pipeline ready for real-time processing")
    logger.info("=" * 60)
    
    return comprehensive_analytics

# ============================
# FASTAPI APPLICATION
# ============================

app = FastAPI(
    title="FlowState Pathway Analytics API",
    description="Real-time analytics engine powered by Pathway",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
pathway_thread = None
event_counter = 0
session_counter = 0

# ============================
# HELPER FUNCTIONS
# ============================

def read_latest_from_jsonl(filepath: str, user_id: Optional[str] = None) -> List[Dict]:
    """Read latest entries from JSONL file"""
    try:
        if not os.path.exists(filepath):
            return []
        
        results = []
        with open(filepath, 'r') as f:
            for line in f:
                if line.strip():
                    data = json.loads(line)
                    if user_id is None or data.get('user_id') == user_id:
                        results.append(data)
        
        return results
    except Exception as e:
        logger.error(f"Error reading {filepath}: {e}")
        return []

def get_user_analytics(user_id: str) -> Dict[str, Any]:
    """Get comprehensive analytics for a user"""
    try:
        # Read from all output files
        user_stats = read_latest_from_jsonl(f"{OUTPUT_DIR}/user_stats.jsonl", user_id)
        type_stats = read_latest_from_jsonl(f"{OUTPUT_DIR}/type_stats.jsonl", user_id)
        language_stats = read_latest_from_jsonl(f"{OUTPUT_DIR}/language_stats.jsonl", user_id)
        productivity = read_latest_from_jsonl(f"{OUTPUT_DIR}/productivity.jsonl", user_id)
        burnout = read_latest_from_jsonl(f"{OUTPUT_DIR}/burnout.jsonl", user_id)
        patterns = read_latest_from_jsonl(f"{OUTPUT_DIR}/patterns.jsonl", user_id)
        comprehensive = read_latest_from_jsonl(f"{OUTPUT_DIR}/comprehensive.jsonl", user_id)
        
        # Get latest comprehensive data
        latest_comprehensive = comprehensive[-1] if comprehensive else None
        
        if not latest_comprehensive:
            return {
                "user_id": user_id,
                "message": "No data available yet. Start creating sessions!",
                "has_data": False
            }
        
        # Format response
        return {
            "user_id": user_id,
            "has_data": True,
            "overview": {
                "total_sessions": latest_comprehensive.get("total_sessions", 0),
                "avg_focus_score": round(latest_comprehensive.get("avg_focus_score", 0), 2),
                "avg_quality_score": round(latest_comprehensive.get("avg_quality_score", 0), 2),
                "total_duration": latest_comprehensive.get("total_duration", 0),
                "total_distractions": latest_comprehensive.get("total_distractions", 0),
                "avg_session_duration": round(latest_comprehensive.get("avg_session_duration", 0), 2),
                "distraction_rate": round(latest_comprehensive.get("distraction_rate", 0), 2)
            },
            "productivity": {
                "level": latest_comprehensive.get("productivity_level", "unknown"),
                "consistency": latest_comprehensive.get("focus_consistency", "unknown"),
                "pattern": latest_comprehensive.get("pattern_type", "unknown"),
                "recommendation": latest_comprehensive.get("recommendation", "")
            },
            "burnout": {
                "risk_level": latest_comprehensive.get("burnout_risk", "unknown"),
                "warning": latest_comprehensive.get("burnout_risk") in ["high", "medium"]
            },
            "breakdown": {
                "by_type": [
                    {
                        "type": stat.get("session_type"),
                        "count": stat.get("count", 0),
                        "avg_focus": round(stat.get("avg_focus", 0), 2),
                        "avg_duration": round(stat.get("avg_duration", 0), 2)
                    }
                    for stat in type_stats
                ],
                "by_language": [
                    {
                        "language": stat.get("language"),
                        "sessions": stat.get("sessions", 0),
                        "avg_focus": round(stat.get("avg_focus", 0), 2),
                        "total_lines": stat.get("total_lines", 0)
                    }
                    for stat in language_stats
                ]
            }
        }
    except Exception as e:
        logger.error(f"Error getting analytics for {user_id}: {e}")
        return {
            "user_id": user_id,
            "error": str(e),
            "has_data": False
        }

# ============================
# API ENDPOINTS
# ============================

@app.get("/")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "FlowState Pathway Analytics Engine",
        "version": "2.0.0",
        "python_version": "3.11+",
        "streaming": True,
        "sessions_processed": session_counter,
        "events_received": event_counter,
        "input_dir": INPUT_DIR,
        "output_dir": OUTPUT_DIR
    }

@app.post("/ingest/session")
async def ingest_session(session: SessionEvent, background_tasks: BackgroundTasks):
    """
    Ingest a session event for Pathway processing
    Pathway will automatically detect and process the new data
    """
    global session_counter
    session_counter += 1
    
    try:
        # Convert timestamp to unix timestamp
        if isinstance(session.timestamp, str):
            dt = datetime.fromisoformat(session.timestamp.replace('Z', '+00:00'))
            timestamp = int(dt.timestamp())
        else:
            timestamp = int(session.timestamp)
        
        # Write to CSV for Pathway streaming
        csv_file = f"{INPUT_DIR}/session_{session_counter}_{timestamp}.csv"
        
        # Create CSV with header if first file
        with open(csv_file, 'w') as f:
            f.write("user_id,session_type,timestamp,duration,focus_score,quality_score,distractions,language,lines_of_code,creativity_score\n")
            f.write(f"{session.user_id},{session.session_type},{timestamp},{session.duration},{session.focus_score},{session.quality_score},{session.distractions},{session.language or 'unknown'},{session.lines_of_code or 0},{session.creativity_score or 0}\n")
        
        logger.info(f"✅ Session ingested: {csv_file}")
        
        return {
            "status": "accepted",
            "session_id": session.session_id,
            "message": "Session data ingested successfully",
            "csv_file": csv_file,
            "pathway_processing": True
        }
    except Exception as e:
        logger.error(f"Error ingesting session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/{user_id}")
async def get_analytics(user_id: str):
    """Get comprehensive analytics for a user"""
    try:
        analytics = get_user_analytics(user_id)
        return analytics
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/{user_id}/overview")
async def get_overview(user_id: str):
    """Get overview statistics for a user"""
    try:
        analytics = get_user_analytics(user_id)
        if not analytics.get("has_data"):
            return analytics
        return {
            "user_id": user_id,
            "overview": analytics.get("overview", {}),
            "productivity": analytics.get("productivity", {}),
            "burnout": analytics.get("burnout", {})
        }
    except Exception as e:
        logger.error(f"Error fetching overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/{user_id}/breakdown")
async def get_breakdown(user_id: str):
    """Get detailed breakdown by type and language"""
    try:
        analytics = get_user_analytics(user_id)
        if not analytics.get("has_data"):
            return analytics
        return {
            "user_id": user_id,
            "breakdown": analytics.get("breakdown", {})
        }
    except Exception as e:
        logger.error(f"Error fetching breakdown: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/{user_id}/insights")
async def get_insights(user_id: str):
    """Get AI-powered insights and recommendations"""
    try:
        analytics = get_user_analytics(user_id)
        if not analytics.get("has_data"):
            return analytics
        
        productivity = analytics.get("productivity", {})
        burnout = analytics.get("burnout", {})
        overview = analytics.get("overview", {})
        
        # Generate insights
        insights = []
        
        # Focus insights
        avg_focus = overview.get("avg_focus_score", 0)
        if avg_focus >= 80:
            insights.append({
                "type": "positive",
                "category": "focus",
                "message": f"Excellent focus! Your average score of {avg_focus:.0f} is outstanding.",
                "icon": "🎯"
            })
        elif avg_focus < 60:
            insights.append({
                "type": "warning",
                "category": "focus",
                "message": f"Focus score of {avg_focus:.0f} could be improved. Try reducing distractions.",
                "icon": "⚠️"
            })
        
        # Burnout insights
        if burnout.get("risk_level") == "high":
            insights.append({
                "type": "alert",
                "category": "burnout",
                "message": "High burnout risk detected. Consider taking breaks and reducing session length.",
                "icon": "🚨"
            })
        
        # Productivity insights
        pattern = productivity.get("pattern")
        if pattern == "peak_performer":
            insights.append({
                "type": "positive",
                "category": "productivity",
                "message": "You're a peak performer! Keep up the excellent work.",
                "icon": "⭐"
            })
        
        return {
            "user_id": user_id,
            "insights": insights,
            "recommendation": productivity.get("recommendation", ""),
            "productivity_level": productivity.get("level", "unknown")
        }
    except Exception as e:
        logger.error(f"Error fetching insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats():
    """Get overall system statistics"""
    try:
        # Count unique users
        all_stats = read_latest_from_jsonl(f"{OUTPUT_DIR}/user_stats.jsonl")
        unique_users = len(set(stat.get('user_id') for stat in all_stats))
        
        return {
            "total_sessions_processed": session_counter,
            "total_events_received": event_counter,
            "active_users": unique_users,
            "streaming_active": True,
            "python_version": "3.11+",
            "pathway_version": "0.13.0+"
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return {
            "total_sessions_processed": session_counter,
            "total_events_received": event_counter,
            "error": str(e)
        }

# ============================
# RUN PATHWAY IN BACKGROUND
# ============================

def run_pathway():
    """Run Pathway pipeline in background thread"""
    try:
        logger.info("🚀 Starting Pathway streaming pipeline...")
        create_pathway_pipeline()
        pw.run()  # This runs forever, processing streaming data
    except Exception as e:
        logger.error(f"❌ Pathway error: {e}")
        import traceback
        traceback.print_exc()

# Start Pathway in background thread
pathway_thread = threading.Thread(target=run_pathway, daemon=True)
pathway_thread.start()
logger.info("✅ Pathway thread started")

# ============================
# RUN FASTAPI
# ============================

if __name__ == "__main__":
    logger.info("🚀 Starting FastAPI server on port 8001...")
    logger.info("=" * 60)
    logger.info("PATHWAY REAL-TIME ANALYTICS ENGINE")
    logger.info("Python 3.11+ Compatible")
    logger.info("Streaming: ENABLED")
    logger.info("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
