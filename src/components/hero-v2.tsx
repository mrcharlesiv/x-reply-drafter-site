'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

interface TweetProps {
  author: string;
  handle: string;
  avatar: string;
  text: string;
  time: string;
  isActive?: boolean;
}

const Tweet = ({ author, handle, avatar, text, time, isActive }: TweetProps) => (
  <div className={`border-b border-gray-700 pb-4 ${isActive ? 'bg-gray-900 rounded-lg p-4' : ''}`}>
    <div className="flex gap-3">
      <div className={`w-12 h-12 rounded-full flex-shrink-0 ${avatar}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{author}</span>
          <span className="text-gray-500">@{handle}</span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-500 text-sm">{time}</span>
        </div>
        <p className="text-white mt-2 text-base leading-normal">{text}</p>
      </div>
    </div>
  </div>
);

export function HeroV2() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [browserLoaded, setBrowserLoaded] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false });
  const draftButtonRef = useRef<HTMLDivElement>(null);
  const browserRef = useRef<HTMLDivElement>(null);

  const fullDraftText =
    '@alexsmith Your perspective is refreshing. Have you considered how this scales across...';

  // =========================================================================
  // PAGE LOAD - One-time entrance animation
  // =========================================================================
  useEffect(() => {
    setTimeout(() => setBrowserLoaded(true), 100);
    setTimeout(() => startAnimationSequence(), 700);
  }, []);

  // =========================================================================
  // CURSOR ANIMATION - Moves from browser edge to button (NO 3D)
  // =========================================================================
  useEffect(() => {
    if (isPlaying && draftButtonRef.current && browserRef.current) {
      const browserRect = browserRef.current.getBoundingClientRect();
      const buttonRect = draftButtonRef.current.getBoundingClientRect();

      // Calculate positions relative to browser mockup
      const buttonX = buttonRect.left - browserRect.left + buttonRect.width / 2;
      const buttonY = buttonRect.top - browserRect.top + buttonRect.height / 2;

      // Start cursor at browser edge (left side, inside the mockup)
      const startX = 30;
      const startY = 150;

      // Animate cursor from start to button over 1.5 seconds
      const startTime = Date.now();
      const duration = 1500;

      const animateCursor = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth cubic easing
        const easeProgress =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        setCursorPos({
          x: startX + (buttonX - startX) * easeProgress,
          y: startY + (buttonY - startY) * easeProgress,
          visible: true,
        });

        if (progress < 1) {
          requestAnimationFrame(animateCursor);
        } else {
          setCursorPos({ x: 0, y: 0, visible: false });
        }
      };

      const frameId = requestAnimationFrame(animateCursor);
      return () => cancelAnimationFrame(frameId);
    }
  }, [isPlaying]);

  // =========================================================================
  // ANIMATION SEQUENCE - Main loop every 6.5 seconds
  // =========================================================================
  const startAnimationSequence = () => {
    setIsPlaying(true);
    setTypedText('');
    setShowAlternatives(false);
    setIsGenerating(false);
    setCursorPos({ x: 0, y: 0, visible: false });

    // Phase 1: Button highlights (0-0.6s)
    setTimeout(() => {
      setIsGenerating(true);
    }, 600);

    // Phase 2: Text types (1.0-4.0s)
    setTimeout(() => {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < fullDraftText.length) {
          setTypedText(fullDraftText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setShowAlternatives(true);
          setIsGenerating(false);
        }
      }, 40);

      return () => clearInterval(typeInterval);
    }, 1000);

    // Phase 3: Reset and restart (6.5s total)
    setTimeout(() => {
      setIsPlaying(false);
      setTypedText('');
      setShowAlternatives(false);

      setTimeout(() => startAnimationSequence(), 300);
    }, 6500);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* Static background gradient - NO floating */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl"
          style={{ opacity: 0.04 }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        >
          {/* LEFT - Text */}
          <motion.div variants={containerVariants} className="space-y-6">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full hover:border-blue-500 transition-colors"
            >
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm text-gray-300">AI-powered replies in seconds</span>
            </motion.div>

            <motion.h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="block"
              >
                Draft{' '}
                <motion.span
                  className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% center', '100% center', '0% center'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  viral replies
                </motion.span>
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="block text-white"
              >
                on X in one click
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-lg"
            >
              Stop staring at a blank reply box. Our AI generates witty, engaging replies that match your
              voice. <span className="text-blue-400 font-semibold">Just add the extension.</span>
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-6">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all duration-300"
              >
                Add to Chrome - Free
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <ArrowRight size={20} />
                </motion.span>
              </motion.a>

              <motion.a
                href="/demo"
                whileHover={{ scale: 1.05, borderColor: '#60a5fa' }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-700 hover:border-blue-500 text-white font-semibold rounded-full transition-all duration-300"
              >
                Watch Demo
              </motion.a>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 sm:gap-12 pt-4"
            >
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">10K+</span>
                <span className="text-gray-500 text-sm">Active Users</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">1M+</span>
                <span className="text-gray-500 text-sm">Replies Generated</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">4.8★</span>
                <span className="text-gray-500 text-sm">Chrome Rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT - Browser mockup (FLAT, NO 3D) */}
          <motion.div variants={itemVariants} className="relative h-full w-full">
            {/* Browser container - COMPLETELY STATIC, NO FLOATING */}
            <div
              ref={browserRef}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-950"
              style={{
                opacity: browserLoaded ? 1 : 0,
                transform: browserLoaded ? 'scale(1)' : 'scale(0.92)',
                transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
              }}
            >
              <div className="w-full">
                {/* Animated cursor - starts at browser edge */}
                {cursorPos.visible && (
                  <motion.div
                    className="absolute pointer-events-none z-50"
                    style={{ left: cursorPos.x, top: cursorPos.y }}
                    animate={{ opacity: [1, 0.8, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    <div className="w-4 h-4 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50" />
                  </motion.div>
                )}

                {/* Chrome bar */}
                <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-2 backdrop-blur">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-500 font-mono">x.com</div>
                </div>

                {/* X Feed */}
                <div className="bg-gray-950 min-h-[600px] overflow-hidden">
                  <div className="p-6 space-y-4 border-r border-gray-800">
                    {/* Tweet 1 */}
                    <Tweet
                      author="Alex Smith"
                      handle="alexsmith"
                      avatar="bg-gradient-to-br from-blue-500 to-blue-600"
                      text="Just shipped our new API. Months of work finally live. Feels surreal."
                      time="2h"
                      isActive={isPlaying}
                    />

                    {/* Tweet 2 */}
                    <Tweet
                      author="Sophia Chen"
                      handle="sophiachen_ai"
                      avatar="bg-gradient-to-br from-purple-500 to-pink-500"
                      text="The best product launches are the ones nobody sees coming. Sometimes shipping quietly is the move."
                      time="4h"
                      isActive={false}
                    />

                    {/* Reply section */}
                    {isPlaying && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4 }}
                        className="border-l-4 border-blue-500 pl-4 py-4"
                      >
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              Replying to <span className="text-blue-400">@alexsmith</span>
                            </span>
                            <motion.div
                              ref={draftButtonRef}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1, duration: 0.3 }}
                              className="relative"
                            >
                              {/* Ripple effect */}
                              {isGenerating && (
                                <motion.div
                                  className="absolute inset-0 rounded-full bg-blue-400"
                                  initial={{ scale: 1, opacity: 0.5 }}
                                  animate={{ scale: 2, opacity: 0 }}
                                  transition={{ duration: 0.6 }}
                                />
                              )}

                              {/* Button */}
                              <motion.button
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-500 transition-colors relative z-10"
                                animate={
                                  isPlaying
                                    ? {
                                        boxShadow: [
                                          '0 0 12px rgba(59, 130, 246, 0.3)',
                                          '0 0 20px rgba(59, 130, 246, 0.5)',
                                          '0 0 12px rgba(59, 130, 246, 0.3)',
                                        ],
                                      }
                                    : {}
                                }
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                }}
                              >
                                <Sparkles size={13} />
                                {isGenerating ? 'Generating...' : 'Draft Reply'}
                              </motion.button>
                            </motion.div>
                          </div>

                          {/* Generated text */}
                          {(isGenerating || typedText) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-gray-900 border border-gray-700 rounded-xl p-4 min-h-[100px] flex items-center"
                            >
                              {isGenerating && !typedText ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-sm">Generating</span>
                                  <div className="flex gap-1">
                                    <motion.span
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: 0,
                                      }}
                                      className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                                    />
                                    <motion.span
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: 0.2,
                                      }}
                                      className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                                    />
                                    <motion.span
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: 0.4,
                                      }}
                                      className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <p className="text-white text-sm leading-relaxed font-normal">
                                  {typedText}
                                  {typedText.length < fullDraftText.length && (
                                    <motion.span
                                      animate={{ opacity: [1, 0] }}
                                      transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                      }}
                                      className="text-blue-400 ml-0.5"
                                    >
                                      |
                                    </motion.span>
                                  )}
                                </p>
                              )}
                            </motion.div>
                          )}

                          {/* Alternatives */}
                          {showAlternatives && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-2 pt-2 border-t border-gray-800"
                            >
                              <div className="text-xs font-semibold text-gray-400">Alternative options:</div>
                              {[
                                'Brilliant work! The polish is impressive.',
                                'This is incredible. The execution is flawless.',
                                'Game-changing work. How long did this take...',
                              ].map((text, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.08, duration: 0.2 }}
                                  className="text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                                >
                                  {text}
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
