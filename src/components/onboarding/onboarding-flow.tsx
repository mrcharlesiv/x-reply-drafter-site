'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, Zap, Target, Palette } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onDismiss: () => void;
  /** If true, shows in extension popup mode (compact). Otherwise, full-page. */
  compact?: boolean;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ViralDraft! 🚀',
    subtitle: "Let's get you your first viral reply in 60 seconds",
    description:
      "ViralDraft uses AI to craft engagement-optimized replies on X. No more staring at a blank compose box — just click, pick, and post.",
    icon: <Sparkles className="text-accent" size={48} />,
    duration: 5000,
  },
  {
    id: 'find-tweet',
    title: 'Find a tweet to reply to',
    subtitle: 'Step 1 of 3',
    description:
      'Scroll through your feed and find any tweet you want to reply to. Look for tweets from thought leaders, trending topics, or anything that catches your eye.',
    icon: <Target className="text-blue-400" size={48} />,
    duration: 10000,
  },
  {
    id: 'generate',
    title: 'Click "Draft Reply"',
    subtitle: 'Step 2 of 3',
    description:
      'Click the ViralDraft button on any tweet to instantly generate 3 reply options. Each one uses a different engagement strategy — question hooks, contrarian takes, curiosity gaps, and more.',
    icon: <Zap className="text-yellow-400" size={48} />,
    duration: 20000,
  },
  {
    id: 'pick',
    title: 'Pick your favorite',
    subtitle: 'Step 3 of 3',
    description:
      "Choose the reply that matches your style. Click it once to copy to your compose box. Edit if you want — but most of the time, it's ready to go.",
    icon: <Sparkles className="text-green-400" size={48} />,
    duration: 15000,
  },
  {
    id: 'celebrate',
    title: '🎉 You did it!',
    subtitle: 'Your first ViralDraft reply',
    description:
      "You just saved 5 minutes of staring at a blank reply box. Want replies that sound exactly like you? Set up a custom persona next.",
    icon: null,
    duration: 10000,
  },
];

export function OnboardingFlow({ onComplete, onDismiss, compact = false }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleComplete = useCallback(async () => {
    setIsVisible(false);

    // Mark onboarding as completed in localStorage
    localStorage.setItem('onboarding_completed', 'true');

    // Track in analytics
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch('/api/user/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventType: 'onboarding_completed',
            eventData: { stepsViewed: currentStep + 1, totalSteps: STEPS.length },
          }),
        });
      }
    } catch {
      // Non-critical
    }

    setTimeout(onComplete, 300);
  }, [currentStep, onComplete]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, handleComplete]);

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleDismiss = async () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_completed', 'true');

    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch('/api/user/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventType: 'onboarding_dismissed',
            eventData: { dismissedAtStep: currentStep, stepId: step.id },
          }),
        });
      }
    } catch {
      // Non-critical
    }

    setTimeout(onDismiss, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[9999] flex items-center justify-center ${
          compact ? '' : 'p-4'
        }`}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleDismiss}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative bg-dark-secondary border border-dark-border rounded-2xl shadow-2xl overflow-hidden ${
            compact ? 'w-[380px] max-h-[500px]' : 'w-full max-w-lg'
          }`}
        >
          {/* Progress bar */}
          <div className="h-1 bg-dark-tertiary">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-accent to-blue-400"
            />
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-dark-tertiary transition-colors z-10"
          >
            <X size={18} />
          </button>

          {/* Step content */}
          <div className={`${compact ? 'p-6' : 'p-8'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Icon */}
                {step.icon && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                    className="mb-6 flex justify-center"
                  >
                    <div className="p-4 bg-dark/50 rounded-2xl border border-dark-border">
                      {step.icon}
                    </div>
                  </motion.div>
                )}

                {/* Celebration animation on last step */}
                {step.id === 'celebrate' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
                    transition={{ duration: 0.6 }}
                    className="text-7xl text-center mb-6"
                  >
                    🎉
                  </motion.div>
                )}

                {/* Step indicator */}
                {step.subtitle && (
                  <p className="text-xs text-accent font-medium mb-2 uppercase tracking-wider">
                    {step.subtitle}
                  </p>
                )}

                {/* Title */}
                <h2 className={`font-bold text-white mb-3 ${compact ? 'text-xl' : 'text-2xl'}`}>
                  {step.title}
                </h2>

                {/* Description */}
                <p className={`text-gray-400 leading-relaxed ${compact ? 'text-sm' : 'text-base'}`}>
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className={`flex items-center justify-between border-t border-dark-border ${compact ? 'px-6 py-4' : 'px-8 py-5'}`}>
            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep
                      ? 'bg-accent w-6'
                      : i < currentStep
                      ? 'bg-accent/40'
                      : 'bg-dark-tertiary'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-dark font-semibold text-sm rounded-lg hover:bg-accent-dark transition-colors"
              >
                {isLastStep ? (
                  <>
                    <Palette size={14} />
                    Customize Persona
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Skip link */}
          {!isLastStep && (
            <div className="text-center pb-4">
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Skip onboarding
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook to check if onboarding should be shown
 */
export function useOnboarding(): {
  shouldShow: boolean;
  markComplete: () => void;
} {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    const token = localStorage.getItem('authToken');
    if (!completed && token) {
      setShouldShow(true);
    }
  }, []);

  const markComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShouldShow(false);
  };

  return { shouldShow, markComplete };
}
