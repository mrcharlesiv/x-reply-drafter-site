'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Lock, RefreshCw, Settings, Copy } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Drafts',
    description: 'Generate thoughtful, engaging replies instantly. No more writer\'s block.',
  },
  {
    icon: Users,
    title: 'Match Your Voice',
    description: 'Choose from preset personas or define your own. Stay authentic.',
  },
  {
    icon: Lock,
    title: 'Your Data, Your Control',
    description: 'No API key needed (Pro). Your replies stay private.',
  },
  {
    icon: RefreshCw,
    title: 'Regenerate Endlessly',
    description: 'Don\'t like it? Generate another. Keep tweaking until it\'s perfect.',
  },
  {
    icon: Settings,
    title: 'Save Prompts',
    description: 'Build a library of saved prompt templates for instant reuse.',
  },
  {
    icon: Copy,
    title: 'One-Click Copy',
    description: 'Perfect reply drafted. Copy it. Post it. Done.',
  },
];

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative section-spacing py-20 bg-gradient-to-b from-dark via-dark-secondary to-dark overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full mix-blend-screen filter blur-3xl opacity-5" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">Everything you need</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to make you a better, faster communicator on X.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group glass rounded-2xl p-8 border border-dark-border hover:border-accent transition-colors"
              >
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Icon size={24} className="text-dark" />
                </motion.div>

                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
