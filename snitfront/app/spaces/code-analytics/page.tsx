'use client';

import { useState, useEffect } from 'react';
import { Code, Activity, Clock, TrendingUp, Brain, Zap, GitBranch, FileCode, BarChart3, Eye, Flame, Target, ArrowLeft } from 'lucide-react';
import { sessionsAPI, analyticsAPI } from '@/lib/api-client-new';
import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SampleDataGenerator from '@/components/SampleDataGenerator';

interface CodeMetrics {
  totalSessions: number;
  totalCodingTime: number;
  averageSessionTime: number;
  languageBreakdown: { [key: string]: number };
  focusScore: number;
  productivityTrend: number[];
  peakHours: { hour: number; sessions: number }[];
  distractionEvents: number;
  deepWorkSessions: number;
}

export default function CodeAnalytics() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<CodeMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    } else if (!authLoading && isAuthenticated) {
      fetchAnalytics();
    }
  }, [authLoading, isAuthenticated, router, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Try to use new analytics API first
      try {
        const timeRangeMap = { day: '7d', week: '7d', month: '30d' };
        const apiTimeRange = timeRangeMap[timeRange] as '7d' | '30d' | '90d';
        
        const codeAnalytics = await analyticsAPI.getCodeAnalytics(apiTimeRange);
        
        if (codeAnalytics && codeAnalytics.stats) {
          // Use analytics API data
          const stats = codeAnalytics.stats;
          
          // Convert languageDetails to simple count object
          const languageBreakdown: { [key: string]: number } = {};
          if (codeAnalytics.languageDetails) {
            Object.entries(codeAnalytics.languageDetails).forEach(([lang, data]: [string, any]) => {
              languageBreakdown[lang] = data.sessions || 0;
            });
          }
          
          setMetrics({
            totalSessions: stats.totalSessions || 0,
            totalCodingTime: stats.totalSessions * (stats.avgLinesPerSession || 0) * 60, // estimate
            averageSessionTime: 1800, // 30 min average
            languageBreakdown,
            focusScore: 75, // default
            productivityTrend: [70, 72, 75, 78, 80, 82, 85],
            peakHours: [],
            distractionEvents: 0,
            deepWorkSessions: Math.floor(stats.totalSessions * 0.6)
          });
          
          setSessions(codeAnalytics.recentSessions || []);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('Analytics API not available, falling back to sessions API');
      }
      
      // Fallback to old method
      const response = await sessionsAPI.getAll();
      const allSessions = response.data.sessions || response.data;
      
      // Filter by time range and code sessions
      const now = new Date();
      const timeFilters: Record<string, number> = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };
      
      const filtered = allSessions.filter((session: any) => {
        const sessionDate = new Date(session.startTime || session.createdAt);
        const isInRange = now.getTime() - sessionDate.getTime() < timeFilters[timeRange];
        const isCode = session.sessionType === 'code' || session.codeMetrics || session.language;
        return isInRange && isCode;
      });

      console.log('Filtered code sessions:', filtered.length, filtered);
      setSessions(filtered);
      calculateMetrics(filtered);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (sessions: any[]) => {
    console.log('📊 Calculating metrics for sessions:', sessions.length);
    console.log('Sample session data:', sessions[0]);
    
    // Language breakdown
    const languageBreakdown: { [key: string]: number } = {};
    let totalCodingTime = 0;
    let totalFocusScore = 0;
    let distractionEvents = 0;
    let deepWorkSessions = 0;

    // Peak hours analysis
    const hourlyActivity: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) hourlyActivity[i] = 0;

    sessions.forEach((session: any) => {
      // Language tracking - use language field or default to javascript
      const lang = session.language || 'javascript';
      languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;

      // Time tracking
      if (session.duration) {
        totalCodingTime += session.duration;
      }

      // Focus score - check both focusScore and qualityScore
      const score = session.focusScore ?? session.qualityScore ?? 0;
      if (score > 0) {
        totalFocusScore += score;
        if (score >= 80) deepWorkSessions++;
      }

      // Distraction tracking - use distractions or tabSwitches from metrics
      const distractions = session.distractions ?? session.metrics?.tabSwitches ?? 0;
      distractionEvents += distractions;

      // Peak hours
      const hour = new Date(session.startTime || session.createdAt || session.timestamp).getHours();
      hourlyActivity[hour]++;
    });

    console.log('📈 Calculated metrics:', {
      totalSessions: sessions.length,
      totalCodingTime,
      avgFocusScore: sessions.length ? totalFocusScore / sessions.length : 0,
      languageBreakdown,
      distractionEvents,
      deepWorkSessions,
    });

    // Calculate peak hours
    const peakHours = Object.entries(hourlyActivity)
      .map(([hour, count]) => ({ hour: parseInt(hour), sessions: count }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    // Productivity trend (last 7 days)
    const productivityTrend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const daySessions = sessions.filter((s: any) => {
        const sessionDate = new Date(s.startTime || s.createdAt || s.timestamp);
        return sessionDate.toDateString() === date.toDateString();
      });
      const dayScore = daySessions.reduce((sum: number, s: any) => {
        const score = s.focusScore ?? s.qualityScore ?? 0;
        return sum + score;
      }, 0) / (daySessions.length || 1);
      productivityTrend.push(Math.round(dayScore));
    }

    setMetrics({
      totalSessions: sessions.length,
      totalCodingTime,
      averageSessionTime: sessions.length ? totalCodingTime / sessions.length : 0,
      languageBreakdown,
      focusScore: sessions.length ? totalFocusScore / sessions.length : 0,
      productivityTrend,
      peakHours,
      distractionEvents,
      deepWorkSessions,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-500',
      python: 'bg-green-500',
      java: 'bg-red-500',
      cpp: 'bg-purple-500',
      go: 'bg-cyan-500',
      rust: 'bg-orange-500',
      ruby: 'bg-pink-500',
    };
    return colors[language.toLowerCase()] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/spaces/code">
                <button className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-all">
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Code className="w-10 h-10 text-blue-600" />
                  Code Analytics
                </h1>
                <p className="text-gray-600">
                  Deep insights into your coding patterns and productivity
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sample Data Generator */}
        <SampleDataGenerator />

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Code Sessions Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start a coding session to see your analytics
            </p>
            <Link href="/spaces/code">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Coding
              </button>
            </Link>
          </div>
        ) : (
          <>
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Total Time</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {formatTime(metrics?.totalCodingTime || 0)}
            </h3>
            <p className="text-sm text-gray-600">
              Across {metrics?.totalSessions || 0} sessions
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
              <span className="text-sm text-gray-500">Focus Score</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {Math.round(metrics?.focusScore || 0)}%
            </h3>
            <p className="text-sm text-gray-600">
              Average concentration
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-gray-500">Deep Work</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {metrics?.deepWorkSessions || 0}
            </h3>
            <p className="text-sm text-gray-600">
              High-focus sessions (80%+)
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-red-600" />
              <span className="text-sm text-gray-500">Distractions</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {metrics?.distractionEvents || 0}
            </h3>
            <p className="text-sm text-gray-600">
              Attention breaks detected
            </p>
          </div>
        </div>

        {/* Language Breakdown & Productivity Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Language Heatmap */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileCode className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Language Distribution
              </h2>
            </div>
            <div className="space-y-4">
              {Object.entries(metrics?.languageBreakdown || {})
                .sort((a, b) => b[1] - a[1])
                .map(([language, count]) => {
                  const total = Object.values(metrics?.languageBreakdown || {}).reduce((a, b) => a + b, 0);
                  const percentage = (count / total) * 100;
                  return (
                    <div key={language}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {language}
                        </span>
                        <span className="text-sm text-gray-500">
                          {count} sessions ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${getLanguageColor(language)} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(metrics?.languageBreakdown || {}).length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No language data available
                </p>
              )}
            </div>
          </div>

          {/* Productivity Trend */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">
                7-Day Focus Trend
              </h2>
            </div>
            <div className="space-y-3">
              {metrics?.productivityTrend.map((score, index) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - index));
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-12">
                      {dayName}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${
                          score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      >
                        <span className="text-xs font-bold text-white">{score}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Peak Coding Hours Heatmap */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Peak Coding Hours
            </h2>
          </div>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 24 }, (_, hour) => {
              const activity = metrics?.peakHours.find(p => p.hour === hour);
              const sessions = activity?.sessions || 0;
              const maxSessions = Math.max(...(metrics?.peakHours.map(p => p.sessions) || [1]));
              const intensity = sessions / maxSessions;
              
              return (
                <div
                  key={hour}
                  className="relative group"
                  title={`${hour}:00 - ${sessions} sessions`}
                >
                  <div
                    className={`aspect-square rounded transition-all duration-300 ${
                      intensity > 0.7
                        ? 'bg-blue-600'
                        : intensity > 0.4
                        ? 'bg-blue-400'
                        : intensity > 0.1
                        ? 'bg-blue-200'
                        : 'bg-gray-200'
                    } hover:scale-110`}
                  />
                  <div className="text-xs text-center mt-1 text-gray-600">
                    {hour}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {hour}:00 - {sessions} sessions
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attention Heatmap Correlation */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Focus vs Code Complexity Correlation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Math.round((metrics?.deepWorkSessions || 0) / (metrics?.totalSessions || 1) * 100)}%
              </div>
              <p className="text-sm text-gray-700 font-medium">High Focus Rate</p>
              <p className="text-xs text-gray-600 mt-1">Sessions with 80%+ focus</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatTime(metrics?.averageSessionTime || 0)}
              </div>
              <p className="text-sm text-gray-700 font-medium">Avg Session Time</p>
              <p className="text-xs text-gray-600 mt-1">Mean coding duration</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {((metrics?.distractionEvents || 0) / (metrics?.totalSessions || 1)).toFixed(1)}
              </div>
              <p className="text-sm text-gray-700 font-medium">Distractions/Session</p>
              <p className="text-xs text-gray-600 mt-1">Average interruptions</p>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
