'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Zap,
  Brain,
  Code,
  PenTool,
  Music,
  Timer,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

/* Dynamic import – keeps SSR clean (GSAP + canvas = client‑only) */
const ScrollAnimation = dynamic(
  () => import('@/components/landing/ScrollAnimation'),
  { ssr: false },
);

/* -----------------------------------------------------------------
   Text overlays shown on top of the scroll animation frames.
   Each block fades in → holds → fades out as the user scrolls.
------------------------------------------------------------------ */
const textOverlays = [
  {
    startAt: 0.0,
    peakAt: 0.06,
    endAt: 0.15,
    heading: 'Enter Your Flow State',
    subtext: 'AI‑powered focus enhancement that adapts to your mind.',
    position: 'center' as const,
  },
  {
    startAt: 0.15,
    peakAt: 0.22,
    endAt: 0.32,
    heading: 'Your Brain. Optimised.',
    subtext:
      'Real‑time neural engagement tracking to keep you in the zone.',
    position: 'center' as const,
  },
  {
    startAt: 0.32,
    peakAt: 0.40,
    endAt: 0.50,
    heading: 'Zero Distractions.',
    subtext:
      '10 purpose‑built focus spaces — code, write, sketch, compose.',
    position: 'center' as const,
  },
  {
    startAt: 0.50,
    peakAt: 0.58,
    endAt: 0.68,
    heading: 'Backed by Science.',
    subtext:
      'Adaptive Pomodoro intervals, breathing exercises & ambient soundscapes.',
    position: 'center' as const,
  },
  {
    startAt: 0.70,
    peakAt: 0.78,
    endAt: 0.88,
    heading: 'Unlock Peak Performance.',
    subtext: "Join thousands who've transformed their productivity.",
    position: 'center' as const,
  },
  {
    startAt: 0.88,
    peakAt: 0.94,
    endAt: 1.0,
    heading: 'Start Now.',
    subtext: 'Your flow state is one scroll away.',
    position: 'bottom-center' as const,
  },
];

/* ==================================================================
   Landing Page
================================================================== */

export default function LandingPage() {
  return (
    <div className="relative bg-slate-900">
      {/* ───────── Fixed navigation bar ───────── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-12 py-4 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            FlowState
          </span>
        </Link>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link href="/auth/signin">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Sign In
            </motion.button>
          </Link>
          <Link href="/auth/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* ───────── Scroll animation hero ─────────
           240 frames — file naming: ezgif-frame-001 … 240
           6× viewport height scroll distance                 */}
      <ScrollAnimation
        frameCount={240}
        framePath="/frames/ezgif-frame-"
        frameExtension=".jpg"
        framePadding={3}
        frameStart={1}
        scrollHeightMultiplier={6}
        textOverlays={textOverlays}
      />

      {/* ───────── CTA after animation ───────── */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              The Ultimate Productivity
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Experience
              </span>
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
              FlowState combines AI, neuroscience and beautiful design into a
              single platform that helps you do the best work of your life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full text-white font-semibold text-lg overflow-hidden shadow-lg shadow-purple-500/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>

              <Link href="/auth/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold text-lg hover:bg-white/20 transition-colors"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── Features section ───────── */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Stay Focused
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              10 specialised focus spaces designed to optimise your workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{feature.description}</p>

                  <ul className="space-y-2">
                    {feature.points.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Stats section ───────── */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-400/30 rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_70%)]" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Productivity?
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                Join thousands of professionals who&apos;ve already discovered
                their flow state
              </p>

              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
                >
                  Get Started Free
                </motion.button>
              </Link>

              <p className="text-sm text-gray-300 mt-4">
                No credit card required &middot; 14‑day free trial
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FlowState
              </span>
            </div>

            <div className="flex gap-8 text-gray-300">
              <Link
                href="/about"
                className="hover:text-purple-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/features"
                className="hover:text-purple-400 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="hover:text-purple-400 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="hover:text-purple-400 transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="text-gray-400 text-sm">
              &copy; 2026 FlowState. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ==================================================================
   Data
================================================================== */

const features = [
  {
    icon: Code,
    title: 'Code Space',
    description: 'Execute code in 18+ languages with real‑time feedback',
    points: [
      'Multi‑language support',
      'Instant execution',
      'Syntax highlighting',
    ],
  },
  {
    icon: PenTool,
    title: 'Writing Space',
    description: 'Distraction‑free writing with live markdown preview',
    points: ['Live preview', 'Word count tracking', 'Export options'],
  },
  {
    icon: Brain,
    title: 'Whiteboard',
    description: 'Digital canvas with creativity analytics',
    points: ['Unlimited canvas', 'Analytics tracking', 'Export drawings'],
  },
  {
    icon: Music,
    title: 'Music Space',
    description: 'AI‑powered Spotify recommendations for focus',
    points: ['Smart playlists', 'Mood‑based selection', 'Playback control'],
  },
  {
    icon: Timer,
    title: 'Timer Space',
    description: 'Pomodoro and custom timers for productivity',
    points: ['Pomodoro technique', 'Custom intervals', 'Break reminders'],
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Comprehensive insights into your productivity',
    points: ['Session tracking', 'Performance metrics', 'Visual reports'],
  },
];

const stats = [
  { value: '10+', label: 'Focus Spaces' },
  { value: '18+', label: 'Languages' },
  { value: '100%', label: 'Privacy' },
  { value: '24/7', label: 'Available' },
];
