// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import interventionRoutes from './routes/interventions';
import analyticsRoutes from './routes/analytics';
import spotifyRoutes from './routes/spotify';
import aiRoutes from './routes/ai';
import mlRoutes from './routes/ml';
import settingsRoutes from './routes/settings';
import executeRoutes from './routes/execute';
import mediaRoutes from './routes/media';
import whatsappRoutes from './routes/whatsapp';
import generateSampleDataRoutes from './routes/generate-sample-data';
import pathwayEventsRoutes from './routes/pathway-events';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  /\.vercel\.app$/, // Allow all Vercel preview deployments
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/generate-sample-data', generateSampleDataRoutes);
app.use('/api/pathway', pathwayEventsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
