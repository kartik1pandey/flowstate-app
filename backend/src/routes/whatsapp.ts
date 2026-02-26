import express, { Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/whatsapp/status - Get WhatsApp connection status
router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    // Placeholder - WhatsApp integration would require whatsapp-web.js setup
    res.json({
      connected: false,
      message: 'WhatsApp integration is not enabled in this version.',
    });
  } catch (error: any) {
    console.error('WhatsApp status error:', error);
    res.status(500).json({ error: error.message || 'Failed to get WhatsApp status' });
  }
});

// POST /api/whatsapp/send-report - Send report via WhatsApp
router.post('/send-report', async (req: AuthRequest, res: Response) => {
  try {
    // Placeholder - WhatsApp integration would require whatsapp-web.js setup
    res.json({
      success: false,
      message: 'WhatsApp integration is not enabled in this version.',
    });
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({ error: error.message || 'Failed to send WhatsApp message' });
  }
});

export default router;
