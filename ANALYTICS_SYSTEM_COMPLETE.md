# Advanced Analytics System - Complete ✅

## Overview

A comprehensive analytics system with AI-powered insights, personalized schedules, and real-time monitoring using Pathway.

## Features Implemented

### 1. AI-Powered Insights (`/api/analytics-insights/insights`)

**What it provides:**
- Personalized productivity insights based on 30 days of data
- AI-generated recommendations using Groq LLM
- Pattern analysis (best hours, best days, optimal duration)
- Actionable suggestions with priority levels

**Example insights:**
- "🌟 Excellent focus! You're maintaining high concentration levels."
- "⏰ Your peak performance is around 14:00. Schedule important work then."
- "⏱️ Your sweet spot is 52-minute sessions. Stick to this duration."

### 2. Productivity Trends (`/api/analytics-insights/trends`)

**What it tracks:**
- Daily statistics over 30 days
- Focus score trends (improving/declining)
- Session count patterns
- Total time spent
- Best performing day

**Metrics:**
- Improvement rate (percentage change)
- Average focus score
- Total sessions
- Momentum (increasing/stable/decreasing)

### 3. Personalized Schedule (`/api/analytics-insights/schedule`)

**What it generates:**
- Week-by-week optimal schedule
- Best times for deep work based on historical performance
- Recommended session durations
- Confidence levels (high/medium/low)

**Schedule format:**
```json
{
  "monday": [
    { "time": "9:00", "duration": 45, "type": "deep-work", "confidence": "high" }
  ],
  "tuesday": [...],
  ...
}
```

### 4. Real-Time Analytics Service (Pathway-powered)

**Port:** 8003

**Endpoints:**

#### `/v1/ingest` (POST)
Ingest session data for real-time analysis
```json
{
  "userId": "user-id",
  "session": {
    "startTime": "2026-03-01T10:00:00Z",
    "duration": 2700,
    "focusScore": 85,
    "sessionType": "code"
  }
}
```

#### `/v1/live-stats/<user_id>` (GET)
Get real-time statistics:
- Sessions today
- Current streak
- Average focus today
- Productivity score (0-100)
- Momentum (increasing/stable/decreasing)

#### `/v1/predictions/<user_id>` (GET)
Get predictive insights:
- Next best time for session
- Expected focus score
- Burnout risk (low/medium/high)
- Recommended break duration
- Optimal session length

#### `/v1/alerts/<user_id>` (GET)
Get real-time alerts:
- Burnout warnings
- Declining focus alerts
- Streak celebrations
- Long session notifications

## Frontend Features

### Three Main Tabs

#### 1. Overview Tab
- Summary cards (total sessions, avg focus, total time, improvement rate)
- 30-day trend chart (visual bar chart)
- Best day highlight
- Animated transitions

#### 2. AI Insights Tab
- AI-generated insights with emoji indicators
- Personalized recommendations (high/medium priority)
- Peak hours display
- Best days of week
- Pattern analysis

#### 3. Optimal Schedule Tab
- Week-by-week schedule view
- Confidence indicators
- Session timing and duration
- Schedule tips and best practices

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐             │
│  │ Overview │  │ Insights │  │   Schedule   │             │
│  └──────────┘  └──────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express)                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │  /api/analytics-insights/insights                   │    │
│  │  /api/analytics-insights/trends                     │    │
│  │  /api/analytics-insights/schedule                   │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Pattern Analysis + AI (Groq)                       │    │
│  │  - Hourly performance                               │    │
│  │  - Day of week analysis                             │    │
│  │  - Optimal duration calculation                     │    │
│  │  - AI insight generation                            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Real-Time Analytics (Pathway)                   │
│                    Port: 8003                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Live Stats, Predictions, Alerts                    │    │
│  │  - In-memory session tracking                       │    │
│  │  - Streak calculation                               │    │
│  │  - Burnout detection                                │    │
│  │  - Momentum analysis                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Real-Time Analytics Service
```bash
docker-compose -f docker-compose-analytics.yml up -d --build
```

### 3. Start Frontend
```bash
cd snitfront
npm run dev
```

### 4. Access Analytics
Navigate to: `http://localhost:3000/analytics`

## API Examples

### Get Insights
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/analytics-insights/insights
```

### Get Trends
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/analytics-insights/trends?days=30
```

### Get Schedule
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/analytics-insights/schedule
```

### Ingest Real-Time Data
```bash
curl -X POST http://localhost:8003/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "session": {
      "startTime": "2026-03-01T10:00:00Z",
      "duration": 2700,
      "focusScore": 85
    }
  }'
```

### Get Live Stats
```bash
curl http://localhost:8003/v1/live-stats/user-123
```

### Get Predictions
```bash
curl http://localhost:8003/v1/predictions/user-123
```

### Get Alerts
```bash
curl http://localhost:8003/v1/alerts/user-123
```

## Key Algorithms

### 1. Pattern Analysis
- Groups sessions by hour of day
- Calculates average focus per hour
- Identifies top 3 performing hours
- Analyzes day-of-week patterns

### 2. Optimal Duration Finder
- Buckets sessions into duration ranges (15-30, 30-45, 45-60, 60-90, 90+)
- Calculates average focus per bucket
- Returns middle value of best-performing bucket

### 3. Productivity Score (0-100)
```
score = (avg_focus * 0.5) + 
        (min(session_count * 10, 100) * 0.3) + 
        (min(total_hours * 20, 100) * 0.2)
```

### 4. Burnout Risk
- High: >35 sessions per week
- Medium: >21 sessions per week OR declining focus >10 points
- Low: Normal activity levels

### 5. Streak Calculation
- Counts consecutive days with at least one session
- Resets on first day without activity

## Benefits

1. **Data-Driven Decisions**: Make scheduling decisions based on actual performance data
2. **Personalized Recommendations**: AI analyzes your unique patterns
3. **Real-Time Monitoring**: Track productivity as it happens
4. **Burnout Prevention**: Early warnings when overworking
5. **Optimal Scheduling**: Work during your peak performance hours
6. **Continuous Improvement**: Track trends and improvement over time

## Future Enhancements

- [ ] Integration with calendar apps
- [ ] Team analytics and comparisons
- [ ] Advanced ML models for predictions
- [ ] Mobile app with push notifications
- [ ] Gamification and achievements
- [ ] Export reports (PDF/CSV)

## Files Created

### Backend
- `backend/src/routes/analytics-insights.ts` - Main analytics routes
- Updated `backend/src/server.ts` - Route registration

### Frontend
- `snitfront/app/analytics/page.tsx` - Enhanced analytics page

### Real-Time Service
- `services/pathway_analytics/app.py` - Flask service
- `services/pathway_analytics/Dockerfile` - Container config
- `services/pathway_analytics/requirements.txt` - Dependencies
- `services/pathway_analytics/.env` - Environment config
- `docker-compose-analytics.yml` - Docker compose

## Status: ✅ FULLY OPERATIONAL

All features tested and working. Ready for production use!
