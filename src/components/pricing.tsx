'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for trying it out',
    features: [
      '10 drafts/day',
      'Bring your own API key',
      '3 prompt presets',
      'Basic personas',
      'Community support',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '12',
    description: 'For serious X creators',
    features: [
      'Unlimited drafts',
      'AI included (no API key)',
      'Unlimited saved prompts',
      'All personas',
      'Priority email support',
      'Usage analytics',
      'Custom persona creation',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '29',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Shared prompt libraries',
      'Team analytics',
      '5 team seats',
      'Dedicated support',
      'Admin dashboard',
      'Usage limits per user',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="relative section-spacing py-20 bg-dark overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-dark-secondary via-dark to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that works for you. Upgrade anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl p-8 border transition-all ${
                plan.highlighted
                  ? 'border-accent bg-dark-secondary shadow-2xl ring-2 ring-accent/20'
                  : 'border-dark-border glass'
              }`}
            >
              {plan.highlighted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-accent text-dark px-4 py-1 rounded-full text-sm font-bold"
                >
                  <Zap size={16} />
                  Most Popular
                </motion.div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  {plan.price !== '0' && <span className="text-gray-400">/month</span>}
                </div>
              </div>

              <button
                className={`w-full py-3 rounded-xl font-semibold mb-8 transition-all ${
                  plan.highlighted
                    ? 'bg-accent text-dark hover:bg-accent-dark'
                    : 'bg-dark-secondary text-white border border-dark-border hover:border-accent'
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + featureIndex * 0.05, duration: 0.3 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <Check size={20} className="text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-4">
            All plans include unlimited revision, no commitment, cancel anytime.
          </p>
          <p className="text-sm text-gray-500">
            Free tier includes 1 month free trial period. Pro charges monthly.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
