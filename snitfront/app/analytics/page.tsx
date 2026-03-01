'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Zap,
  Calendar,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  BarChart3,
  LineChart,
  Activity,
  Sparkles,
  Award,
  Flame,
  Coffee,
  Bell,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL || 'http://localhost:8003';

export default function AnalyticsPage() {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [schedule, setSchedule] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    } else if (isAuthenticated && user) {
      loadAllAnalytics();
      // Refresh live stats every 30 seconds
      const interval = setInterval(() => {
        loadLiveData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [authLoading, isAuthenticated, user, router]);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadHistoricalData(),
        loadLiveData()
      ]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [insightsRes, trendsRes, scheduleRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics-insights/insights`, { headers }),
        axios.get(`${API_URL}/api/analytics-insights/trends?days=30`, { headers }),
        axios.get(`${API_URL}/api/analytics-insights/schedule`, { headers })
      ]);

      setInsights(insightsRes.data);
      setTrends(trendsRes.data);
      setSchedule(scheduleRes.data);
    } catch (error) {
      console.error('Failed to load historical data:', error);
    }
  };

  const loadLiveData = async () => {
    try {
      if (!user?.userId) return;

      const [liveStatsRes, predictionsRes, alertsRes] = await Promise.all([
        axios.get(`${ANALYTICS_URL}/v1/live-stats/${user.userId}`).catch(() => null),
        axios.get(`${ANALYTICS_URL}/v1/predictions/${user.userId}`).catch(() => null),
        axios.get(`${ANALYTICS_URL}/v1/alerts/${user.userId}`).catch(() => null)
      ]);

      if (liveStatsRes) setLiveStats(liveStatsRes.data);
      if (predictionsRes) setPredictions(predictionsRes.data);
      if (alertsRes) setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Failed to load live data:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-200/50 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Complete Analytics Dashboard
            </h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Alerts Section */}
        {alerts && alerts.alerts && alerts.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {alerts.alerts.map((alert: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
                  alert.type === 'success' ? 'bg-green-50 border-green-300' :
                  alert.type === 'warning' ? 'bg-orange-50 border-orange-300' :
                  alert.type === 'info' ? 'bg-blue-50 border-blue-300' :
                  'bg-gray-50 border-gray-300'
                }`}
              >
                <Bell className={`w-5 h-5 flex-shrink-0 ${
                  alert.type === 'success' ? 'text-green-600' :
                  alert.type === 'warning' ? 'text-orange-600' :
                  alert.type === 'info' ? 'text-blue-600' :
                  'text-gray-600'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{alert.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.action}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                  alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {alert.priority}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Live Stats Row */}
        {liveStats && liveStats.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LiveStatCard
              icon={<Flame className="w-6 h-6" />}
              label="Current Streak"
              value={`${liveStats.stats.current_streak} days`}
              gradient="from-orange-500 to-red-500"
              subtitle="Keep it going!"
            />
            <LiveStatCard
              icon={<Activity className="w-6 h-6" />}
              label="Sessions Today"
              value={liveStats.stats.sessions_today}
              gradient="from-blue-500 to-cyan-500"
              subtitle={`${liveStats.stats.total_sessions} total`}
            />
            <LiveStatCard
              icon={<Target className="w-6 h-6" />}
              label="Avg Focus Today"
              value={Math.round(liveStats.stats.avg_focus_today || 0)}
              gradient="from-purple-500 to-pink-500"
              subtitle="Out of 100"
            />
            <LiveStatCard
              icon={<Award className="w-6 h-6" />}
              label="Productivity Score"
              value={Math.round(liveStats.stats.productivity_score || 0)}
              gradient="from-green-500 to-emerald-500"
              subtitle={`Momentum: ${liveStats.stats.momentum}`}
            />
          </div>
        )}

        {/* Main Stats Grid */}
        {trends && trends.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Target className="w-6 h-6" />}
              label="Total Sessions"
              value={trends.summary.totalSessions}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Zap className="w-6 h-6" />}
              label="Avg Focus Score"
              value={Math.round(trends.summary.avgFocusScore)}
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Total Time"
              value={`${Math.round(trends.summary.totalTime / 3600)}h`}
              gradient="from-green-500 to-emerald-500"
            />
            <StatCard
              icon={trends.summary.improvementRate >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              label="Improvement"
              value={`${trends.summary.improvementRate >= 0 ? '+' : ''}${Math.round(trends.summary.improvementRate)}%`}
              gradient={trends.summary.improvementRate >= 0 ? "from-green-500 to-teal-500" : "from-orange-500 to-red-500"}
            />
          </div>
        )}

        {/* Predictions Section */}
        {predictions && predictions.predictions && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              AI Predictions & Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm opacity-90 mb-1">Next Best Time</p>
                <p className="text-2xl font-bold">{predictions.predictions.next_best_time?.hour}:00</p>
                <p className="text-xs opacity-75 mt-1">Expected focus: {predictions.predictions.next_best_time?.expected_focus}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm opacity-90 mb-1">Optimal Session</p>
                <p className="text-2xl font-bold">{predictions.predictions.optimal_session_length} min</p>
                <p className="text-xs opacity-75 mt-1">Based on your patterns</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm opacity-90 mb-1">Burnout Risk</p>
                <p className={`text-2xl font-bold ${
                  predictions.predictions.burnout_risk === 'low' ? 'text-green-300' :
                  predictions.predictions.burnout_risk === 'medium' ? 'text-yellow-300' :
                  'text-red-300'
                }`}>
                  {predictions.predictions.burnout_risk?.toUpperCase()}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Break: {predictions.predictions.recommended_break?.duration} min
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 30-Day Trend Chart */}
        {trends && trends.dailyStats && trends.dailyStats.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-purple-600" />
              30-Day Focus Trend
            </h2>
            <div className="h-64 flex items-end gap-1">
              {trends.dailyStats.map((day: any, index: number) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer relative group"
                  style={{ height: `${(day.avgFocus / 100) * 100}%`, minHeight: '4px' }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {new Date(day.date).toLocaleDateString()}<br />
                    Focus: {Math.round(day.avgFocus)}<br />
                    Sessions: {day.sessions}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>{new Date(trends.dailyStats[0]?.date).toLocaleDateString()}</span>
              <span>{new Date(trends.dailyStats[trends.dailyStats.length - 1]?.date).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Best Day Highlight */}
        {trends && trends.summary?.bestDay && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-xl font-bold">Your Best Day</h3>
            </div>
            <p className="text-lg">
              {new Date(trends.summary.bestDay.date).toLocaleDateString()} - 
              Focus Score: {Math.round(trends.summary.bestDay.avgFocus)} - 
              {trends.summary.bestDay.sessions} sessions
            </p>
          </div>
        )}

        {/* AI Insights */}
        {insights && insights.insights && insights.insights.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI-Powered Insights
            </h2>
            <div className="space-y-3">
              {insights.insights.map((insight: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200/50"
                >
                  <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights && insights.recommendations && insights.recommendations.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Personalized Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.recommendations.map((rec: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${
                    rec.priority === 'high'
                      ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300'
                      : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{rec.title}</h3>
                    {rec.priority === 'high' && (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1">
                    {rec.action} <ChevronRight size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns Grid */}
        {insights && insights.patterns && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Hours */}
            {insights.patterns.bestHours && insights.patterns.bestHours.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Your Peak Hours
                </h3>
                <div className="space-y-3">
                  {insights.patterns.bestHours.map((hour: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <span className="font-medium text-gray-800">{hour.hour}:00 - {hour.hour + 1}:00</span>
                      <span className="text-sm font-bold text-purple-600">{Math.round(hour.avgFocus)} focus</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Days */}
            {insights.patterns.bestDays && insights.patterns.bestDays.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Your Best Days
                </h3>
                <div className="space-y-3">
                  {insights.patterns.bestDays.map((day: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <span className="font-medium text-gray-800">{dayNames[day.day]}</span>
                      <span className="text-sm font-bold text-green-600">{Math.round(day.avgFocus)} focus</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optimal Schedule */}
        {schedule && schedule.schedule && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Your Optimal Schedule
              </h2>
              <div className="text-sm text-gray-600">
                Confidence: <span className={`font-bold ${
                  schedule.confidence === 'high' ? 'text-green-600' :
                  schedule.confidence === 'medium' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>{schedule.confidence}</span>
              </div>
            </div>

            {schedule.message && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                {schedule.message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(schedule.schedule).map(([day, sessions]: [string, any]) => (
                <div key={day} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                  <h3 className="font-bold text-gray-800 mb-3 capitalize">{day}</h3>
                  {sessions.length > 0 ? (
                    <div className="space-y-2">
                      {sessions.map((session: any, index: number) => (
                        <div key={index} className="p-2 bg-white rounded-lg text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{session.time}</span>
                            <span className="text-xs text-gray-600">{session.duration}min</span>
                          </div>
                          <div className="text-xs text-purple-600 mt-1">{session.type}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Rest day</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Pro Tips for Maximum Productivity
          </h3>
          <ul className="space-y-2 text-sm">
            <li>• Schedule deep work during your peak hours for best results</li>
            <li>• Take breaks when burnout risk is medium or high</li>
            <li>• Maintain your streak - consistency is key to building habits</li>
            <li>• Use the recommended session length for optimal focus</li>
            <li>• Review your analytics weekly to track improvement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, gradient }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}

function LiveStatCard({ icon, label, value, gradient, subtitle }: any) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-300/50 shadow-lg relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-8 -mt-8`} />
      <div className="relative">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white mb-3`}>
          {icon}
        </div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </motion.div>
  );
}
