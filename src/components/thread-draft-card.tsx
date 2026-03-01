'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Layers } from 'lucide-react';
import { ReasoningTag } from './reasoning-tag';

interface ThreadDraftCardProps {
  index: number;
  tweets: string[];
  reasoningTag: string;
  onSelect: (tweets: string[]) => void;
}

export function ThreadDraftCard({ index, tweets, reasoningTag, onSelect }: ThreadDraftCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const threadText = tweets.join('\n\n---\n\n');
    await navigator.clipboard.writeText(threadText);
    setCopied(true);
    onSelect(tweets);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="bg-dark border border-dark-border rounded-xl p-5 hover:border-accent/30 transition-all cursor-pointer group"
      onClick={handleCopy}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-md">
            <Layers size={12} className="text-accent" />
            <span className="text-xs font-medium text-accent">Thread {index + 1}</span>
          </div>
          <ReasoningTag tag={reasoningTag} size="sm" />
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-1.5 rounded-md transition-colors ${
            copied ? 'bg-green-500/20 text-green-400' : 'text-gray-500 group-hover:text-accent'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </motion.button>
      </div>

      {/* Thread tweets */}
      <div className="space-y-3">
        {tweets.map((tweet, tweetIndex) => (
          <div key={tweetIndex} className="relative">
            {/* Thread connector line */}
            {tweetIndex < tweets.length - 1 && (
              <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-dark-border" />
            )}

            <div className="flex gap-3">
              {/* Tweet number indicator */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-dark-tertiary rounded-full text-xs font-medium text-gray-400">
                {tweetIndex + 1}
              </div>

              {/* Tweet text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {tweet.replace(/^\d+\/\d+\s*/, '')}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {tweet.length}/280
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Click hint */}
      <div className="mt-3 pt-3 border-t border-dark-border text-center">
        <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
          {copied ? '✅ Copied to clipboard!' : 'Click to copy thread'}
        </span>
      </div>
    </motion.div>
  );
}
