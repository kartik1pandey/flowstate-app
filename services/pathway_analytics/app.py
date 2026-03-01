"""
Real-Time Analytics with Pathway
Monitors sessions and provides live insights
"""

import os
from dotenv import load_dotenv
import logging
from flask import Flask, request, jsonify
from collections import defaultdict
from datetime import datetime, timedelta
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Configuration
DATA_DIR = os.getenv("ANALYTICS_DATA_DIR", "/app/analytics_data")
HOST = os.getenv("ANALYTICS_HOST", "0.0.0.0")
PORT = int(os.getenv("ANALYTICS_PORT", "8003"))

os.makedirs(DATA_DIR, exist_ok=True)

logger.info(f"🚀 Starting Real-Time Analytics Service")
logger.info(f"📂 Data directory: {DATA_DIR}")
logger.info(f"🌐 Server: {HOST}:{PORT}")

# Create Flask app
app = Flask(__name__)

# In-memory store for real-time data
session_data = defaultdict(list)
user_patterns = defaultdict(dict)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'active_users': len(session_data),
        'total_sessions': sum(len(sessions) for sessions in session_data.values())
    })

@app.route('/v1/ingest', methods=['POST'])
def ingest_session():
    """Ingest session data for real-time analysis"""
    try:
        data = request.json
        user_id = data.get('userId')
        session = data.get('session')
        
        if not user_id or not session:
            return jsonify({'error': 'userId and session required'}), 400
        
        # Store session
        session_data[user_id].append({
            **session,
            'ingested_at': datetime.now().isoformat()
        })
        
        # Keep only last 100 sessions per user
        if len(session_data[user_id]) > 100:
            session_data[user_id] = session_data[user_id][-100:]
        
        # Update patterns
        update_user_patterns(user_id)
        
        logger.info(f"📊 Ingested session for user {user_id}")
        
        return jsonify({
            'status': 'ingested',
            'user_id': user_id,
            'total_sessions': len(session_data[user_id])
        })
        
    except Exception as e:
        logger.error(f"Ingest error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/v1/live-stats/<user_id>', methods=['GET'])
def get_live_stats(user_id):
    """Get real-time statistics for a user"""
    try:
        sessions = session_data.get(user_id, [])
        
        if not sessions:
            return jsonify({
                'user_id': user_id,
                'message': 'No session data available',
                'stats': {}
            })
        
        # Calculate live stats
        recent_sessions = [s for s in sessions if is_recent(s, hours=24)]
        
        stats = {
            'total_sessions': len(sessions),
            'sessions_today': len(recent_sessions),
            'current_streak': calculate_streak(sessions),
            'avg_focus_today': calculate_avg_focus(recent_sessions),
            'total_time_today': sum(s.get('duration', 0) for s in recent_sessions),
            'productivity_score': calculate_productivity_score(recent_sessions),
            'momentum': calculate_momentum(sessions),
            'patterns': user_patterns.get(user_id, {})
        }
        
        return jsonify({
            'user_id': user_id,
            'stats': stats,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Live stats error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/v1/predictions/<user_id>', methods=['GET'])
def get_predictions(user_id):
    """Get predictive insights for a user"""
    try:
        sessions = session_data.get(user_id, [])
        
        if len(sessions) < 5:
            return jsonify({
                'user_id': user_id,
                'message': 'Need more sessions for predictions',
                'predictions': {}
            })
        
        predictions = {
            'next_best_time': predict_next_best_time(sessions),
            'expected_focus': predict_focus_score(sessions),
            'burnout_risk': calculate_burnout_risk(sessions),
            'recommended_break': calculate_break_recommendation(sessions),
            'optimal_session_length': predict_optimal_duration(sessions)
        }
        
        return jsonify({
            'user_id': user_id,
            'predictions': predictions,
            'confidence': 'high' if len(sessions) >= 20 else 'medium',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Predictions error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/v1/alerts/<user_id>', methods=['GET'])
def get_alerts(user_id):
    """Get real-time alerts and warnings"""
    try:
        sessions = session_data.get(user_id, [])
        alerts = []
        
        if not sessions:
            return jsonify({'user_id': user_id, 'alerts': []})
        
        recent = [s for s in sessions if is_recent(s, hours=24)]
        
        # Check for burnout signs
        if len(recent) > 8:
            alerts.append({
                'type': 'warning',
                'priority': 'high',
                'message': 'High session count today. Consider taking breaks.',
                'action': 'Schedule rest time'
            })
        
        # Check for declining focus
        if len(recent) >= 3:
            recent_focus = [s.get('focusScore', 0) for s in recent[-3:]]
            if all(recent_focus[i] > recent_focus[i+1] for i in range(len(recent_focus)-1)):
                alerts.append({
                    'type': 'warning',
                    'priority': 'medium',
                    'message': 'Focus declining. Time for a break?',
                    'action': 'Take 15-minute break'
                })
        
        # Check for long session
        if recent and recent[-1].get('duration', 0) > 7200:  # 2 hours
            alerts.append({
                'type': 'info',
                'priority': 'low',
                'message': 'Long session detected. Great focus!',
                'action': 'Keep it up'
            })
        
        # Check for consistency
        streak = calculate_streak(sessions)
        if streak >= 7:
            alerts.append({
                'type': 'success',
                'priority': 'low',
                'message': f'Amazing! {streak}-day streak!',
                'action': 'Celebrate your consistency'
            })
        
        return jsonify({
            'user_id': user_id,
            'alerts': alerts,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Alerts error: {e}")
        return jsonify({'error': str(e)}), 500

# Helper functions

def is_recent(session, hours=24):
    """Check if session is within last N hours"""
    try:
        session_time = datetime.fromisoformat(session.get('startTime', '').replace('Z', '+00:00'))
        return datetime.now() - session_time.replace(tzinfo=None) < timedelta(hours=hours)
    except:
        return False

def calculate_avg_focus(sessions):
    """Calculate average focus score"""
    if not sessions:
        return 0
    scores = [s.get('focusScore', 0) for s in sessions]
    return sum(scores) / len(scores) if scores else 0

def calculate_streak(sessions):
    """Calculate consecutive days with sessions"""
    if not sessions:
        return 0
    
    dates = set()
    for session in sessions:
        try:
            date = datetime.fromisoformat(session.get('startTime', '').replace('Z', '+00:00')).date()
            dates.add(date)
        except:
            continue
    
    if not dates:
        return 0
    
    sorted_dates = sorted(dates, reverse=True)
    streak = 1
    
    for i in range(len(sorted_dates) - 1):
        if (sorted_dates[i] - sorted_dates[i + 1]).days == 1:
            streak += 1
        else:
            break
    
    return streak

def calculate_productivity_score(sessions):
    """Calculate overall productivity score (0-100)"""
    if not sessions:
        return 0
    
    avg_focus = calculate_avg_focus(sessions)
    session_count = len(sessions)
    total_time = sum(s.get('duration', 0) for s in sessions)
    
    # Weighted score
    focus_weight = 0.5
    count_weight = 0.3
    time_weight = 0.2
    
    focus_score = avg_focus
    count_score = min(session_count * 10, 100)  # Max at 10 sessions
    time_score = min((total_time / 3600) * 20, 100)  # Max at 5 hours
    
    return (focus_score * focus_weight + 
            count_score * count_weight + 
            time_score * time_weight)

def calculate_momentum(sessions):
    """Calculate productivity momentum (increasing/decreasing)"""
    if len(sessions) < 4:
        return 'neutral'
    
    recent = sessions[-4:]
    first_half_avg = calculate_avg_focus(recent[:2])
    second_half_avg = calculate_avg_focus(recent[2:])
    
    diff = second_half_avg - first_half_avg
    
    if diff > 5:
        return 'increasing'
    elif diff < -5:
        return 'decreasing'
    else:
        return 'stable'

def update_user_patterns(user_id):
    """Update user patterns based on session data"""
    sessions = session_data.get(user_id, [])
    
    if len(sessions) < 3:
        return
    
    # Analyze patterns
    hourly_performance = defaultdict(list)
    
    for session in sessions:
        try:
            hour = datetime.fromisoformat(session.get('startTime', '').replace('Z', '+00:00')).hour
            focus = session.get('focusScore', 0)
            hourly_performance[hour].append(focus)
        except:
            continue
    
    # Find best hours
    best_hours = []
    for hour, scores in hourly_performance.items():
        if len(scores) >= 2:
            avg = sum(scores) / len(scores)
            best_hours.append({'hour': hour, 'avg_focus': avg})
    
    best_hours.sort(key=lambda x: x['avg_focus'], reverse=True)
    
    user_patterns[user_id] = {
        'best_hours': best_hours[:3],
        'total_sessions': len(sessions),
        'last_updated': datetime.now().isoformat()
    }

def predict_next_best_time(sessions):
    """Predict next best time for a session"""
    if len(sessions) < 5:
        return {'hour': 9, 'confidence': 'low'}
    
    hourly_performance = defaultdict(list)
    
    for session in sessions:
        try:
            hour = datetime.fromisoformat(session.get('startTime', '').replace('Z', '+00:00')).hour
            focus = session.get('focusScore', 0)
            hourly_performance[hour].append(focus)
        except:
            continue
    
    best_hour = 9
    best_avg = 0
    
    for hour, scores in hourly_performance.items():
        avg = sum(scores) / len(scores)
        if avg > best_avg:
            best_avg = avg
            best_hour = hour
    
    return {
        'hour': best_hour,
        'expected_focus': round(best_avg, 1),
        'confidence': 'high' if len(hourly_performance[best_hour]) >= 3 else 'medium'
    }

def predict_focus_score(sessions):
    """Predict expected focus score for next session"""
    if len(sessions) < 3:
        return 70
    
    recent = sessions[-5:]
    avg = calculate_avg_focus(recent)
    
    return round(avg, 1)

def calculate_burnout_risk(sessions):
    """Calculate burnout risk (low/medium/high)"""
    recent = [s for s in sessions if is_recent(s, hours=168)]  # Last week
    
    if not recent:
        return 'low'
    
    # Check session count
    if len(recent) > 35:  # More than 5 per day
        return 'high'
    elif len(recent) > 21:  # More than 3 per day
        return 'medium'
    
    # Check declining focus
    if len(recent) >= 5:
        first_half = calculate_avg_focus(recent[:len(recent)//2])
        second_half = calculate_avg_focus(recent[len(recent)//2:])
        
        if second_half < first_half - 10:
            return 'medium'
    
    return 'low'

def calculate_break_recommendation(sessions):
    """Recommend break duration"""
    recent = [s for s in sessions if is_recent(s, hours=4)]
    
    if not recent:
        return {'duration': 5, 'reason': 'Standard break'}
    
    total_time = sum(s.get('duration', 0) for s in recent)
    
    if total_time > 7200:  # 2 hours
        return {'duration': 15, 'reason': 'Long work period'}
    elif total_time > 3600:  # 1 hour
        return {'duration': 10, 'reason': 'Moderate work period'}
    else:
        return {'duration': 5, 'reason': 'Short work period'}

def predict_optimal_duration(sessions):
    """Predict optimal session duration"""
    if len(sessions) < 5:
        return 45  # Default 45 minutes
    
    # Find duration with best focus
    duration_performance = defaultdict(list)
    
    for session in sessions:
        duration_minutes = (session.get('duration', 0) // 60)
        focus = session.get('focusScore', 0)
        
        # Bucket durations
        if duration_minutes < 30:
            bucket = 25
        elif duration_minutes < 50:
            bucket = 45
        elif duration_minutes < 70:
            bucket = 60
        else:
            bucket = 90
        
        duration_performance[bucket].append(focus)
    
    best_duration = 45
    best_avg = 0
    
    for duration, scores in duration_performance.items():
        if len(scores) >= 2:
            avg = sum(scores) / len(scores)
            if avg > best_avg:
                best_avg = avg
                best_duration = duration
    
    return best_duration

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("🚀 Real-Time Analytics Server Starting")
    logger.info(f"📍 Endpoint: http://{HOST}:{PORT}")
    logger.info("=" * 60)
    
    # Run Flask server
    app.run(host=HOST, port=PORT, debug=False)
