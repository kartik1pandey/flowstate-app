'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useFlowStore } from '@/lib/store';
import FlowIndicator from '@/components/FlowIndicator';
import InterventionOverlay from '@/components/InterventionOverlay';
import AttentionTracker from '@/components/AttentionTracker';
import { 
  Play, 
  Pause, 
  TrendingUp, 
  Settings as SettingsIcon, 
  LogOut,
  Zap,
  Clock,
  Target,
  Activity
} from 'lucide-react';
import { sessionsAPI } from '@/lib/api-client-new';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import {
  CodeIcon,
  BookIcon,
  PenIcon,
  TimerIcon,
  PaletteIcon,
  MusicIcon,
  ChartIcon,
  WindIcon,
  ActivityIcon,
  BrainIcon,
  ChatIcon
} from '@/components/AnimatedIcons';

const focusSpaces = [
  { 
    href: '/spaces/code', 
    AnimatedIcon: CodeIcon,
    emoji: '💻',
    title: 'Code Editor', 
    description: 'Write code with attention tracking',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    bgGradient: 'from-blue-500/10 via-cyan-500/10 to-teal-500/10'
  },
  { 
    href: '/spaces/reading', 
    AnimatedIcon: BookIcon,
    emoji: '📚',
    title: 'Reading Space', 
    description: 'Read with comprehension tracking',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    bgGradient: 'from-green-500/10 via-emerald-500/10 to-teal-500/10'
  },
  { 
    href: '/spaces/writing', 
    AnimatedIcon: PenIcon,
    emoji: '✍️',
    title: 'Writing Space', 
    description: 'Write with AI assistance',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    bgGradient: 'from-purple-500/10 via-pink-500/10 to-rose-500/10'
  },
  { 
    href: '/spaces/timer', 
    AnimatedIcon: TimerIcon,
    emoji: '⏱️',
    title: 'Focus Timer', 
    description: 'Pomodoro with flow detection',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    bgGradient: 'from-orange-500/10 via-red-500/10 to-pink-500/10'
  },
  { 
    href: '/spaces/whiteboard', 
    AnimatedIcon: PaletteIcon,
    emoji: '🎨',
    title: 'Whiteboard', 
    description: 'Brainstorm and visualize',
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    bgGradient: 'from-yellow-500/10 via-orange-500/10 to-red-500/10'
  },
  { 
    href: '/spaces/music', 
    AnimatedIcon: MusicIcon,
    emoji: '🎵',
    title: 'Music Intelligence', 
    description: 'AI-powered focus music',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    bgGradient: 'from-pink-500/10 via-rose-500/10 to-red-500/10'
  },
  { 
    href: '/spaces/code-analytics', 
    AnimatedIcon: ChartIcon,
    emoji: '📊',
    title: 'Code Analytics', 
    description: 'Deep coding insights & heatmaps',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    bgGradient: 'from-indigo-500/10 via-purple-500/10 to-pink-500/10'
  },
  { 
    href: '/spaces/breathing', 
    AnimatedIcon: WindIcon,
    emoji: '🌬️',
    title: 'Breathing Space', 
    description: 'Guided breathing exercises',
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    bgGradient: 'from-teal-500/10 via-cyan-500/10 to-blue-500/10'
  },
  { 
    href: '/spaces/whiteboard-analytics', 
    AnimatedIcon: ActivityIcon,
    emoji: '🎯',
    title: 'Whiteboard Analytics', 
    description: 'Creativity & flow insights',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgGradient: 'from-violet-500/10 via-purple-500/10 to-fuchsia-500/10'
  },
  { 
    href: '/spaces/chat', 
    AnimatedIcon: ChatIcon,
    emoji: '🧠',
    title: 'AI Mental Health Chat', 
    description: 'Personal AI assistant with your data',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    bgGradient: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10'
  },
  { 
    href: '/analytics', 
    AnimatedIcon: ChartIcon,
    emoji: '📈',
    title: 'Analytics', 
    description: 'View productivity insights',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    bgGradient: 'from-emerald-500/10 via-green-500/10 to-teal-500/10'
  },
];

export default function Dashboard() {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const router = useRouter();
  const { isInFlow, startFlowSession, endFlowSession, flowScore, sessionStartTime } = useFlowStore();
  const [isProtectionEnabled, setIsProtectionEnabled] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    } else if (isAuthenticated) {
      loadRecentSessions();
    }
  }, [loading, isAuthenticated, router]);

  const loadRecentSessions = async () => {
    try {
      const data = await sessionsAPI.getAll({ limit: 3 });
      setRecentSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
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

  const handleStartSession = async () => {
    startFlowSession();
    setIsMonitoring(true);

    try {
      await sessionsAPI.create({
        startTime: new Date(),
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleEndSession = async () => {
    setIsMonitoring(false);
    endFlowSession();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <FlowIndicator />
      <InterventionOverlay />
      <AttentionTracker isActive={isInFlow} />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [180, 0, 180],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-purple-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">FlowState</h1>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-700 hidden md:block font-medium">
                {user?.name}
              </span>
              <Link
                href="/analytics"
                className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-lg transition-all border border-purple-200/50 text-gray-700 hover:text-purple-600"
              >
                <TrendingUp size={20} />
                <span className="hidden md:block">Analytics</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-lg transition-all border border-purple-200/50 text-gray-700 hover:text-purple-600"
              >
                <SettingsIcon size={20} />
                <span className="hidden md:block">Settings</span>
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-lg transition-all border border-purple-200/50 text-gray-700 hover:text-red-600"
              >
                <LogOut size={20} />
                <span className="hidden md:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              {getGreeting()}, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-xl text-gray-600">
              Ready to enter your flow state and achieve peak performance?
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-200/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {isInFlow && sessionStartTime 
                    ? Math.floor((Date.now() - new Date(sessionStartTime).getTime()) / 60000) 
                    : 0}m
                </span>
              </div>
              <h3 className="text-gray-800 font-semibold mb-1">Current Session</h3>
              <p className="text-gray-600 text-sm">Time in flow</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-green-200/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {Math.round(flowScore)}
                </span>
              </div>
              <h3 className="text-gray-800 font-semibold mb-1">Flow Score</h3>
              <p className="text-gray-600 text-sm">Current performance</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-200/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {recentSessions.length}
                </span>
              </div>
              <h3 className="text-gray-800 font-semibold mb-1">Recent Sessions</h3>
              <p className="text-gray-600 text-sm">Last 7 days</p>
            </motion.div>
          </div>

          {/* Flow Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-100/80 to-pink-100/80 backdrop-blur-sm p-8 rounded-3xl mb-12 relative overflow-hidden border border-purple-200/50 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
            
            <div className="relative z-10 text-center">
              {!isInFlow ? (
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Start Your Flow Session
                  </h3>
                  <p className="text-gray-700 mb-8 text-lg">
                    Click below to begin monitoring and enter your optimal focus state
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartSession}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
                  >
                    <Play size={24} />
                    Start Flow Session
                  </motion.button>
                </div>
              ) : (
                <div>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-6"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/50">
                      <Zap className="w-16 h-16 text-white" />
                    </div>
                  </motion.div>
                  
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Flow Session Active
                  </h3>
                  <p className="text-gray-700 mb-2 text-lg">
                    {sessionStartTime && `Started ${new Date(sessionStartTime).toLocaleTimeString()}`}
                  </p>
                  <div className="mb-8">
                    <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{Math.round(flowScore)}</div>
                    <div className="text-gray-700">Current Flow Score</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEndSession}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-white/80 backdrop-blur-sm border border-purple-200 text-gray-800 rounded-2xl font-bold text-lg hover:bg-white transition-all shadow-lg"
                  >
                    <Pause size={24} />
                    End Session
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Focus Spaces */}
          <div className="mb-12">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-gray-800 mb-6"
            >
              Focus Spaces
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {focusSpaces.map((space, index) => (
                <motion.div
                  key={space.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Link href={space.href}>
                    <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-purple-200/50 hover:border-purple-400/50 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl min-h-[240px] flex flex-col items-center justify-center text-center">
                      <div className={`absolute inset-0 bg-gradient-to-br ${space.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      
                      <div className="relative z-10 flex flex-col items-center">
                        {/* Large Emoji in Center */}
                        <motion.div
                          className="text-7xl mb-4"
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          {space.emoji}
                        </motion.div>
                        
                        {/* Animated Icon Background */}
                        <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${space.gradient} rounded-xl flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity text-white`}>
                          <space.AnimatedIcon />
                        </div>
                        
                        <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900">{space.title}</h4>
                        <p className="text-gray-600 text-sm group-hover:text-gray-700">{space.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Protection Settings */}
          {isInFlow && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-200/50 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Flow Protection
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 mb-1">
                    Distraction Blocking
                  </p>
                  <p className="text-sm text-gray-600">
                    Block notifications and distraction sites
                  </p>
                </div>
                <button
                  onClick={() => setIsProtectionEnabled(!isProtectionEnabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    isProtectionEnabled ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'
                  }`}
                >
                  <motion.span
                    animate={{ x: isProtectionEnabled ? 28 : 4 }}
                    className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg"
                  />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
