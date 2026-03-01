'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TAG_DESCRIPTIONS: Record<string, { description: string; icon: string; color: string }> = {
  'Hooks with question': {
    description: 'Ends with a question to invite engagement and boost reply rate.',
    icon: '❓',
    color: 'from-blue-500/20 to-blue-600/20 border-blue-500/40 text-blue-400',
  },
  'Validates then pivots': {
    description: 'Agrees with the original point, then adds a new perspective.',
    icon: '🔄',
    color: 'from-green-500/20 to-green-600/20 border-green-500/40 text-green-400',
  },
  'Pattern interrupt': {
    description: 'Breaks expected response patterns to stand out in the timeline.',
    icon: '⚡',
    color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40 text-yellow-400',
  },
  'Personal story': {
    description: 'Shares a personal experience to create authentic connection.',
    icon: '📖',
    color: 'from-purple-500/20 to-purple-600/20 border-purple-500/40 text-purple-400',
  },
  'Data-backed': {
    description: 'Uses specific data, numbers, or evidence to add credibility.',
    icon: '📊',
    color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/40 text-cyan-400',
  },
  'Contrarian take': {
    description: 'Offers a respectful opposing view to spark discussion.',
    icon: '🎯',
    color: 'from-red-500/20 to-red-600/20 border-red-500/40 text-red-400',
  },
  'Curiosity gap': {
    description: 'Creates intrigue that makes people want to learn more.',
    icon: '🧩',
    color: 'from-orange-500/20 to-orange-600/20 border-orange-500/40 text-orange-400',
  },
};

interface ReasoningTagProps {
  tag: string;
  size?: 'sm' | 'md';
}

export function ReasoningTag({ tag, size = 'sm' }: ReasoningTagProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = TAG_DESCRIPTIONS[tag] || {
    description: 'AI strategy tag',
    icon: '💡',
    color: 'from-gray-500/20 to-gray-600/20 border-gray-500/40 text-gray-400',
  };

  return (
    <div className="relative inline-block">
      <motion.button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center gap-1 ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        } rounded-full bg-gradient-to-r border ${info.color} font-medium transition-all cursor-help`}
      >
        <span>{info.icon}</span>
        <span>{tag}</span>
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-dark-secondary border border-dark-border rounded-lg shadow-xl"
          >
            <p className="text-xs text-gray-300 leading-relaxed">
              <span className="font-semibold text-white">{tag}</span>
              {' — '}
              {info.description}
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="w-2 h-2 bg-dark-secondary border-r border-b border-dark-border rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
