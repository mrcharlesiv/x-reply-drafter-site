'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Lock, LogOut, Trash2 } from 'lucide-react';

interface UserSettings {
  name: string;
  email: string;
  plan: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          window.location.href = '/';
          return;
        }

        const response = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch settings');

        const data = await response.json();
        setSettings({
          name: data.user.name || '',
          email: data.user.email,
          plan: data.user.plan,
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: settings.name }),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="min-h-screen bg-dark flex items-center justify-center">Loading...</div>;
  }

  if (!settings) {
    return <div className="min-h-screen bg-dark flex items-center justify-center">Error loading settings</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark to-dark-secondary">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

          {/* Messages */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-secondary border border-dark-border rounded-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Profile</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark border border-dark-border rounded-lg text-white focus:outline-none focus:border-accent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full px-4 py-2 bg-dark-tertiary border border-dark-border rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Plan
                </label>
                <div className="px-4 py-2 bg-dark border border-dark-border rounded-lg text-white capitalize">
                  {settings.plan}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-3 bg-accent hover:bg-accent-dark text-dark font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-secondary border border-dark-border rounded-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock size={24} className="text-accent" />
              Security
            </h2>
            <div className="space-y-4">
              <p className="text-gray-400">
                Use your email and password to sign in to your account.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 border border-dark-border hover:border-accent rounded-lg text-white font-semibold transition-colors"
              >
                Change Password
              </motion.button>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold text-red-400 mb-6">Danger Zone</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-400 font-semibold rounded-lg flex items-center gap-2 transition-all"
                >
                  <Trash2 size={18} />
                  Delete Account
                </motion.button>
              </div>

              <div>
                <p className="text-gray-400 mb-4">Sign out from your account</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="px-6 py-3 bg-dark border border-dark-border hover:border-accent text-white font-semibold rounded-lg flex items-center gap-2 transition-all"
                >
                  <LogOut size={18} />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
