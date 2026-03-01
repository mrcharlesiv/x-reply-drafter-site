'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Is it really free?',
    answer:
      'Yes! The free tier is completely free. You get 10 drafts per day with our basic AI model. Pro and Team plans unlock unlimited drafts and premium features.',
  },
  {
    question: 'Do I need an API key?',
    answer:
      'Not for Pro users! Free users can bring their own Anthropic or OpenAI API key, or upgrade to Pro to use our AI infrastructure. Either way, your data stays private.',
  },
  {
    question: 'How does it match my voice?',
    answer:
      'You can choose from preset personas (Professional, Casual, Witty, Thought Leader) or create custom ones. The AI learns your style from your persona settings and generates replies that sound like you.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Absolutely. We don\'t store your tweets or replies. We only use the text to generate alternatives, then delete it. No tracking, no selling data, no weird stuff.',
  },
  {
    question: 'Can I use this for team replies?',
    answer:
      'Yes, upgrade to the Team plan. You get 5 seats, shared prompt libraries, team analytics, and a dashboard to manage everything. Perfect for social teams.',
  },
  {
    question: 'What AI models do you use?',
    answer:
      'We use Claude 3.5 Sonnet for premium drafting. You can also use OpenAI models if you bring your own API key. We\'re always adding more options.',
  },
  {
    question: 'Does it work with other social platforms?',
    answer:
      'Currently, we support X (Twitter). We\'re planning support for LinkedIn, Threads, and Bluesky. Upvote on our roadmap if you want it faster!',
  },
  {
    question: 'Can I save drafts as prompts?',
    answer:
      'Yes! Save any generated reply as a prompt template. Pro users get unlimited saved prompts. Free users get 3 presets. Perfect for recurring reply scenarios.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative section-spacing py-20 bg-gradient-to-b from-dark-secondary to-dark">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Questions?</h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about X Reply Drafter.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full glass rounded-xl p-6 text-left border border-dark-border hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white pr-6">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={20} className="text-accent" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-dark-border"
                    >
                      <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-4">
            Didn&apos;t find your answer?
          </p>
          <a
            href="mailto:support@x-reply-drafter.com"
            className="inline-flex px-6 py-3 rounded-full border border-accent text-accent hover:bg-accent/10 transition-colors font-semibold"
          >
            Contact support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
