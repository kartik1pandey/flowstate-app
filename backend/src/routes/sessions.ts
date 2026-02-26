import express, { Response } from 'express';
import FlowSession from '../models/FlowSession';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/sessions - Get all sessions for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    const allSessions = await FlowSession.find({ userId: req.userId! });
    const sessions = allSessions.slice(skip, skip + limit);

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

// GET /api/sessions/:id - Get specific session
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const session = await FlowSession.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// POST /api/sessions - Create new session
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      startTime, endTime, duration, qualityScore, focusScore, triggers, breakers, 
      metrics, interventions, notes, language, distractions, codeMetrics, sessionType,
      whiteboardMetrics
    } = req.body;

    if (!startTime) {
      return res.status(400).json({ error: 'startTime is required' });
    }

    // Use focusScore if provided, otherwise use qualityScore, or default to 0
    const score = focusScore ?? qualityScore ?? 0;

    const session = await FlowSession.create({
      userId: req.userId,
      startTime,
      endTime,
      duration: duration || 0,
      qualityScore: score,
      focusScore: score,
      triggers: triggers || [],
      breakers: breakers || [],
      metrics: metrics || {
        avgTypingSpeed: 0,
        tabSwitches: 0,
        mouseActivity: 0,
        fatigueLevel: 0,
      },
      language: language || 'javascript',
      distractions: distractions ?? 0,
      sessionType: sessionType || 'other',
      codeMetrics: codeMetrics || {
        linesOfCode: 0,
        charactersTyped: 0,
        complexityScore: 0,
        errorsFixed: 0,
      },
      whiteboardMetrics: whiteboardMetrics || undefined,
      interventions: interventions || [],
      notes,
    });

    res.status(201).json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// PATCH /api/sessions/:id - Update session
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;

    const session = await FlowSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId! },
      { $set: updates },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// DELETE /api/sessions/:id - Delete session
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const session = await FlowSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
