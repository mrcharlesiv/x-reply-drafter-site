'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Zap, TrendingUp, Settings } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';

interface UserData {
  user: {
    id: string;
    email: string;
    name: string;
    plan: 'free' | 'pro' | 'team';
  };
  usage: {
    draftsThisWeek: number;
    dailyUsage: number;
    dailyLimit: number | null;
  };
  personaStats: Record<string, number>;
  savedPromptsCount: number;
  plan: string;
}

export default function Dashboard() {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Not authenticated');
          return;
        }

        const response = await fetch('/api/user/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-gray-400">No data found</div>
      </div>
    );
  }

  const limitPercentage = data.usage.dailyLimit
    ? (data.usage.dailyUsage / data.usage.dailyLimit) * 100
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark to-dark-secondary">
      {/* Header */}
      <div className="border-b border-dark-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, {data.user.name || data.user.email}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-dark-secondary border border-dark-border rounded-lg hover:border-accent transition-colors"
            >
              <Settings size={18} />
              Settings
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Plan Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-dark-secondary border border-dark-border rounded-full"
        >
          <span className="text-sm text-gray-400">Current Plan:</span>
          <span className="text-sm font-semibold text-accent capitalize">
            {data.plan || 'Free'}
          </span>
          {data.plan === 'free' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="ml-4 px-3 py-1 bg-accent text-dark text-xs font-bold rounded-full hover:bg-accent-dark"
            >
              Upgrade to Pro
            </motion.button>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard
            title="Drafts This Week"
            value={data.usage.draftsThisWeek}
            subtitle="7-day usage"
            icon="📊"
            color="blue"
          />
          <StatsCard
            title="Daily Usage"
            value={`${data.usage.dailyUsage}${
              data.usage.dailyLimit ? `/${data.usage.dailyLimit}` : ''
            }`}
            subtitle={
              data.usage.dailyLimit
                ? `${Math.round(limitPercentage)}% of daily limit`
                : 'Unlimited'
            }
            icon="⚡"
            color="green"
          />
          <StatsCard
            title="Saved Prompts"
            value={data.savedPromptsCount}
            subtitle="Quick templates"
            icon="💾"
            color="purple"
          />
          <StatsCard
            title="Most Used"
            value={
              Object.keys(data.personaStats).length > 0
                ? Object.entries(data.personaStats).sort(
                    ([, a], [, b]) => b - a
                  )[0][0]
                : 'None'
            }
            subtitle="Persona"
            icon="🎭"
            color="orange"
          />
        </div>

        {/* Persona Usage */}
        {Object.keys(data.personaStats).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-secondary border border-dark-border rounded-xl p-8 mb-12"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp size={24} className="text-accent" />
              Persona Usage
            </h2>
            <div className="space-y-4">
              {Object.entries(data.personaStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([persona, count]) => (
                  <div key={persona} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize text-gray-300">{persona}</span>
                      <span className="text-sm text-gray-500">{count} uses</span>
                    </div>
                    <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (count /
                              Math.max(
                                ...Object.values(data.personaStats)
                              )) *
                            100
                          }%`,
                        }}
                        transition={{ duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-accent to-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* CTA for Pro Features */}
        {data.plan === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-accent/10 to-blue-600/10 border border-accent/30 rounded-xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              Unlock Unlimited Drafts
            </h3>
            <p className="text-gray-400 mb-6">
              Upgrade to Pro for unlimited drafts, saved prompts, and more.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-accent text-dark font-bold rounded-full hover:bg-accent-dark transition-all"
            >
              Start Free Trial
            </motion.button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
