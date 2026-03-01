import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import FlowSession from '../models/FlowSession';
import axios from 'axios';

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/**
 * Generate AI-powered insights from user data
 */
router.get('/insights', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get last 30 days of sessions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await FlowSession.find({
      userId,
      startTime: {
        $gte: thirtyDaysAgo,
        $lte: new Date()
      }
    });

    if (sessions.length === 0) {
      return res.json({
        insights: [],
        recommendations: [],
        patterns: {},
        message: 'Not enough data yet. Complete more sessions to get insights!'
      });
    }

    // Calculate patterns
    const patterns = analyzePatterns(sessions);
    
    // Generate AI insights
    const insights = await generateAIInsights(sessions, patterns);
    
    // Generate recommendations
    const recommendations = generateRecommendations(patterns);
    
    // Generate optimal schedule
    const schedule = generateOptimalSchedule(patterns);

    res.json({
      insights,
      recommendations,
      patterns,
      schedule,
      sessionCount: sessions.length
    });
  } catch (error: any) {
    console.error('Insights error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get productivity trends
 */
router.get('/trends', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const days = parseInt(req.query.days as string) || 30;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await FlowSession.find({
      userId,
      startTime: {
        $gte: startDate,
        $lte: new Date()
      }
    });

    // Group by day
    const dailyStats = groupByDay(sessions);
    
    // Calculate trends
    const trends = calculateTrends(dailyStats);

    res.json({
      dailyStats,
      trends,
      summary: {
        totalSessions: sessions.length,
        avgFocusScore: sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / sessions.length,
        totalTime: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
        bestDay: findBestDay(dailyStats),
        improvementRate: trends.focusScoreTrend
      }
    });
  } catch (error: any) {
    console.error('Trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get personalized schedule suggestions
 */
router.get('/schedule', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sessions = await FlowSession.find({ userId });
    
    if (sessions.length < 5) {
      return res.json({
        schedule: getDefaultSchedule(),
        message: 'Using default schedule. Complete more sessions for personalized recommendations.'
      });
    }

    const patterns = analyzePatterns(sessions);
    const schedule = generateOptimalSchedule(patterns);

    res.json({
      schedule,
      basedOnSessions: sessions.length,
      confidence: sessions.length >= 20 ? 'high' : sessions.length >= 10 ? 'medium' : 'low'
    });
  } catch (error: any) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper functions

function analyzePatterns(sessions: any[]) {
  // Time of day analysis
  const hourlyPerformance: Record<number, { count: number; avgFocus: number; totalFocus: number }> = {};
  
  sessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    if (!hourlyPerformance[hour]) {
      hourlyPerformance[hour] = { count: 0, avgFocus: 0, totalFocus: 0 };
    }
    hourlyPerformance[hour].count++;
    hourlyPerformance[hour].totalFocus += session.focusScore || 0;
  });

  Object.keys(hourlyPerformance).forEach(hour => {
    const h = parseInt(hour);
    hourlyPerformance[h].avgFocus = hourlyPerformance[h].totalFocus / hourlyPerformance[h].count;
  });

  // Day of week analysis
  const dayOfWeekPerformance: Record<number, { count: number; avgFocus: number }> = {};
  
  sessions.forEach(session => {
    const day = new Date(session.startTime).getDay();
    if (!dayOfWeekPerformance[day]) {
      dayOfWeekPerformance[day] = { count: 0, avgFocus: 0 };
    }
    dayOfWeekPerformance[day].count++;
    dayOfWeekPerformance[day].avgFocus += session.focusScore || 0;
  });

  Object.keys(dayOfWeekPerformance).forEach(day => {
    const d = parseInt(day);
    dayOfWeekPerformance[d].avgFocus /= dayOfWeekPerformance[d].count;
  });

  // Session duration analysis
  const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
  const optimalDuration = findOptimalDuration(sessions);

  // Language/activity analysis
  const languagePerformance: Record<string, { count: number; avgFocus: number }> = {};
  
  sessions.forEach(session => {
    const lang = session.language || session.sessionType || 'other';
    if (!languagePerformance[lang]) {
      languagePerformance[lang] = { count: 0, avgFocus: 0 };
    }
    languagePerformance[lang].count++;
    languagePerformance[lang].avgFocus += session.focusScore || 0;
  });

  Object.keys(languagePerformance).forEach(lang => {
    languagePerformance[lang].avgFocus /= languagePerformance[lang].count;
  });

  return {
    hourlyPerformance,
    dayOfWeekPerformance,
    avgDuration,
    optimalDuration,
    languagePerformance,
    bestHours: Object.entries(hourlyPerformance)
      .sort((a, b) => b[1].avgFocus - a[1].avgFocus)
      .slice(0, 3)
      .map(([hour, data]) => ({ hour: parseInt(hour), avgFocus: data.avgFocus })),
    bestDays: Object.entries(dayOfWeekPerformance)
      .sort((a, b) => b[1].avgFocus - a[1].avgFocus)
      .slice(0, 3)
      .map(([day, data]) => ({ day: parseInt(day), avgFocus: data.avgFocus }))
  };
}

function findOptimalDuration(sessions: any[]): number {
  // Group sessions by duration buckets and find which has best focus
  const buckets: Record<string, { count: number; totalFocus: number }> = {
    '15-30': { count: 0, totalFocus: 0 },
    '30-45': { count: 0, totalFocus: 0 },
    '45-60': { count: 0, totalFocus: 0 },
    '60-90': { count: 0, totalFocus: 0 },
    '90+': { count: 0, totalFocus: 0 }
  };

  sessions.forEach(session => {
    const minutes = (session.duration || 0) / 60;
    let bucket = '90+';
    if (minutes < 30) bucket = '15-30';
    else if (minutes < 45) bucket = '30-45';
    else if (minutes < 60) bucket = '45-60';
    else if (minutes < 90) bucket = '60-90';

    buckets[bucket].count++;
    buckets[bucket].totalFocus += session.focusScore || 0;
  });

  let bestBucket = '45-60';
  let bestAvg = 0;

  Object.entries(buckets).forEach(([bucket, data]) => {
    if (data.count > 0) {
      const avg = data.totalFocus / data.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestBucket = bucket;
      }
    }
  });

  // Return middle of best bucket
  const bucketMap: Record<string, number> = {
    '15-30': 22,
    '30-45': 37,
    '45-60': 52,
    '60-90': 75,
    '90+': 90
  };

  return bucketMap[bestBucket] * 60; // Convert to seconds
}

async function generateAIInsights(sessions: any[], patterns: any): Promise<string[]> {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    return generateBasicInsights(sessions, patterns);
  }

  try {
    const summary = `
User has completed ${sessions.length} sessions in the last 30 days.
Average focus score: ${(sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / sessions.length).toFixed(1)}
Best hours: ${patterns.bestHours.map((h: any) => `${h.hour}:00`).join(', ')}
Optimal session duration: ${Math.round(patterns.optimalDuration / 60)} minutes
Most productive activity: ${Object.entries(patterns.languagePerformance).sort((a: any, b: any) => b[1].avgFocus - a[1].avgFocus)[0]?.[0] || 'N/A'}
`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity coach analyzing user data. Provide 3-5 specific, actionable insights. Be concise and encouraging.'
          },
          {
            role: 'user',
            content: `Analyze this productivity data and provide insights:\n\n${summary}`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.choices[0].message.content;
    return text.split('\n').filter((line: string) => line.trim().length > 0);
  } catch (error) {
    console.error('AI insights error:', error);
    return generateBasicInsights(sessions, patterns);
  }
}

function generateBasicInsights(sessions: any[], patterns: any): string[] {
  const insights: string[] = [];
  const avgFocus = sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / sessions.length;

  if (avgFocus >= 80) {
    insights.push('🌟 Excellent focus! You\'re maintaining high concentration levels.');
  } else if (avgFocus >= 60) {
    insights.push('👍 Good focus overall. Small improvements can take you to the next level.');
  } else {
    insights.push('💡 Focus needs attention. Try shorter sessions and minimize distractions.');
  }

  if (patterns.bestHours.length > 0) {
    const bestHour = patterns.bestHours[0].hour;
    insights.push(`⏰ Your peak performance is around ${bestHour}:00. Schedule important work then.`);
  }

  if (patterns.optimalDuration) {
    const minutes = Math.round(patterns.optimalDuration / 60);
    insights.push(`⏱️ Your sweet spot is ${minutes}-minute sessions. Stick to this duration.`);
  }

  return insights;
}

function generateRecommendations(patterns: any): any[] {
  const recommendations = [];

  // Time-based recommendations
  if (patterns.bestHours.length > 0) {
    recommendations.push({
      type: 'schedule',
      priority: 'high',
      title: 'Optimize Your Schedule',
      description: `Schedule deep work during your peak hours: ${patterns.bestHours.map((h: any) => `${h.hour}:00-${h.hour + 1}:00`).join(', ')}`,
      action: 'View Suggested Schedule'
    });
  }

  // Duration recommendations
  const optimalMinutes = Math.round(patterns.optimalDuration / 60);
  recommendations.push({
    type: 'duration',
    priority: 'medium',
    title: 'Session Length',
    description: `Your optimal session length is ${optimalMinutes} minutes. Use a timer to maintain this rhythm.`,
    action: 'Set Timer'
  });

  // Activity recommendations
  const topActivity = Object.entries(patterns.languagePerformance)
    .sort((a: any, b: any) => b[1].avgFocus - a[1].avgFocus)[0];
  
  if (topActivity) {
    recommendations.push({
      type: 'activity',
      priority: 'medium',
      title: 'Focus on Your Strengths',
      description: `You perform best with ${topActivity[0]}. Consider dedicating more time to this activity.`,
      action: 'Start Session'
    });
  }

  return recommendations;
}

function generateOptimalSchedule(patterns: any): any {
  const schedule: any = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  };

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const bestHours = patterns.bestHours || [];

  // For each best day, suggest sessions during best hours
  patterns.bestDays?.forEach((dayData: any) => {
    const dayName = dayNames[dayData.day];
    
    bestHours.forEach((hourData: any) => {
      schedule[dayName].push({
        time: `${hourData.hour}:00`,
        duration: Math.round(patterns.optimalDuration / 60),
        type: 'deep-work',
        confidence: dayData.avgFocus >= 75 ? 'high' : 'medium'
      });
    });
  });

  return schedule;
}

function getDefaultSchedule(): any {
  return {
    monday: [{ time: '9:00', duration: 45, type: 'deep-work', confidence: 'low' }],
    tuesday: [{ time: '9:00', duration: 45, type: 'deep-work', confidence: 'low' }],
    wednesday: [{ time: '9:00', duration: 45, type: 'deep-work', confidence: 'low' }],
    thursday: [{ time: '9:00', duration: 45, type: 'deep-work', confidence: 'low' }],
    friday: [{ time: '9:00', duration: 45, type: 'deep-work', confidence: 'low' }],
    saturday: [],
    sunday: []
  };
}

function groupByDay(sessions: any[]): any[] {
  const grouped: Record<string, any> = {};

  sessions.forEach(session => {
    const date = new Date(session.startTime).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = {
        date,
        sessions: 0,
        totalDuration: 0,
        avgFocus: 0,
        totalFocus: 0
      };
    }
    grouped[date].sessions++;
    grouped[date].totalDuration += session.duration || 0;
    grouped[date].totalFocus += session.focusScore || 0;
  });

  return Object.values(grouped).map(day => ({
    ...day,
    avgFocus: day.totalFocus / day.sessions
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function calculateTrends(dailyStats: any[]): any {
  if (dailyStats.length < 2) {
    return { focusScoreTrend: 0, sessionCountTrend: 0, durationTrend: 0 };
  }

  const firstHalf = dailyStats.slice(0, Math.floor(dailyStats.length / 2));
  const secondHalf = dailyStats.slice(Math.floor(dailyStats.length / 2));

  const firstAvgFocus = firstHalf.reduce((sum, d) => sum + d.avgFocus, 0) / firstHalf.length;
  const secondAvgFocus = secondHalf.reduce((sum, d) => sum + d.avgFocus, 0) / secondHalf.length;

  return {
    focusScoreTrend: ((secondAvgFocus - firstAvgFocus) / firstAvgFocus) * 100,
    sessionCountTrend: secondHalf.length - firstHalf.length,
    durationTrend: (secondHalf.reduce((sum, d) => sum + d.totalDuration, 0) / secondHalf.length) -
                   (firstHalf.reduce((sum, d) => sum + d.totalDuration, 0) / firstHalf.length)
  };
}

function findBestDay(dailyStats: any[]): any {
  if (dailyStats.length === 0) return null;
  
  return dailyStats.reduce((best, current) => 
    current.avgFocus > best.avgFocus ? current : best
  );
}

export default router;
