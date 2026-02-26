import express, { Response } from 'express';
import UserSettings from '../models/UserSettings';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/settings - Get user settings
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let settings: any = await UserSettings.findOne({ userId: req.userId }).lean();

    // Create default settings if they don't exist
    if (!settings) {
      settings = await UserSettings.create({ userId: req.userId });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// PATCH /api/settings - Update user settings
router.patch('/', async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true, upsert: true }
    ).lean();

    res.json({ settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
