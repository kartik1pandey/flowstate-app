# 🚨 Critical Fixes & Analytics Implementation Plan

## Part 1: Fix Critical Errors (MUST DO FIRST)

### Error 1: UUID Error - "invalid input syntax for type uuid: '7'"

**Problem**: Old JWT token contains ID "7" instead of UUID

**Solution**: Clear old tokens and re-login

**Action**:
1. Clear browser localStorage
2. Sign out and sign in again
3. New JWT token will have proper UUID

**For Users**:
```javascript
// Add this to frontend to clear old tokens
localStorage.removeItem('token');
localStorage.removeItem('user');
// Then redirect to login
```

---

### Error 2: Missing Column - "triggers" does not exist

**Problem**: Database missing `triggers` and `breakers` columns in flow_sessions table

**Solution**: Run updated SQL script

**Action**:
1. Go to: https://supabase.com/dashboard/project/iwxzitpuuwuixvbzkxfh/sql/new
2. Copy content from `FIX_PRODUCTION_DATABASE.sql` (UPDATED VERSION)
3. Paste and click "Run"
4. This will add:
   - `triggers TEXT[]` column
   - `breakers TEXT[]` column
   - Missing indexes

---

### Error 3: Connection Timeout

**Problem**: Database connection timing out

**Solution**: Check connection string and pooler settings

**Action**:
1. Verify `DATABASE_URL` uses Supabase pooler (port 6543)
2. Correct format:
   ```
   postgresql://postgres.iwxzitpuuwuixvbzkxfh:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```
3. NOT the direct connection (port 5432)

---

## Part 2: Analytics Implementation with Pathway

### Overview

We'll create a comprehensive analytics system that:
1. Generates random sample data for testing
2. Uses Pathway for real-time stream processing
3. Provides meaningful insights for code and whiteboard sessions
4. Compatible with Python 3.11

### Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   Backend API   │─────▶│  PostgreSQL  │
│  (Express.js)   │      │  (Supabase)  │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│  Pathway Engine │
│  (Python 3.11)  │
│  Real-time      │
│  Analytics      │
└─────────────────┘
```

### Pathway Implementation

Based on Pathway documentation and templates, we'll implement:

1. **Real-time Data Ingestion**
   - CSV streaming connector
   - JSON streaming connector
   - Automatic updates

2. **Stream Processing**
   - Windowed aggregations
   - Real-time metrics calculation
   - Pattern detection

3. **Analytics Outputs**
   - Flow score trends
   - Productivity patterns
   - Distraction analysis
   - Burnout risk indicators

---

## Part 3: Implementation Steps

### Step 1: Fix Database (5 min)

```bash
# Run updated SQL script in Supabase
# This adds missing columns and indexes
```

### Step 2: Clear Old Tokens (2 min)

Add token cleanup to frontend:

```typescript
// snitfront/lib/auth-cleanup.ts
export function clearOldTokens() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      // If ID is not a UUID, clear it
      if (decoded.id && decoded.id.length < 10) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/signin';
      }
    } catch (e) {
      // Invalid token, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}
```

### Step 3: Update Pathway Engine (30 min)

Create proper Pathway implementation following their templates:

```python
# services/pathway_engine/analytics.py
import pathway as pw
from pathway.stdlib.ml.classifiers import knn_classifier
import pandas as pd

# Define schema
class SessionEvent(pw.Schema):
    user_id: str
    session_type: str  # 'code' or 'whiteboard'
    timestamp: int
    duration: int
    focus_score: int
    distractions: int
    language: str | None
    lines_of_code: int | None
    creativity_score: int | None

# Real-time streaming input
events = pw.io.csv.read(
    './input_stream/',
    schema=SessionEvent,
    mode='streaming',
    autocommit_duration_ms=1000
)

# Windowed aggregations
windowed_stats = events.windowby(
    events.timestamp,
    window=pw.temporal.sliding(
        duration=pw.Duration('1h'),
        hop=pw.Duration('15m')
    )
).reduce(
    user_id=pw.this.user_id,
    avg_focus=pw.reducers.avg(pw.this.focus_score),
    total_sessions=pw.reducers.count(),
    total_distractions=pw.reducers.sum(pw.this.distractions),
    avg_duration=pw.reducers.avg(pw.this.duration)
)

# Pattern detection
productivity_patterns = windowed_stats.select(
    user_id=pw.this.user_id,
    productivity_level=pw.apply(
        lambda focus, dist: 'high' if focus > 80 and dist < 5 
                           else 'medium' if focus > 60 
                           else 'low',
        pw.this.avg_focus,
        pw.this.total_distractions
    ),
    burnout_risk=pw.apply(
        lambda sessions, focus: sessions > 10 and focus < 50,
        pw.this.total_sessions,
        pw.this.avg_focus
    )
)

# Output to JSON
pw.io.jsonlines.write(productivity_patterns, './output/analytics.jsonl')

# Run the pipeline
pw.run()
```

### Step 4: Create Analytics API (20 min)

```typescript
// backend/src/routes/analytics.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import FlowSession from '../models/FlowSession';

const router = express.Router();

// GET /api/analytics/overview
router.get('/overview', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Get sessions
    const sessions = await FlowSession.find({
      userId,
      startTime: { $gte: startDate, $lte: now }
    });
    
    // Calculate metrics
    const totalSessions = sessions.length;
    const avgFocusScore = sessions.reduce((sum, s) => sum + s.focusScore, 0) / totalSessions || 0;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalDistractions = sessions.reduce((sum, s) => sum + s.distractions, 0);
    
    // Code vs Whiteboard breakdown
    const codeSessions = sessions.filter(s => s.sessionType === 'code');
    const whiteboardSessions = sessions.filter(s => s.sessionType === 'whiteboard');
    
    // Language breakdown
    const languageStats = codeSessions.reduce((acc, s) => {
      const lang = s.language || 'unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Productivity trends (by day)
    const dailyTrends = sessions.reduce((acc, s) => {
      const date = s.startTime.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { sessions: 0, totalFocus: 0, totalDuration: 0 };
      }
      acc[date].sessions++;
      acc[date].totalFocus += s.focusScore;
      acc[date].totalDuration += s.duration;
      return acc;
    }, {} as Record<string, any>);
    
    const trends = Object.entries(dailyTrends).map(([date, data]) => ({
      date,
      sessions: data.sessions,
      avgFocus: Math.round(data.totalFocus / data.sessions),
      totalDuration: data.totalDuration
    }));
    
    res.json({
      overview: {
        totalSessions,
        avgFocusScore: Math.round(avgFocusScore),
        totalDuration,
        totalDistractions,
        avgSessionDuration: Math.round(totalDuration / totalSessions) || 0
      },
      breakdown: {
        code: codeSessions.length,
        whiteboard: whiteboardSessions.length
      },
      languageStats,
      trends: trends.sort((a, b) => a.date.localeCompare(b.date)),
      topLanguages: Object.entries(languageStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([lang, count]) => ({ language: lang, sessions: count }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
```

### Step 5: Update Frontend Analytics (30 min)

Create comprehensive analytics dashboards for both code and whiteboard.

---

## Part 4: Testing Plan

### Test 1: Database Fix
```bash
# After running SQL script
# Try to generate sample data
curl -X POST http://localhost:3001/api/generate-sample-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 20}'
```

### Test 2: Pathway Engine
```bash
# Test Pathway script
cd services/pathway_engine
python3.11 analytics.py
```

### Test 3: Analytics API
```bash
# Test analytics endpoint
curl http://localhost:3001/api/analytics/overview?timeRange=7d \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Part 5: Deployment Checklist

- [ ] Run updated SQL script in Supabase
- [ ] Clear old JWT tokens (add cleanup code)
- [ ] Update Pathway engine with proper implementation
- [ ] Deploy backend with analytics routes
- [ ] Deploy frontend with analytics dashboards
- [ ] Test all endpoints
- [ ] Verify Pathway is processing data
- [ ] Check analytics display correctly

---

## Next Steps

1. **IMMEDIATE**: Run the updated `FIX_PRODUCTION_DATABASE.sql`
2. **IMMEDIATE**: Add token cleanup to frontend
3. **TODAY**: Implement Pathway analytics engine
4. **TODAY**: Create analytics API endpoints
5. **TODAY**: Build analytics dashboards
6. **TEST**: Verify everything works end-to-end

---

## Resources

- Pathway Docs: https://pathway.com/developers/api-docs/pathway
- Pathway Templates: https://pathway.com/developers/templates
- Pathway Python 3.11: Compatible ✅
- Real-time Streaming: Supported ✅

---

**Priority**: Fix database errors FIRST, then implement analytics.

**Time Estimate**:
- Fixes: 10 minutes
- Analytics Implementation: 2-3 hours
- Testing: 1 hour
- **Total**: ~4 hours

Let me know when you've run the SQL script and I'll provide the complete Pathway analytics implementation!
