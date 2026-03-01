'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, MessageCircle, Repeat2, Share } from 'lucide-react';

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
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

const floatingVariants = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const scaleInVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Subtle continuous 3D rotation with premium easing
const browserTiltVariants = {
  animate: {
    rotateX: [0, 3, 0],
    rotateY: [-3, 3, -3],
    rotateZ: [0, 1, 0],
    transition: {
      duration: 14,
      repeat: Infinity,
      ease: [0.25, 0.46, 0.45, 0.94], // cubic-bezier for smoothness
    },
  },
};

const glowVariants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(59, 130, 246, 0.2)',
      '0 0 30px rgba(59, 130, 246, 0.3)',
      '0 0 20px rgba(59, 130, 246, 0.2)',
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// TWEET COMPONENT
// ============================================================================

interface TweetProps {
  author: string;
  handle: string;
  avatar: string;
  text: string;
  time: string;
  delay: number;
  isActive?: boolean;
}

const Tweet = ({ author, handle, avatar, text, time, delay, isActive }: TweetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        duration: 0.6,
        ease: 'easeOut',
      }}
      className={`border-b border-gray-700 pb-4 cursor-pointer transition-colors ${
        isActive ? 'bg-gray-900 rounded-lg p-4' : 'hover:bg-gray-950'
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${avatar} flex-shrink-0`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white hover:underline">{author}</span>
            <span className="text-gray-500">@{handle}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">{time}</span>
          </div>
          <p className="text-white mt-2 text-base leading-normal">{text}</p>
          <div className="flex justify-between text-gray-500 mt-3 max-w-xs text-sm">
            <motion.div
              whileHover={{ scale: 1.1, color: '#3b82f6' }}
              className="flex items-center gap-2 cursor-pointer transition-colors"
            >
              <MessageCircle size={16} />
              <span>1.2K</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, color: '#10b981' }}
              className="flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Repeat2 size={16} />
              <span>3.4K</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, color: '#ef4444' }}
              className="flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Heart size={16} />
              <span>12K</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, color: '#3b82f6' }}
              className="flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Share size={16} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// CURSOR COMPONENT
// ============================================================================

interface CursorPosition {
  x: number;
  y: number;
  show: boolean;
}

const AnimatedCursor = ({ x, y, show }: CursorPosition) => {
  return (
    <motion.div
      animate={{ x, y, opacity: show ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className="fixed pointer-events-none z-50"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-400">
        <path d="M3 3l7.07 18.97L12.58 12.58 21 3H3z" fill="currentColor" />
      </svg>
    </motion.div>
  );
};

// ============================================================================
// HERO SECTION
// ============================================================================

export function Hero() {
  // =========================================================================
  // STATE
  // =========================================================================
  const [cyclePhase, setCyclePhase] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, show: false });
  const [generateState, setGenerateState] = useState('idle'); // idle, generating, typing
  const [showAlternatives, setShowAlternatives] = useState(false);
  const browserRef = useRef<HTMLDivElement>(null);
  const draftButtonRef = useRef<HTMLDivElement>(null);

  const fullDraftText = '@alexsmith Your perspective is refreshing. Have you considered how this scales across...';

  // =========================================================================
  // MASTER CYCLE: 14 SECONDS (all animations coordinate to this)
  // =========================================================================
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setCyclePhase((prev) => (prev + 1) % 4);
    }, 14000); // 14 seconds per full cycle

    return () => clearInterval(cycleTimer);
  }, []);

  // =========================================================================
  // PHASE TIMING (all within the 14s cycle):
  // 0-3s:   Browser rotates subtly (phase 0)
  // 3-5s:   Cursor animates to button (phase 1)
  // 5-11s:  Text generates + types (phase 2)
  // 11-14s: Fade & reset (phase 3)
  // =========================================================================

  // =========================================================================
  // CURSOR ANIMATION - Smooth bezier curve to Draft Reply button
  // =========================================================================
  useEffect(() => {
    if (cyclePhase === 1 && draftButtonRef.current) {
      setShowCursor(true);
      const button = draftButtonRef.current;
      const rect = button.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2 - 12;
      const targetY = rect.top + rect.height / 2 - 12;

      // Use Framer Motion-style animation with smooth easing
      let currentX = 100;
      let currentY = 100;
      const duration = 1800; // 1.8s for cursor to reach button
      const startTime = Date.now();

      const animateFrame = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cubic bezier easing for smooth motion (ease-in-out-cubic)
        const easeProgress = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        currentX = 100 + (targetX - 100) * easeProgress;
        currentY = 100 + (targetY - 100) * easeProgress;
        setCursorPos({ x: currentX, y: currentY, show: true });

        if (progress < 1) {
          requestAnimationFrame(animateFrame);
        } else {
          setTimeout(() => {
            setGenerateState('generating');
          }, 200);
        }
      };

      const frameId = requestAnimationFrame(animateFrame);

      return () => {
        cancelAnimationFrame(frameId);
        setShowCursor(false);
      };
    }
  }, [cyclePhase]);

  // =========================================================================
  // TYPING EFFECT - Natural smooth character reveal (60ms per char)
  // =========================================================================
  useEffect(() => {
    if (cyclePhase === 2 && generateState === 'generating') {
      setGenerateState('typing');
      setTypedText('');
      let index = 0;

      const typeInterval = setInterval(() => {
        if (index < fullDraftText.length) {
          setTypedText(fullDraftText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setShowAlternatives(true), 600);
        }
      }, 60); // 60ms per character = natural reading speed

      return () => clearInterval(typeInterval);
    }
  }, [cyclePhase, generateState]);

  // =========================================================================
  // RESET STATE ON NEW CYCLE
  // =========================================================================
  useEffect(() => {
    if (cyclePhase === 3) {
      setTimeout(() => {
        setGenerateState('idle');
        setTypedText('');
        setShowAlternatives(false);
        setCursorPos({ x: 0, y: 0, show: false });
      }, 1500);
    }
  }, [cyclePhase]);

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* ANIMATED BACKGROUND - SUBTLE floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient mesh background - much more subtle */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{ opacity: 0.04 }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{ opacity: 0.03 }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl"
            animate={{
              x: [0, 25, 0],
              y: [0, -35, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{ opacity: 0.02 }}
          />
        </div>

        {/* Animated grid pattern */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
          animate={{
            y: [0, 50],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Cursor animation overlay */}
      <AnimatedCursor x={cursorPos.x} y={cursorPos.y} show={cursorPos.show} />

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        >
          {/* LEFT SIDE - HEADLINE & CTA */}
          <motion.div variants={containerVariants} className="space-y-6">
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full hover:border-blue-500 transition-colors"
            >
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm text-gray-300">AI-powered replies in seconds</span>
            </motion.div>

            {/* Headline */}
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
                  style={{
                    backgroundSize: '200% 200%',
                  }}
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

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-lg"
            >
              Stop staring at a blank reply box. Our AI generates witty, engaging replies that match your voice. No API key needed. No monthly fees.{' '}
              <span className="text-blue-400 font-semibold">Just add the extension.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all duration-300"
              >
                Add to Chrome - Free
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight size={20} />
                </motion.span>
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.05, borderColor: '#60a5fa' }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-700 hover:border-blue-500 text-white font-semibold rounded-full transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
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

          {/* RIGHT SIDE - 3D BROWSER MOCKUP WITH ANIMATION */}
          <motion.div
            variants={itemVariants}
            className="relative h-full w-full"
            ref={browserRef}
          >
            {/* 3D Perspective container - SMOOTH CONTINUOUS ROTATION */}
            <div
              style={{
                perspective: '1500px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Browser window with smooth continuous 3D transforms */}
              <motion.div
                variants={browserTiltVariants}
                animate="animate"
                style={{
                  transformStyle: 'preserve-3d',
                }}
                className="relative w-full"
              >
                {/* Glow background - SUBTLE */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-10 pointer-events-none"
                  animate={{
                    opacity: [0.08, 0.15, 0.08],
                    scale: [0.98, 1.02, 0.98],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />

                {/* Browser chrome */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-950">
                  {/* Chrome bar */}
                  <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-2 backdrop-blur">
                    <div className="flex gap-2">
                      <motion.div
                        className="w-3 h-3 rounded-full bg-red-500"
                        whileHover={{ scale: 1.2 }}
                      />
                      <motion.div
                        className="w-3 h-3 rounded-full bg-yellow-500"
                        whileHover={{ scale: 1.2 }}
                      />
                      <motion.div
                        className="w-3 h-3 rounded-full bg-green-500"
                        whileHover={{ scale: 1.2 }}
                      />
                    </div>
                    <div className="flex-1 text-center text-xs text-gray-500 font-mono">
                      x.com
                    </div>
                  </div>

                  {/* X Feed content */}
                  <div className="bg-gray-950 min-h-[600px] lg:min-h-[750px] overflow-hidden">
                    <div className="p-4 lg:p-6 space-y-4 border-r border-gray-800">
                      {/* Tweet 1 - Alex Smith */}
                      <Tweet
                        author="Alex Smith"
                        handle="alexsmith"
                        avatar="bg-gradient-to-br from-blue-500 to-blue-600"
                        text="Just shipped our new API. Months of work finally live. Feels surreal."
                        time="2h"
                        delay={0.6}
                        isActive={cyclePhase >= 1}
                      />

                      {/* Tweet 2 - Sophia Chen (engagement context) */}
                      <Tweet
                        author="Sophia Chen"
                        handle="sophiachen_ai"
                        avatar="bg-gradient-to-br from-purple-500 to-pink-500"
                        text="The best product launches are the ones nobody sees coming. Sometimes shipping quietly is the move."
                        time="4h"
                        delay={0.8}
                        isActive={false}
                      />

                      {/* Active reply section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: cyclePhase >= 1 ? 1 : 0,
                          y: cyclePhase >= 1 ? 0 : 20,
                        }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="border-l-4 border-blue-500 pl-4 py-4"
                      >
                        <div className="space-y-3">
                          {/* Reply header */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              Replying to <span className="text-blue-400">@alexsmith</span>
                            </span>
                            <motion.div
                              ref={draftButtonRef}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: cyclePhase >= 1 ? 1 : 0,
                                scale: cyclePhase >= 1 ? 1 : 0,
                              }}
                              whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' }}
                              transition={{
                                delay: 1.2,
                                type: 'spring',
                                stiffness: 200,
                              }}
                              className="relative"
                            >
                              <motion.button
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-500 transition-colors relative z-10"
                              animate={cyclePhase >= 1 ? {
                                boxShadow: [
                                  '0 0 12px rgba(59, 130, 246, 0.3)',
                                  '0 0 20px rgba(59, 130, 246, 0.4)',
                                  '0 0 12px rgba(59, 130, 246, 0.3)',
                                ]
                              } : {}}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            >
                                <Sparkles size={13} />
                                {generateState === 'idle' || generateState === 'generating'
                                  ? 'Draft Reply'
                                  : 'Generating...'}
                              </motion.button>
                            </motion.div>
                          </div>

                          {/* Typing area with generated text */}
                          {cyclePhase >= 2 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 1.8 }}
                              className="bg-gray-900 border border-gray-700 rounded-xl p-4 min-h-[100px]"
                            >
                              <p className="text-white text-sm leading-relaxed font-normal">
                                {typedText}
                                {generateState === 'typing' && (
                                  <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{
                                      duration: 0.7,
                                      repeat: Infinity,
                                    }}
                                    className="text-blue-400 ml-0.5"
                                  >
                                    |
                                  </motion.span>
                                )}
                              </p>
                            </motion.div>
                          )}

                          {/* Alternative responses */}
                          {showAlternatives && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.5 }}
                              className="space-y-2 pt-2 border-t border-gray-800"
                            >
                              <div className="text-xs font-semibold text-gray-400">
                                Try these alternatives:
                              </div>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                              >
                                Brilliant work! The polish is impressive. How did you...
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                              >
                                This is incredible. The execution is flawless...
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
                              >
                                Game-changing work. How long did this take to build...
                              </motion.div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating accent elements - subtle depth */}
            <motion.div
              className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-5 pointer-events-none"
              animate={{
                x: [0, 15, 0],
                y: [0, -15, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
