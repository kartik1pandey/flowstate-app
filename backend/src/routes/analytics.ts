import express, { Response } from 'express';
import FlowSession from '../models/FlowSession';
import { authenticate, AuthRequest } from '../middleware/auth';
import { startOfWeek, startOfMonth, subDays } from 'date-fns';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/analytics - Get analytics for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const period = (req.query.period as string) || 'week'; // week, month, year, all

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case 'week':
        startDate = startOfWeek(endDate);
        break;
      case 'month':
        startDate = startOfMonth(endDate);
        break;
      case 'year':
        startDate = subDays(endDate, 365);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const sessions = await FlowSession.find({
      userId: req.userId!,
      startTime: { $gte: startDate, $lte: endDate },
    });

    // Calculate analytics
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum: number, s: any) => sum + s.duration, 0);
    const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const avgQualityScore = totalSessions > 0 
      ? sessions.reduce((sum: number, s: any) => sum + s.qualityScore, 0) / totalSessions 
      : 0;

    // Flow triggers analysis
    const triggersMap = new Map<string, number>();
    sessions.forEach((s: any) => {
      s.triggers.forEach((t: string) => {
        triggersMap.set(t, (triggersMap.get(t) || 0) + 1);
      });
    });

    // Flow breakers analysis
    const breakersMap = new Map<string, number>();
    sessions.forEach((s: any) => {
      s.breakers.forEach((b: string) => {
        breakersMap.set(b, (breakersMap.get(b) || 0) + 1);
      });
    });

    // Best time analysis (group by hour)
    const hourMap = new Map<number, { count: number; totalQuality: number }>();
    sessions.forEach((s: any) => {
      const hour = new Date(s.startTime).getHours();
      const existing = hourMap.get(hour) || { count: 0, totalQuality: 0 };
      hourMap.set(hour, {
        count: existing.count + 1,
        totalQuality: existing.totalQuality + s.qualityScore,
      });
    });

    const bestHours = Array.from(hourMap.entries())
      .map(([hour, data]) => ({
        hour,
        sessions: data.count,
        avgQuality: data.totalQuality / data.count,
      }))
      .sort((a, b) => b.avgQuality - a.avgQuality)
      .slice(0, 3);

    const analytics = {
      totalSessions,
      totalDuration,
      avgDuration: Math.round(avgDuration),
      avgQualityScore: Math.round(avgQualityScore * 10) / 10,
      topTriggers: Array.from(triggersMap.entries())
        .map(([trigger, count]) => ({ trigger, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topBreakers: Array.from(breakersMap.entries())
        .map(([breaker, count]) => ({ breaker, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      bestHours,
      sessionsOverTime: sessions.map((s: any) => ({
        date: s.startTime,
        duration: s.duration,
        quality: s.qualityScore,
      })),
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

export default router;
