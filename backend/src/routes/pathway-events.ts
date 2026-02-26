import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import axios from 'axios';

const router = express.Router();

const PATHWAY_API_URL = process.env.PATHWAY_API_URL || 'http://localhost:8001';

// POST /api/pathway/event - Send event to Pathway
router.post('/event', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { space_type, event_type, value, metadata } = req.body;

    if (!space_type || !event_type) {
      return res.status(400).json({ error: 'space_type and event_type are required' });
    }

    const event = {
      user_id: req.userId?.toString(),
      space_type,
      event_type,
      value: value || 1,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    // Send to Pathway
    try {
      await axios.post(`${PATHWAY_API_URL}/event`, event, {
        timeout: 2000, // 2 second timeout
      });
    } catch (pathwayError) {
      console.error('Pathway ingestion failed (non-blocking):', pathwayError);
      // Don't fail the request if Pathway is down
    }

    res.json({ success: true, event });
  } catch (error) {
    console.error('Error sending event to Pathway:', error);
    res.status(500).json({ error: 'Failed to process event' });
  }
});

// GET /api/pathway/flow/:userId - Get current flow score
router.get('/flow', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId?.toString();

    const response = await axios.get(`${PATHWAY_API_URL}/flow/${userId}`, {
      timeout: 3000,
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching flow score from Pathway:', error);
    
    // Return default if Pathway is unavailable
    res.json({
      user_id: req.userId?.toString(),
      flow_score: 0,
      message: 'Real-time analytics temporarily unavailable',
    });
  }
});

// GET /api/pathway/metrics - Get detailed metrics
router.get('/metrics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId?.toString();

    const response = await axios.get(`${PATHWAY_API_URL}/metrics/${userId}`, {
      timeout: 3000,
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching metrics from Pathway:', error);
    
    res.json({
      user_id: req.userId?.toString(),
      flow_score: 0,
      keystroke_velocity: 0,
      distractions: 0,
      session_duration: 0,
      message: 'Real-time analytics temporarily unavailable',
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
