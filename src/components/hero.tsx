'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

export function Hero() {
  const [typedText, setTypedText] = useState('');
  const fullText = '@SomeUser Your thoughts are peak. Have you considered...';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-dark via-dark-secondary to-dark">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full mix-blend-screen filter blur-3xl opacity-10"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-5"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left side - Text content */}
          <motion.div variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-dark-secondary border border-dark-border rounded-full">
              <Sparkles size={16} className="text-accent" />
              <span className="text-sm text-gray-400">AI-powered replies in one click</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-bold leading-tight"
            >
              Draft{' '}
              <span className="text-gradient">viral replies</span> on X
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-400 leading-relaxed"
            >
              Stop staring at a blank reply box. Our AI generates thoughtful, engaging replies that match your voice. No API key needed. One click.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-accent hover:bg-accent-dark rounded-full font-semibold text-dark flex items-center justify-center gap-2 transition-all"
              >
                Add to Chrome - It&apos;s Free
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-dark-border hover:border-accent rounded-full font-semibold text-white transition-all"
              >
                Watch Demo
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-8 pt-4 text-sm text-gray-500">
              <div className="flex flex-col">
                <span className="font-semibold text-white">10K+</span>
                <span>Active Users</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">1M+</span>
                <span>Replies Generated</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">4.8★</span>
                <span>Chrome Store Rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Browser mockup with animation */}
          <motion.div
            variants={itemVariants}
            className="relative h-full min-h-[600px] lg:min-h-[700px]"
          >
            {/* Browser frame */}
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-dark-border glass"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Browser chrome */}
              <div className="bg-dark-secondary border-b border-dark-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center text-xs text-gray-500">
                  x.com
                </div>
              </div>

              {/* X mockup content */}
              <div className="bg-dark p-6 min-h-[600px] lg:min-h-[670px] flex flex-col space-y-4">
                {/* Tweet being replied to */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="border-b border-dark-border pb-4"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark-tertiary" />
                    <div className="flex-1">
                      <div className="font-bold text-white">@Influencer</div>
                      <div className="text-gray-500 text-sm">Just shipped something cool. Took months.</div>
                    </div>
                  </div>
                </motion.div>

                {/* Reply box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="border border-dark-border rounded-2xl p-4 bg-dark-secondary space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Replying to @Influencer</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="px-3 py-1 bg-accent text-dark rounded-full text-xs font-bold hover:bg-accent-dark transition-colors"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3, duration: 0.4 }}
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles size={12} />
                        Draft Reply
                      </span>
                    </motion.button>
                  </div>

                  {/* Typing effect - text being generated */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="text-white text-base leading-relaxed font-normal"
                  >
                    {typedText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                      }}
                      className="text-accent ml-1"
                    >
                      |
                    </motion.span>
                  </motion.div>

                  {/* Generated drafts */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 2.5, duration: 0.6 }}
                    className="space-y-2 pt-2 border-t border-dark-border"
                  >
                    <div className="text-xs text-gray-500 font-semibold">Auto-generated alternatives:</div>
                    <div className="text-sm text-gray-300 bg-dark px-3 py-2 rounded hover:bg-dark-tertiary cursor-pointer transition">
                      Absolutely brilliant execution! The attention to detail...
                    </div>
                    <div className="text-sm text-gray-300 bg-dark px-3 py-2 rounded hover:bg-dark-tertiary cursor-pointer transition">
                      This is what innovation looks like. Executed perfectly...
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Glow effect around browser */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent to-purple-500 -z-10 blur-2xl opacity-20"
              animate={{ opacity: [0.2, 0.35, 0.2] }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
