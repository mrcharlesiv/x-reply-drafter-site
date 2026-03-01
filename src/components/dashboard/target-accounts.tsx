'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Target, ExternalLink, Star, StarOff } from 'lucide-react';

interface TargetAccount {
  id: string;
  handle: string;
  display_name: string | null;
  notes: string | null;
  priority: number;
  last_tweet_seen_at: string | null;
  created_at: string;
}

export function TargetAccounts() {
  const [targets, setTargets] = useState<TargetAccount[]>([]);
  const [maxTargets, setMaxTargets] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHandle, setNewHandle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchTargets = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/user/targets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;
      const data = await response.json();
      setTargets(data.targets);
      setMaxTargets(data.maxTargets);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const addTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim()) return;

    setAdding(true);
    setAddError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ handle: newHandle, notes: newNotes }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAddError(data.error || 'Failed to add target');
        return;
      }

      setTargets((prev) => [data.target, ...prev]);
      setNewHandle('');
      setNewNotes('');
      setShowAddForm(false);
    } catch {
      setAddError('Failed to add target');
    } finally {
      setAdding(false);
    }
  };

  const removeTarget = async (targetId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/user/targets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetId }),
      });

      setTargets((prev) => prev.filter((t) => t.id !== targetId));
    } catch {
      // silently fail
    }
  };

  const togglePriority = async (targetId: string, currentPriority: number) => {
    const newPriority = currentPriority > 0 ? 0 : 1;
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/user/targets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetId, priority: newPriority }),
      });

      setTargets((prev) =>
        prev.map((t) => (t.id === targetId ? { ...t, priority: newPriority } : t))
      );
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-dark-secondary rounded-xl p-6 h-48" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-secondary border border-dark-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-accent" />
          <h2 className="text-lg font-bold text-white">Target Accounts</h2>
          <span className="text-xs text-gray-500 ml-2">
            {targets.length}/{maxTargets}
          </span>
        </div>

        {targets.length < maxTargets && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg text-sm text-accent hover:bg-accent/20 transition-colors"
          >
            <Plus size={14} />
            Add
          </motion.button>
        )}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={addTarget}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-dark border border-dark-border rounded-lg space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">X Handle</label>
                <input
                  type="text"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  placeholder="@username"
                  className="w-full px-3 py-2 bg-dark-tertiary border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Notes <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Why this account?"
                  className="w-full px-3 py-2 bg-dark-tertiary border border-dark-border rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>

              {addError && (
                <p className="text-xs text-red-400">{addError}</p>
              )}

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={adding || !newHandle.trim()}
                  className="flex-1 px-3 py-2 bg-accent text-dark font-semibold text-sm rounded-lg disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Target'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2 border border-dark-border text-gray-400 text-sm rounded-lg hover:text-white"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Target List */}
      {targets.length === 0 ? (
        <div className="text-center py-8">
          <Target size={32} className="mx-auto text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 mb-2">No target accounts yet</p>
          <p className="text-xs text-gray-600">
            Add X accounts you want to reply to consistently
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {targets
            .sort((a, b) => b.priority - a.priority)
            .map((target, index) => (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-dark/50 border border-dark-border rounded-lg hover:border-accent/30 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => togglePriority(target.id, target.priority)}
                    className="text-gray-600 hover:text-yellow-400 transition-colors"
                    title={target.priority > 0 ? 'Unstar' : 'Star as priority'}
                  >
                    {target.priority > 0 ? (
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    ) : (
                      <StarOff size={14} />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        @{target.handle}
                      </span>
                      <a
                        href={`https://x.com/${target.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink size={12} className="text-gray-500 hover:text-accent" />
                      </a>
                    </div>
                    {target.notes && (
                      <p className="text-xs text-gray-500 truncate">{target.notes}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeTarget(target.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
                  title="Remove target"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
        </div>
      )}

      {targets.length >= maxTargets && (
        <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-lg text-center">
          <p className="text-xs text-gray-400">
            Upgrade your plan for more target accounts
          </p>
        </div>
      )}
    </motion.div>
  );
}
