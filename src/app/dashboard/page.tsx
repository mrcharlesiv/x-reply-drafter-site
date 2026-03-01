'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Settings, Download,
  MessageSquare, PenLine, Layers, Award, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/stats-card';
import { StreakDisplay } from '@/components/dashboard/streak-display';
import { ActivityHeatmap } from '@/components/dashboard/activity-heatmap';
import { TargetAccounts } from '@/components/dashboard/target-accounts';
import { ReasoningTag } from '@/components/reasoning-tag';
import { OnboardingFlow, useOnboarding } from '@/components/onboarding/onboarding-flow';

interface DashboardData {
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
  overview: {
    totalDrafts: number;
    weeklyDrafts: number;
    monthlyDrafts: number;
    savedPrompts: number;
    targetAccounts: number;
  };
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
    weeklyGoal: number;
  };
  usage: {
    dailyUsage: number;
    dailyLimit: number | null;
  };
  heatmapData: Record<string, number>;
  personaStats: Record<string, number>;
  typeStats: Record<string, number>;
  tagStats: Record<string, number>;
  weeklyTrend: Array<{ week: string; count: number }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const { shouldShow: showOnboarding, markComplete: completeOnboarding } = useOnboarding();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Not authenticated');
          return;
        }

        const response = await fetch('/api/user/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setData(result);

        // Track dashboard view
        fetch('/api/user/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventType: 'dashboard_viewed' }),
        }).catch(() => {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportCSV = useCallback(async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/export', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        alert('CSV export is available on Pro and Team plans. Upgrade to access this feature.');
        return;
      }

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `viraldraft-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
          />
          <span className="text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="text-accent hover:underline">Back to home</Link>
        </div>
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
      {/* Onboarding overlay (Feature 1) */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={completeOnboarding}
          onDismiss={completeOnboarding}
        />
      )}

      {/* Header */}
      <div className="border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
                <p className="text-gray-400 text-sm">
                  Welcome back, {data.user.name || data.user.email}
                </p>
              </div>
              {/* Compact streak badge in header */}
              <StreakDisplay compact />
            </div>

            <div className="flex items-center gap-3">
              {/* Export CSV button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-dark-secondary border border-dark-border rounded-lg hover:border-accent transition-colors text-sm disabled:opacity-50"
              >
                <Download size={16} />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </motion.button>

              <motion.a
                href="/dashboard/settings"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-dark-secondary border border-dark-border rounded-lg hover:border-accent transition-colors text-sm"
              >
                <Settings size={16} />
                Settings
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Plan Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-dark-secondary border border-dark-border rounded-full"
        >
          <span className="text-sm text-gray-400">Plan:</span>
          <span className="text-sm font-semibold text-accent capitalize">{data.user.plan}</span>
          {data.user.plan === 'free' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="ml-3 px-3 py-1 bg-accent text-dark text-xs font-bold rounded-full hover:bg-accent-dark"
            >
              Upgrade to Pro
            </motion.button>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Total Drafts"
            value={data.overview.totalDrafts}
            subtitle="All time"
            icon="📊"
            color="blue"
          />
          <StatsCard
            title="This Week"
            value={data.overview.weeklyDrafts}
            subtitle="7-day total"
            icon="⚡"
            color="green"
          />
          <StatsCard
            title="This Month"
            value={data.overview.monthlyDrafts}
            subtitle="30-day total"
            icon="📈"
            color="purple"
          />
          <StatsCard
            title="Daily Usage"
            value={`${data.usage.dailyUsage}${data.usage.dailyLimit ? `/${data.usage.dailyLimit}` : ''}`}
            subtitle={data.usage.dailyLimit ? `${Math.round(limitPercentage)}% used` : 'Unlimited'}
            icon="🎯"
            color="orange"
          />
          <StatsCard
            title="Target Accounts"
            value={data.overview.targetAccounts}
            subtitle="Monitoring"
            icon="🎯"
            color="blue"
          />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Streak Display (Feature 6) */}
            <StreakDisplay />

            {/* Activity Heatmap (Feature 11) */}
            <ActivityHeatmap data={data.heatmapData} />

            {/* Weekly Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-secondary border border-dark-border rounded-xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" />
                Weekly Trend
              </h3>
              <div className="flex items-end gap-3 h-32">
                {data.weeklyTrend.map((week, i) => {
                  const maxCount = Math.max(...data.weeklyTrend.map(w => w.count), 1);
                  const height = (week.count / maxCount) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-gray-400">{week.count}</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(height, 4)}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-accent/30 to-accent/60 rounded-t-md"
                      />
                      <span className="text-xs text-gray-500">{week.week}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">
            {/* Target Accounts (Feature 5) */}
            <TargetAccounts />

            {/* Draft Type Breakdown (Feature 10) */}
            {Object.keys(data.typeStats).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-secondary border border-dark-border rounded-xl p-6"
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Layers size={16} className="text-accent" />
                  Content Types
                </h3>
                <div className="space-y-3">
                  {Object.entries(data.typeStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => {
                      const total = Object.values(data.typeStats).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? (count / total) * 100 : 0;
                      const icons: Record<string, React.ReactNode> = {
                        reply: <MessageSquare size={12} />,
                        tweet: <PenLine size={12} />,
                        thread: <Layers size={12} />,
                      };
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-1.5 text-sm text-gray-300 capitalize">
                              {icons[type] || null}
                              {type}
                            </span>
                            <span className="text-xs text-gray-500">{count} ({Math.round(pct)}%)</span>
                          </div>
                          <div className="h-1.5 bg-dark-tertiary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-accent/60 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* Reasoning Tag Stats (Feature 4) */}
            {Object.keys(data.tagStats).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-secondary border border-dark-border rounded-xl p-6"
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" />
                  Top Strategies
                </h3>
                <div className="space-y-2">
                  {Object.entries(data.tagStats)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([tag, count]) => (
                      <div key={tag} className="flex items-center justify-between">
                        <ReasoningTag tag={tag} size="sm" />
                        <span className="text-xs text-gray-500">{count}×</span>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Persona Usage */}
        {Object.keys(data.personaStats).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-secondary border border-dark-border rounded-xl p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award size={24} className="text-accent" />
              Persona Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.personaStats)
                .sort(([, a], [, b]) => b - a)
                .map(([persona, count]) => {
                  const maxCount = Math.max(...Object.values(data.personaStats));
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={persona} className="p-4 bg-dark/50 border border-dark-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="capitalize text-sm font-medium text-gray-300">
                          {persona.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500">{count} uses</span>
                      </div>
                      <div className="h-2 bg-dark-tertiary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full bg-gradient-to-r from-accent to-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* CTA for Free Users */}
        {data.user.plan === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-accent/10 to-blue-600/10 border border-accent/30 rounded-xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              Unlock Full Analytics + CSV Export
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Upgrade to Pro for unlimited drafts, thread generation, detailed analytics, CSV exports, and streak freezes.
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
