import express from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middleware/auth';
import FlowSession from '../models/FlowSession';
import UserSettings from '../models/UserSettings';
import * as fs from 'fs/promises';
import * as path from 'path';

const router = express.Router();

const RAG_API_URL = process.env.RAG_API_URL || 'http://localhost:8002';
const RAG_DATA_DIR = path.join(__dirname, '../../rag_data');

// Ensure RAG data directory exists
fs.mkdir(RAG_DATA_DIR, { recursive: true }).catch(console.error);

/**
 * Generate user context document for RAG
 */
async function generateUserContext(userId: string): Promise<string> {
  try {
    // Get user sessions
    const sessions = await FlowSession.find({ userId });
    
    if (!sessions || sessions.length === 0) {
      // Return a basic profile for users with no sessions yet
      return `# User Productivity Profile

## User ID: ${userId}

## Status
This user is new and hasn't completed any coding sessions yet.

## Getting Started
To see personalized insights:
1. Complete some coding sessions in the Code Editor
2. Try the Whiteboard for creative work
3. Return here to see your productivity analytics

## Available Features
- Code Editor with multiple languages
- Real-time focus tracking
- Productivity analytics
- AI-powered insights (once you have session data)

---
Generated: ${new Date().toISOString()}
`;
    }
    
    // Get user settings
    const settings = await UserSettings.findOne({ userId });
    
    // Calculate statistics
    const totalSessions = sessions.length;
    const avgFocus = sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / totalSessions || 0;
    const avgQuality = sessions.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / totalSessions || 0;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalDistractions = sessions.reduce((sum, s) => sum + (s.distractions || 0), 0);
    
    // Group by session type
    const codeSessions = sessions.filter(s => s.sessionType === 'code');
    const whiteboardSessions = sessions.filter(s => s.sessionType === 'whiteboard');
    
    // Language breakdown
    const languageStats: Record<string, { count: number; totalLines: number; avgFocus: number }> = {};
    codeSessions.forEach(session => {
      const lang = session.language || 'unknown';
      if (!languageStats[lang]) {
        languageStats[lang] = { count: 0, totalLines: 0, avgFocus: 0 };
      }
      languageStats[lang].count++;
      languageStats[lang].totalLines += session.linesOfCode || 0;
      languageStats[lang].avgFocus += session.focusScore || 0;
    });
    
    Object.keys(languageStats).forEach(lang => {
      languageStats[lang].avgFocus /= languageStats[lang].count;
    });
    
    // Recent sessions (last 10)
    const recentSessions = sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10);
    
    // Generate markdown document
    const document = `# User Productivity Profile

## User ID: ${userId}

## Overview Statistics
- Total Sessions: ${totalSessions}
- Average Focus Score: ${avgFocus.toFixed(2)}/100
- Average Quality Score: ${avgQuality.toFixed(2)}/100
- Total Time Spent: ${(totalDuration / 3600).toFixed(2)} hours
- Total Distractions: ${totalDistractions}
- Distraction Rate: ${(totalDistractions / totalSessions).toFixed(2)} per session

## Session Breakdown
- Code Sessions: ${codeSessions.length}
- Whiteboard Sessions: ${whiteboardSessions.length}

## Programming Languages Used
${Object.entries(languageStats).map(([lang, stats]) => 
  `- ${lang}: ${stats.count} sessions, ${stats.totalLines} lines of code, ${stats.avgFocus.toFixed(1)} avg focus`
).join('\n')}

## Recent Activity (Last 10 Sessions)
${recentSessions.map((session, idx) => `
### Session ${idx + 1} - ${new Date(session.startTime).toLocaleString()}
- Type: ${session.sessionType}
- Duration: ${Math.round(session.duration / 60)} minutes
- Focus Score: ${session.focusScore}/100
- Quality Score: ${session.qualityScore}/100
- Distractions: ${session.distractions}
${session.language ? `- Language: ${session.language}` : ''}
${session.linesOfCode ? `- Lines of Code: ${session.linesOfCode}` : ''}
`).join('\n')}

## User Preferences
${settings ? `
- Theme: ${settings.theme || 'default'}
- Notifications: ${settings.notifications ? 'enabled' : 'disabled'}
- Focus Mode: ${settings.focusMode ? 'enabled' : 'disabled'}
- Intervention Frequency: ${settings.interventionFrequency || 'medium'}
` : 'No preferences set'}

## Productivity Insights
- Best Focus Time: ${avgFocus >= 80 ? 'Excellent' : avgFocus >= 60 ? 'Good' : 'Needs Improvement'}
- Consistency: ${totalSessions >= 10 ? 'Regular user' : 'New user'}
- Most Used Language: ${Object.entries(languageStats).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || 'N/A'}
- Average Session Length: ${(totalDuration / totalSessions / 60).toFixed(1)} minutes

---
Generated: ${new Date().toISOString()}
`;
    
    return document;
  } catch (error) {
    console.error('Error generating user context:', error);
    throw error;
  }
}

/**
 * Sync user data to RAG system
 */
router.post('/sync', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log(`📝 Generating RAG context for user ${userId}...`);
    
    // Generate user context document
    const contextDoc = await generateUserContext(userId);
    
    console.log(`✅ Context generated, length: ${contextDoc.length} chars`);
    
    // Write to RAG data directory
    const filename = `user_${userId}_${Date.now()}.md`;
    const filepath = path.join(RAG_DATA_DIR, filename);
    
    console.log(`💾 Writing to: ${filepath}`);
    
    await fs.writeFile(filepath, contextDoc, 'utf-8');
    
    console.log(`✅ RAG context saved: ${filepath}`);
    
    // Trigger RAG service to reload documents
    try {
      await axios.post(`${RAG_API_URL}/reload`);
      console.log(`✅ RAG service reloaded`);
    } catch (reloadError) {
      console.warn(`⚠️  Could not reload RAG service:`, reloadError);
    }
    
    res.json({
      success: true,
      message: 'User data synced to RAG system',
      filename,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('RAG sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Ask a question using RAG (with Groq fallback)
 */
router.post('/ask', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { question } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log(`🤔 RAG query from user ${userId}: ${question}`);
    
    // Try RAG service first
    try {
      const ragResponse = await axios.post(`${RAG_API_URL}/v1/pw_ai_answer`, {
        prompt: question
      });
      
      return res.json({
        answer: ragResponse.data.response,
        source: 'rag_service',
        timestamp: new Date().toISOString()
      });
    } catch (ragError: any) {
      console.warn(`⚠️  RAG service error, falling back:`, ragError.message);
    }
    
    // Fallback: Try to read user's context file
    try {
      const files = await fs.readdir(RAG_DATA_DIR);
      const userFiles = files.filter(f => f.startsWith(`user_${userId}_`) && f.endsWith('.md'));
      
      if (userFiles.length === 0) {
        return res.json({
          answer: "I don't have any data about your sessions yet. Complete some coding sessions first, then I'll be able to answer questions about your productivity!",
          timestamp: new Date().toISOString()
        });
      }
      
      // Read the most recent file
      const latestFile = userFiles.sort().reverse()[0];
      const filePath = path.join(RAG_DATA_DIR, latestFile);
      const context = await fs.readFile(filePath, 'utf-8');
      
      // Use Groq API directly
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      
      if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
        // Fallback to simple text analysis
        return res.json({
          answer: analyzeContextSimple(context, question),
          timestamp: new Date().toISOString()
        });
      }
      
      // Call Groq API
      const groqResponse = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a personal productivity assistant. Answer questions based on the user\'s coding session data. Be specific with numbers and insights. Keep responses concise but informative.'
            },
            {
              role: 'user',
              content: `Context about the user:\n\n${context}\n\nQuestion: ${question}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const answer = groqResponse.data.choices[0].message.content;
      
      res.json({
        answer,
        context_used: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (fileError: any) {
      console.error('Error reading context:', fileError);
      
      // Fallback to analytics API
      return res.json({
        answer: "I'm having trouble accessing your data files. Please try syncing your data again.",
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error('RAG query error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Simple text analysis fallback (when no Groq API key)
 */
function analyzeContextSimple(context: string, question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  // Extract key metrics from context
  const focusMatch = context.match(/Average Focus Score: ([\d.]+)/);
  const sessionsMatch = context.match(/Total Sessions: (\d+)/);
  const durationMatch = context.match(/Total Time Spent: ([\d.]+) hours/);
  const languageMatch = context.match(/Most Used Language: (\w+)/);
  
  if (lowerQuestion.includes('focus')) {
    const focus = focusMatch ? focusMatch[1] : 'unknown';
    return `Based on your sessions, your average focus score is ${focus} out of 100.`;
  }
  
  if (lowerQuestion.includes('session') || lowerQuestion.includes('how many')) {
    const sessions = sessionsMatch ? sessionsMatch[1] : 'unknown';
    return `You have completed ${sessions} coding sessions so far.`;
  }
  
  if (lowerQuestion.includes('time') || lowerQuestion.includes('hours')) {
    const duration = durationMatch ? durationMatch[1] : 'unknown';
    return `You've spent ${duration} hours in total across all your sessions.`;
  }
  
  if (lowerQuestion.includes('language')) {
    const language = languageMatch ? languageMatch[1] : 'unknown';
    return `Your most used programming language is ${language}.`;
  }
  
  return `I can answer questions about your focus score, sessions, time spent, and programming languages. Try asking: "What's my average focus score?" or "How many sessions have I completed?"`;
}

/**
 * Get RAG statistics
 */
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check RAG service health
    const healthResponse = await axios.post(`${RAG_API_URL}/v1/statistics`);
    
    // Count user documents
    const files = await fs.readdir(RAG_DATA_DIR);
    const userFiles = files.filter(f => f.startsWith(`user_${userId}_`));
    
    res.json({
      rag_service: 'online',
      user_documents: userFiles.length,
      last_sync: userFiles.length > 0 ? userFiles[userFiles.length - 1] : null,
      service_stats: healthResponse.data
    });
  } catch (error: any) {
    console.error('RAG stats error:', error);
    res.status(500).json({
      rag_service: 'offline',
      error: error.message
    });
  }
});

/**
 * Retrieve similar documents
 */
router.post('/retrieve', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { query, k = 3 } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Retrieve similar documents
    const response = await axios.post(`${RAG_API_URL}/v1/retrieve`, {
      query,
      k,
      metadata_filter: `contains(path, \`user_${userId}\`)`
    });
    
    res.json(response.data);
  } catch (error: any) {
    console.error('RAG retrieve error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
