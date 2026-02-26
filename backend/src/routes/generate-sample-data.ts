import express, { Response } from 'express';
import FlowSession from '../models/FlowSession';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// POST /api/generate-sample-data - Generate sample session data for analytics
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { count = 20 } = req.body;

    const sessions = [];
    const now = new Date();

    // Generate sample code sessions
    for (let i = 0; i < Math.floor(count / 2); i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const startTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 3600) + 600; // 10-70 minutes
      const focusScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const distractions = Math.floor(Math.random() * 10);
      
      const languages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust'];
      const language = languages[Math.floor(Math.random() * languages.length)];

      sessions.push({
        userId,
        startTime,
        endTime: new Date(startTime.getTime() + duration * 1000),
        duration,
        focusScore,
        qualityScore: focusScore,
        sessionType: 'code',
        language,
        distractions,
        triggers: ['Morning coffee', 'Quiet environment'],
        breakers: distractions > 5 ? ['Phone notification', 'Email'] : [],
        metrics: {
          avgTypingSpeed: Math.floor(Math.random() * 50) + 30,
          tabSwitches: distractions,
          mouseActivity: Math.floor(Math.random() * 100) + 50,
          fatigueLevel: Math.floor(Math.random() * 30),
        },
        codeMetrics: {
          linesOfCode: Math.floor(Math.random() * 500) + 50,
          charactersTyped: Math.floor(Math.random() * 5000) + 500,
          complexityScore: Math.floor(Math.random() * 100),
          errorsFixed: Math.floor(Math.random() * 20),
        },
        interventions: [],
        notes: `Sample ${language} coding session`,
      });
    }

    // Generate sample whiteboard sessions
    for (let i = 0; i < Math.floor(count / 2); i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const startTime = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 2400) + 600; // 10-50 minutes
      const focusScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const distractions = Math.floor(Math.random() * 8);
      
      const totalStrokes = Math.floor(Math.random() * 500) + 100;
      const shapesDrawn = Math.floor(Math.random() * 50) + 10;
      const colorsUsed = Math.floor(Math.random() * 6) + 2;
      const canvasCoverage = Math.floor(Math.random() * 60) + 20;
      const creativityScore = Math.floor(Math.random() * 40) + 60;

      sessions.push({
        userId,
        startTime,
        endTime: new Date(startTime.getTime() + duration * 1000),
        duration,
        focusScore,
        qualityScore: focusScore,
        sessionType: 'whiteboard',
        distractions,
        triggers: ['Creative mood', 'Brainstorming session'],
        breakers: distractions > 4 ? ['Interruption', 'Distraction'] : [],
        metrics: {
          avgTypingSpeed: 0,
          tabSwitches: distractions,
          mouseActivity: Math.floor(Math.random() * 200) + 100,
          fatigueLevel: Math.floor(Math.random() * 20),
        },
        whiteboardMetrics: {
          totalStrokes,
          shapesDrawn,
          colorsUsed,
          canvasCoverage,
          eraserUses: Math.floor(Math.random() * 20),
          toolSwitches: Math.floor(Math.random() * 30) + 10,
          averageStrokeSpeed: Math.floor(Math.random() * 50) + 20,
          creativityScore,
        },
        interventions: [],
        notes: 'Sample whiteboard brainstorming session',
      });
    }

    // Insert all sessions
    const createdSessions = await FlowSession.insertMany(sessions);

    res.json({
      success: true,
      message: `Generated ${createdSessions.length} sample sessions`,
      sessions: createdSessions,
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    res.status(500).json({ error: 'Failed to generate sample data' });
  }
});

// DELETE /api/generate-sample-data - Delete all sample sessions
router.delete('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await FlowSession.deleteMany({
      userId: req.userId,
      notes: { $regex: /sample/i },
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} sample sessions`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting sample data:', error);
    res.status(500).json({ error: 'Failed to delete sample data' });
  }
});

export default router;
