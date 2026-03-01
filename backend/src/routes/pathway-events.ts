import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { pool } from '../config/database';
import axios from 'axios';

const router = express.Router();

const PATHWAY_API_URL = process.env.PATHWAY_API_URL || 'http://localhost:8001';

// POST /api/pathway/ingest-session - Send session to Pathway for analysis
router.post('/ingest-session', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Get session from database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM flow_sessions WHERE id = $1 AND user_id = $2',
        [sessionId, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const session = result.rows[0];

      // Format for Pathway
      const pathwayEvent = {
        user_id: session.user_id,
        session_type: session.session_type,
        timestamp: session.start_time,
        duration: session.duration,
        focus_score: session.focus_score,
        quality_score: session.quality_score,
        distractions: session.distractions,
        language: session.language || 'unknown',
        lines_of_code: session.code_metrics_lines_of_code || 0,
        creativity_score: session.whiteboard_metrics_creativity_score || 0,
        session_id: session.id
      };

      // Send to Pathway
      const pathwayResponse = await axios.post(
        `${PATHWAY_API_URL}/ingest/session`,
        pathwayEvent,
        { timeout: 5000 }
      );

      res.json({
        success: true,
        message: 'Session sent to Pathway for analysis',
        pathway_response: pathwayResponse.data
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error sending session to Pathway:', error);
    res.status(500).json({ 
      error: 'Failed to send session to Pathway',
      details: error.message 
    });
  }
});

// POST /api/pathway/ingest-all-sessions - Send all user sessions to Pathway
router.post('/ingest-all-sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = await pool.connect();
    try {
      // Get all sessions for user
      const result = await client.query(
        'SELECT * FROM flow_sessions WHERE user_id = $1 ORDER BY start_time DESC',
        [req.userId]
      );

      if (result.rows.length === 0) {
        return res.json({
          success: true,
          message: 'No sessions to ingest',
          sessions_sent: 0
        });
      }

      // Send each session to Pathway
      let successCount = 0;
      let failCount = 0;

      for (const session of result.rows) {
        try {
          const pathwayEvent = {
            user_id: session.user_id,
            session_type: session.session_type,
            timestamp: session.start_time,
            duration: session.duration,
            focus_score: session.focus_score,
            quality_score: session.quality_score,
            distractions: session.distractions,
            language: session.language || 'unknown',
            lines_of_code: session.code_metrics_lines_of_code || 0,
            creativity_score: session.whiteboard_metrics_creativity_score || 0,
            session_id: session.id
          };

          await axios.post(
            `${PATHWAY_API_URL}/ingest/session`,
            pathwayEvent,
            { timeout: 5000 }
          );

          successCount++;
        } catch (error) {
          console.error(`Failed to send session ${session.id}:`, error);
          failCount++;
        }
      }

      res.json({
        success: true,
        message: `Sent ${successCount} sessions to Pathway`,
        sessions_sent: successCount,
        sessions_failed: failCount,
        total_sessions: result.rows.length
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error sending sessions to Pathway:', error);
    res.status(500).json({ 
      error: 'Failed to send sessions to Pathway',
      details: error.message 
    });
  }
});

// GET /api/pathway/analytics/:userId - Get Pathway analytics
router.get('/analytics/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Verify user can access this data
    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const response = await axios.get(
      `${PATHWAY_API_URL}/analytics/${userId}`,
      { timeout: 5000 }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching Pathway analytics:', error);
    
    if (error.response?.status === 404) {
      return res.json({
        user_id: req.userId,
        message: 'No analytics data available yet. Ingest some sessions first!',
        has_data: false
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch analytics from Pathway',
      details: error.message 
    });
  }
});

// GET /api/pathway/analytics/:userId/overview - Get overview analytics
router.get('/analytics/:userId/overview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const response = await axios.get(
      `${PATHWAY_API_URL}/analytics/${userId}/overview`,
      { timeout: 5000 }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch overview from Pathway',
      details: error.message 
    });
  }
});

// GET /api/pathway/analytics/:userId/insights - Get AI insights
router.get('/analytics/:userId/insights', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const response = await axios.get(
      `${PATHWAY_API_URL}/analytics/${userId}/insights`,
      { timeout: 5000 }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ 
      error: 'Failed to fetch insights from Pathway',
      details: error.message 
    });
  }
});

// GET /api/pathway/health - Check Pathway health
router.get('/health', async (req, res: Response) => {
  try {
    const response = await axios.get(`${PATHWAY_API_URL}/`, {
      timeout: 2000,
    });

    res.json({
      pathway_status: 'healthy',
      pathway_response: response.data,
    });
  } catch (error) {
    res.json({
      pathway_status: 'unavailable',
      message: 'Pathway analytics engine is not responding',
    });
  }
});

export default router;
