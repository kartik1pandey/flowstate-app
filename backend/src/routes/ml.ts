import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// All routes require authentication
router.use(authenticate);

// POST /api/ml - ML operations via Hugging Face
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { operation, data } = req.body;

    if (!operation) {
      return res.status(400).json({ error: 'operation is required' });
    }

    if (!HUGGINGFACE_API_KEY) {
      return res.status(503).json({ error: 'ML service not configured' });
    }

    let result: any;

    switch (operation) {
      case 'sentiment':
        if (!data.text) {
          return res.status(400).json({ error: 'text is required for sentiment analysis' });
        }
        // Placeholder for sentiment analysis
        result = { sentiment: 'positive', score: 0.85 };
        break;

      case 'classify':
        if (!data.text) {
          return res.status(400).json({ error: 'text is required for classification' });
        }
        // Placeholder for text classification
        result = { category: 'productivity', confidence: 0.9 };
        break;

      case 'predict-fatigue':
        if (!data.metrics) {
          return res.status(400).json({ error: 'metrics are required for fatigue prediction' });
        }
        // Simple fatigue prediction based on metrics
        const fatigueScore = data.metrics.fatigueLevel || 0;
        result = { 
          fatigueLevel: fatigueScore,
          recommendation: fatigueScore > 70 ? 'Take a break' : 'Continue working'
        };
        break;

      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }

    res.json({ result });
  } catch (error) {
    console.error('ML operation error:', error);
    res.status(500).json({ error: 'Failed to perform ML operation' });
  }
});

export default router;
