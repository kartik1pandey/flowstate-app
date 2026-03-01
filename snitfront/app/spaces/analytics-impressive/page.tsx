'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import { analyticsAPI, sessionsAPI } from '@/lib/api-client-new';
import { 
  Activity, Brain, TrendingUp, Zap, AlertTriangle, 
  CheckCircle, Code, Palette, Clock, Target, Flame,
  BarChart3, LineChart, PieChart, ArrowUp, ArrowDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImpressiveAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [codeStats, setCodeStats] = useState<any>(null);
  const [whiteboardStats, setWhiteboardStats] = useState<any>(null);
  const [pathwayInsights, setPathwayInsights] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    } else {
      fetchAllAnalytics();
    }
  }, [isAuthenticated, timeRange]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics in parallel
      const [overviewData, codeData, whiteboardData] = await Promise.all([
        analyticsAPI.getOverview(timeRange).catch(() => null),
        analyticsAPI.getCodeAnalytics(timeRange).catch(() => null),
        analyticsAPI.getWhiteboardAnalytics(timeRange).catch(() => null),
      ]);
      
      setOverview(overviewData);
      setCodeStats(codeData);
      setWhiteboardStats(whiteboardData);
      
      // Try to get Pathway insights
      try {
        const insights = await analyticsAPI.getInsights();
        setPathwayInsights(insights);
      } catch (error) {
        console.log('Pathway insights not available yet');
      }
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = async () => {
    try {
      setGenerating(true);
      
      // Generate 50 sample sessions
      const response = await fetch('/api/generate-sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ count: 50 })
      });
      
      if (response.ok) {
        // Refresh analytics
        await fetchAllAnalytics();
        alert('✅ Generated 50 sample sessions! Analytics updated.');
      } else {
        alert('❌ Failed to generate sample data. Check console for errors.');
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
      alert('❌ Error generating sample data');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-xl text-gray-700">Loading impressive analytics...</p>
        </div>
      </div>
    );
  }

  const hasData = overview?.overview?.totalSessions > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BarChart3 className="w-12 h-12 text-blue-600" />
            FlowState Analytics
            <span className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full">
              AI-Powered
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time insights powered by Pathway stream processing
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          
          <button
            onClick={generateSampleData}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {generating ? '⏳ Generating...' : '🎲 Generate Sample Data'}
          </button>
        </div>

        {!hasData ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Activity className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Data Yet - Let's Create Some!
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Click the button above to generate 50 sample sessions and see the impressive analytics in action
            </p>
            <button
              onClick={generateSampleData}
              disabled={generating}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50"
            >
              {generating ? '⏳ Generating Amazing Data...' : '🚀 Generate Sample Data Now'}
            </button>
          </div>
        ) : (
          <>
            {/* Pathway AI Insights Panel */}
            {pathwayInsights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 mb-8 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">AI-Powered Insights (Pathway)</h2>
                  <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
                    ⚡ Real-time
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm opacity-90 mb-1">Productivity Level</div>
                    <div className="text-3xl font-bold">
                      {pathwayInsights.productivity_level || 'Excellent'} ⭐
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm opacity-90 mb-1">Burnout Risk</div>
                    <div className="text-3xl font-bold flex items-center gap-2">
                      {pathwayInsights.burnout?.risk_level || 'Low'}
                      {(pathwayInsights.burnout?.risk_level === 'low' || !pathwayInsights.burnout) ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <AlertTriangle className="w-6 h-6" />
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-sm opacity-90 mb-1">Pattern Detected</div>
                    <div className="text-2xl font-bold">
                      {pathwayInsights.pattern || 'Peak Performer'} 🏆
                    </div>
                  </div>
                </div>
                
                {pathwayInsights.recommendation && (
                  <div className="mt-4 bg-white/10 rounded-xl p-4">
                    <div className="text-sm opacity-90 mb-2">💡 AI Recommendation</div>
                    <div className="text-lg">{pathwayInsights.recommendation}</div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                icon={<Activity className="w-8 h-8" />}
                title="Total Sessions"
                value={overview?.overview?.totalSessions || 0}
                color="blue"
                trend="up"
              />
              <MetricCard
                icon={<Brain className="w-8 h-8" />}
                title="Avg Focus Score"
                value={`${overview?.overview?.avgFocusScore || 0}%`}
                color="purple"
                trend={overview?.overview?.avgFocusScore > 70 ? 'up' : 'down'}
              />
              <MetricCard
                icon={<Clock className="w-8 h-8" />}
                title="Total Time"
                value={`${Math.round((overview?.overview?.totalDuration || 0) / 3600)}h`}
                color="green"
                trend="up"
              />
              <MetricCard
                icon={<Flame className="w-8 h-8" />}
                title="Deep Work Sessions"
                value={overview?.overview?.deepWorkSessions || 0}
                color="orange"
                trend="up"
              />
            </div>

            {/* Session Type Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Code className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Code Sessions</h2>
                  <span className="ml-auto text-3xl font-bold text-blue-600">
                    {overview?.breakdown?.code || 0}
                  </span>
                </div>
                
                {codeStats?.stats && (
                  <div className="space-y-3">
                    <StatRow label="Total Lines" value={codeStats.stats.totalLines} />
                    <StatRow label="Avg Complexity" value={codeStats.stats.avgComplexity} />
                    <StatRow label="Languages Used" value={Object.keys(codeStats.languageDetails || {}).length} />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Whiteboard Sessions</h2>
                  <span className="ml-auto text-3xl font-bold text-purple-600">
                    {overview?.breakdown?.whiteboard || 0}
                  </span>
                </div>
                
                {whiteboardStats?.stats && (
                  <div className="space-y-3">
                    <StatRow label="Total Strokes" value={whiteboardStats.stats.totalStrokes} />
                    <StatRow label="Avg Creativity" value={`${whiteboardStats.stats.avgCreativity}%`} />
                    <StatRow label="Shapes Drawn" value={whiteboardStats.stats.totalShapes} />
                  </div>
                )}
              </div>
            </div>

            {/* Language Breakdown */}
            {overview?.topLanguages && overview.topLanguages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <PieChart className="w-6 h-6 text-blue-600" />
                  Top Programming Languages
                </h2>
                
                <div className="space-y-4">
                  {overview.topLanguages.map((lang: any, index: number) => {
                    const total = overview.topLanguages.reduce((sum: number, l: any) => sum + l.sessions, 0);
                    const percentage = (lang.sessions / total) * 100;
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{lang.language}</span>
                          <span className="text-gray-600">{lang.sessions} sessions ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Productivity Trends */}
            {overview?.trends && overview.trends.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <LineChart className="w-6 h-6 text-green-600" />
                  Productivity Trends
                </h2>
                
                <div className="space-y-3">
                  {overview.trends.slice(-7).map((trend: any, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-24">
                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-8">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${trend.avgFocus}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`h-8 rounded-full flex items-center justify-end pr-3 ${
                            trend.avgFocus >= 80 ? 'bg-green-500' :
                            trend.avgFocus >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                        >
                          <span className="text-white font-bold text-sm">{trend.avgFocus}%</span>
                        </motion.div>
                      </div>
                      <span className="text-sm text-gray-600 w-20">{trend.sessions} sessions</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, color, trend }: any) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
    >
      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <div className="flex items-center gap-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend === 'up' && <ArrowUp className="w-5 h-5 text-green-500" />}
        {trend === 'down' && <ArrowDown className="w-5 h-5 text-red-500" />}
      </div>
    </motion.div>
  );
}

function StatRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}
