'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { ReasoningTag } from './reasoning-tag';

interface DraftCardProps {
  index: number;
  text: string;
  reasoningTag: string;
  type: 'reply' | 'tweet';
  onSelect: (text: string) => void;
}

export function DraftCard({ index, text, reasoningTag, type, onSelect }: DraftCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onSelect(text);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="bg-dark border border-dark-border rounded-xl p-4 hover:border-accent/30 transition-all cursor-pointer group"
      onClick={handleCopy}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Reasoning tag */}
          <div className="mb-2">
            <ReasoningTag tag={reasoningTag} size="sm" />
          </div>

          {/* Draft text */}
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {text}
          </p>

          {/* Character count */}
          <p className={`text-xs mt-2 ${text.length > 280 ? 'text-red-400' : 'text-gray-600'}`}>
            {text.length}/280 characters
          </p>
        </div>

        {/* Copy button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'text-gray-600 group-hover:text-accent group-hover:bg-accent/10'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </motion.button>
      </div>

      {/* Click hint */}
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-700 group-hover:text-gray-500 transition-colors">
          {copied ? '✅ Copied!' : 'Click to copy'}
        </span>
      </div>
    </motion.div>
  );
}
