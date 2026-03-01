'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStreakDisplay, type StreakData } from '@/lib/streaks';

interface StreakDisplayProps {
  compact?: boolean;
  token?: string;
}

export function StreakDisplay({ compact = false, token }: StreakDisplayProps) {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const authToken = token || localStorage.getItem('authToken');
        if (!authToken) return;

        const response = await fetch('/api/user/streak', {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) return;
        const result = await response.json();
        setData(result);

        // Show celebration for milestones
        if (result.currentStreak > 0 && [7, 14, 30, 50, 100].includes(result.currentStreak)) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
      } catch {
        // Silently fail — streak is non-critical
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [token]);

  if (loading || !data) {
    return compact ? null : (
      <div className="animate-pulse bg-dark-secondary rounded-xl p-4 h-24" />
    );
  }

  const { emoji, message } = getStreakDisplay(data.currentStreak);
  const goalProgress = data.weeklyGoal > 0 ? Math.min(100, (data.weeklyDrafts / data.weeklyGoal) * 100) : 0;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-dark-secondary border border-dark-border rounded-full"
      >
        <span className="text-lg">{emoji}</span>
        <span className="text-sm font-bold text-white">{data.currentStreak}</span>
      </motion.div>
    );
  }

  return (
    <>
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6 }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white"
              >
                {data.currentStreak}-Day Streak! 🔥
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-secondary border border-dark-border rounded-xl p-6"
      >
        {/* Streak counter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.span
              animate={data.currentStreak > 0 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-4xl"
            >
              {emoji}
            </motion.span>
            <div>
              <div className="text-3xl font-bold text-white">{data.currentStreak}</div>
              <div className="text-sm text-gray-400">{message}</div>
            </div>
          </div>

          {data.longestStreak > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Best</div>
              <div className="text-lg font-bold text-accent">{data.longestStreak}</div>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {data.streakStatus === 'at_risk' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mb-4 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-400"
          >
            ⚠️ Draft a reply today to keep your streak alive!
          </motion.div>
        )}

        {data.streakStatus === 'broken' && data.currentStreak === 0 && (
          <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            Your streak was reset. Start a new one today!
          </div>
        )}

        {/* Streak freeze badge (Pro only) */}
        {data.streakFreezeAvailable && (
          <div className="mb-4 flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <span className="text-sm">❄️</span>
            <span className="text-xs text-blue-400">Streak Freeze available (1/month)</span>
          </div>
        )}

        {/* Weekly goal progress */}
        <div className="mt-4 pt-4 border-t border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Weekly Goal</span>
            <span className="text-sm text-gray-300">
              {data.weeklyDrafts}/{data.weeklyGoal} replies
            </span>
          </div>
          <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                goalProgress >= 100
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : 'bg-gradient-to-r from-accent to-blue-400'
              }`}
            />
          </div>
          {goalProgress >= 100 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-400 mt-1"
            >
              ✅ Weekly goal reached!
            </motion.p>
          )}
        </div>
      </motion.div>
    </>
  );
}
