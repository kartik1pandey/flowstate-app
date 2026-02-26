import express, { Response } from 'express';
import Intervention from '../models/Intervention';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/interventions - Get all interventions for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const sessionId = req.query.sessionId as string;

    const query: any = { userId: req.userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const interventions = await Intervention.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json({ interventions });
  } catch (error) {
    console.error('Get interventions error:', error);
    res.status(500).json({ error: 'Failed to retrieve interventions' });
  }
});

// POST /api/interventions - Create new intervention
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, type, duration, completed, effectiveness } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'type is required' });
    }

    const intervention = await Intervention.create({
      userId: req.userId,
      sessionId,
      type,
      timestamp: new Date(),
      duration: duration || 60,
      completed: completed || false,
      effectiveness,
    });

    res.status(201).json({ intervention });
  } catch (error) {
    console.error('Create intervention error:', error);
    res.status(500).json({ error: 'Failed to create intervention' });
  }
});

// PATCH /api/interventions/:id - Update intervention
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { completed, effectiveness } = req.body;

    const intervention = await Intervention.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { completed, effectiveness } },
      { new: true }
    ).lean();

    if (!intervention) {
      return res.status(404).json({ error: 'Intervention not found' });
    }

    res.json({ intervention });
  } catch (error) {
    console.error('Update intervention error:', error);
    res.status(500).json({ error: 'Failed to update intervention' });
  }
});

export default router;
