import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import FlowSession from '../models/FlowSession';
import { pool } from '../config/database';
import axios from 'axios';

const router = express.Router();

const PATHWAY_URL = process.env.PATHWAY_API_URL || 'http://localhost:8001';

// Helper function to call Pathway API
async function getPathwayAnalytics(userId: string) {
  try {
    const response = await axios.get(`${PATHWAY_URL}/analytics/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Pathway API error:', error);
    return null;
  }
}

// GET /api/analytics/overview - Overall analytics
router.get('/overview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Get sessions from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM flow_sessions 
         WHERE user_id = $1 AND start_time >= $2 AND start_time <= $3
         ORDER BY start_time DESC`,
        [userId, startDate, now]
      );
      
      const sessions = result.rows;
      
      if (sessions.length === 0) {
        return res.json({
          message: "No sessions found. Start creating sessions to see analytics!",
          overview: {
            totalSessions: 0,
            avgFocusScore: 0,
            totalDuration: 0,
            avgSessionDuration: 0
          }
        });
      }
      
      // Calculate metrics
      const totalSessions = sessions.length;
      const avgFocusScore = sessions.reduce((sum, s) => sum + (s.focus_score || 0), 0) / totalSessions;
      const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const totalDistractions = sessions.reduce((sum, s) => sum + (s.distractions || 0), 0);
      
      // Session type breakdown
      const codeSessions = sessions.filter(s => s.session_type === 'code');
      const whiteboardSessions = sessions.filter(s => s.session_type === 'whiteboard');
      
      // Language breakdown
      const languageStats: Record<string, number> = {};
      codeSessions.forEach(s => {
        const lang = s.language || 'unknown';
        languageStats[lang] = (languageStats[lang] || 0) + 1;
      });
      
      // Daily trends
      const dailyTrends: Record<string, any> = {};
      sessions.forEach(s => {
        const date = new Date(s.start_time).toISOString().split('T')[0];
        if (!dailyTrends[date]) {
          dailyTrends[date] = { sessions: 0, totalFocus: 0, totalDuration: 0 };
        }
        dailyTrends[date].sessions++;
        dailyTrends[date].totalFocus += s.focus_score || 0;
        dailyTrends[date].totalDuration += s.duration || 0;
      });
      
      const trends = Object.entries(dailyTrends).map(([date, data]) => ({
        date,
        sessions: data.sessions,
        avgFocus: Math.round(data.totalFocus / data.sessions),
        totalDuration: data.totalDuration
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      // Try to get Pathway analytics
      const pathwayAnalytics = await getPathwayAnalytics(userId!);
      
      res.json({
        overview: {
          totalSessions,
          avgFocusScore: Math.round(avgFocusScore),
          totalDuration,
          totalDistractions,
          avgSessionDuration: Math.round(totalDuration / totalSessions)
        },
        breakdown: {
          code: codeSessions.length,
          whiteboard: whiteboardSessions.length
        },
        languageStats,
        trends,
        topLanguages: Object.entries(languageStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([lang, count]) => ({ language: lang, sessions: count })),
        pathwayInsights: pathwayAnalytics?.productivity || null,
        burnoutRisk: pathwayAnalytics?.burnout || null
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/code - Code-specific analytics
router.get('/code', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { timeRange = '7d' } = req.query;
    
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM flow_sessions 
         WHERE user_id = $1 AND session_type = 'code' 
         AND start_time >= $2 AND start_time <= $3
         ORDER BY start_time DESC`,
        [userId, startDate, now]
      );
      
      const sessions = result.rows;
      
      if (sessions.length === 0) {
        return res.json({
          message: "No code sessions found",
          stats: { totalSessions: 0 }
        });
      }
      
      // Calculate code-specific metrics
      const totalLines = sessions.reduce((sum, s) => sum + (s.code_metrics_lines_of_code || 0), 0);
      const totalChars = sessions.reduce((sum, s) => sum + (s.code_metrics_characters_typed || 0), 0);
      const avgComplexity = sessions.reduce((sum, s) => sum + (s.code_metrics_complexity_score || 0), 0) / sessions.length;
      
      // Language breakdown with detailed stats
      const languageDetails: Record<string, any> = {};
      sessions.forEach(s => {
        const lang = s.language || 'unknown';
        if (!languageDetails[lang]) {
          languageDetails[lang] = {
            sessions: 0,
            totalLines: 0,
            avgFocus: 0,
            totalDuration: 0
          };
        }
        languageDetails[lang].sessions++;
        languageDetails[lang].totalLines += s.code_metrics_lines_of_code || 0;
        languageDetails[lang].avgFocus += s.focus_score || 0;
        languageDetails[lang].totalDuration += s.duration || 0;
      });
      
      // Calculate averages
      Object.keys(languageDetails).forEach(lang => {
        const data = languageDetails[lang];
        data.avgFocus = Math.round(data.avgFocus / data.sessions);
        data.avgDuration = Math.round(data.totalDuration / data.sessions);
      });
      
      res.json({
        stats: {
          totalSessions: sessions.length,
          totalLines,
          totalChars,
          avgComplexity: Math.round(avgComplexity),
          avgLinesPerSession: Math.round(totalLines / sessions.length)
        },
        languageDetails,
        topLanguages: Object.entries(languageDetails)
          .sort(([, a]: any, [, b]: any) => b.sessions - a.sessions)
          .slice(0, 5)
          .map(([lang, data]: any) => ({
            language: lang,
            ...data
          })),
        recentSessions: sessions.slice(0, 10).map(s => ({
          id: s.id,
          language: s.language,
          duration: s.duration,
          focusScore: s.focus_score,
          linesOfCode: s.code_metrics_lines_of_code,
          startTime: s.start_time
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Code analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch code analytics' });
  }
});

// GET /api/analytics/whiteboard - Whiteboard-specific analytics
router.get('/whiteboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { timeRange = '7d' } = req.query;
    
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM flow_sessions 
         WHERE user_id = $1 AND session_type = 'whiteboard' 
         AND start_time >= $2 AND start_time <= $3
         ORDER BY start_time DESC`,
        [userId, startDate, now]
      );
      
      const sessions = result.rows;
      
      if (sessions.length === 0) {
        return res.json({
          message: "No whiteboard sessions found",
          stats: { totalSessions: 0 }
        });
      }
      
      // Calculate whiteboard-specific metrics
      const totalStrokes = sessions.reduce((sum, s) => sum + (s.whiteboard_metrics_total_strokes || 0), 0);
      const totalShapes = sessions.reduce((sum, s) => sum + (s.whiteboard_metrics_shapes_drawn || 0), 0);
      const avgCreativity = sessions.reduce((sum, s) => sum + (s.whiteboard_metrics_creativity_score || 0), 0) / sessions.length;
      const avgColors = sessions.reduce((sum, s) => sum + (s.whiteboard_metrics_colors_used || 0), 0) / sessions.length;
      
      res.json({
        stats: {
          totalSessions: sessions.length,
          totalStrokes,
          totalShapes,
          avgCreativity: Math.round(avgCreativity),
          avgColors: Math.round(avgColors),
          avgStrokesPerSession: Math.round(totalStrokes / sessions.length)
        },
        recentSessions: sessions.slice(0, 10).map(s => ({
          id: s.id,
          duration: s.duration,
          focusScore: s.focus_score,
          totalStrokes: s.whiteboard_metrics_total_strokes,
          creativityScore: s.whiteboard_metrics_creativity_score,
          startTime: s.start_time
        }))
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Whiteboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch whiteboard analytics' });
  }
});

// GET /api/analytics/insights - AI-powered insights from Pathway
router.get('/insights', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    // Get insights from Pathway
    const pathwayInsights = await axios.get(`${PATHWAY_URL}/analytics/${userId}/insights`);
    
    res.json(pathwayInsights.data);
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch insights',
      message: 'Pathway analytics engine may be offline'
    });
  }
});

// POST /api/analytics/sync - Sync session to Pathway
router.post('/sync/:sessionId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;
    
    // Get session from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM flow_sessions WHERE id = $1 AND user_id = $2',
        [sessionId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const session = result.rows[0];
      
      // Send to Pathway
      await axios.post(`${PATHWAY_URL}/ingest/session`, {
        user_id: userId,
        session_type: session.session_type,
        timestamp: session.start_time,
        duration: session.duration,
        focus_score: session.focus_score,
        quality_score: session.quality_score,
        distractions: session.distractions,
        language: session.language,
        lines_of_code: session.code_metrics_lines_of_code,
        creativity_score: session.whiteboard_metrics_creativity_score,
        session_id: session.id
      });
      
      res.json({
        success: true,
        message: 'Session synced to Pathway analytics engine'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync session' });
  }
});

export default router;
