'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, PenLine, Layers } from 'lucide-react';

export type DraftMode = 'reply' | 'tweet' | 'thread';

interface ModeSelectorProps {
  mode: DraftMode;
  onChange: (mode: DraftMode) => void;
  compact?: boolean;
}

const MODES: Array<{ value: DraftMode; label: string; icon: React.ReactNode; description: string }> = [
  {
    value: 'reply',
    label: 'Reply',
    icon: <MessageSquare size={16} />,
    description: 'Reply to a tweet',
  },
  {
    value: 'tweet',
    label: 'Tweet',
    icon: <PenLine size={16} />,
    description: 'Compose a new tweet',
  },
  {
    value: 'thread',
    label: 'Thread',
    icon: <Layers size={16} />,
    description: 'Create a 3-tweet thread',
  },
];

export function ModeSelector({ mode, onChange, compact = false }: ModeSelectorProps) {
  return (
    <div className={`flex ${compact ? 'gap-1' : 'gap-2'} p-1 bg-dark border border-dark-border rounded-lg`}>
      {MODES.map((m) => (
        <motion.button
          key={m.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(m.value)}
          title={m.description}
          className={`flex items-center gap-1.5 ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
          } rounded-md font-medium transition-all ${
            mode === m.value
              ? 'bg-accent text-dark shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-dark-tertiary'
          }`}
        >
          {m.icon}
          <span>{m.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
