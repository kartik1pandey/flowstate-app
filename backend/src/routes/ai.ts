import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const GROQ_API_KEY = process.env.GROQ_API_KEY!;

// All routes require authentication
router.use(authenticate);

// POST /api/ai/chat - Generate AI chat completion
router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, type, sessionData, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    let systemPrompt = 'You are a helpful AI assistant focused on productivity and flow state optimization.';
    let userQuery = messages[messages.length - 1]?.content || '';

    if (type === 'flow-analysis' && sessionData) {
      systemPrompt = 'You are an expert in analyzing flow states and productivity patterns. Provide insights based on the session data.';
      userQuery = `Analyze this flow session data and provide insights:\n${JSON.stringify(sessionData, null, 2)}`;
    } else if (type === 'coach') {
      systemPrompt = 'You are a productivity coach specializing in flow states. Provide actionable advice and encouragement.';
      if (context) {
        userQuery = `Context: ${JSON.stringify(context)}\n\nUser question: ${userQuery}`;
      }
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!groqResponse.ok) {
      const error = await groqResponse.text();
      console.error('Groq API error:', error);
      return res.status(groqResponse.status).json({ error: 'Failed to generate AI response' });
    }

    const groqData = await groqResponse.json();
    const response = groqData.choices[0]?.message?.content || 'No response generated';

    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

export default router;
