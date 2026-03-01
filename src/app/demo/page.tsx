'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 48, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{ opacity: 0.048 }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl"
          animate={{ x: [0, -36, 0], y: [0, -24, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ opacity: 0.036 }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to home
          </Link>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold mb-4 text-white"
        >
          How It Works
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-gray-400 mb-12"
        >
          Watch our 90-second demo to see X Reply Drafter in action. From idea to engagement-boosting reply—in seconds.
        </motion.p>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-950 mb-12"
        >
          <video
            width="100%"
            height="100%"
            controls
            autoPlay
            className="w-full h-full"
            poster="/demo-poster.jpg"
          >
            <source src="/demo-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center space-y-6"
        >
          <p className="text-xl text-gray-300">
            Ready to start drafting better replies?
          </p>

          <motion.a
            href="#"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all duration-300"
          >
            Add to Chrome - Free
          </motion.a>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 space-y-8"
        >
          <h2 className="text-2xl font-bold text-white mb-8">Common Questions</h2>

          <div className="space-y-4">
            <details className="group border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <summary className="font-semibold text-white flex items-center gap-3">
                <span className="group-open:rotate-180 transition-transform">▶</span>
                Is it really free?
              </summary>
              <p className="text-gray-300 mt-4">
                Yes! X Reply Drafter is completely free. No API keys, no monthly subscriptions, no hidden costs. Just install the extension and start drafting better replies.
              </p>
            </details>

            <details className="group border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <summary className="font-semibold text-white flex items-center gap-3">
                <span className="group-open:rotate-180 transition-transform">▶</span>
                Does it track my data?
              </summary>
              <p className="text-gray-300 mt-4">
                No. We don't store your replies, tweets, or personal data. Everything is processed locally on your machine. Your data stays yours.
              </p>
            </details>

            <details className="group border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <summary className="font-semibold text-white flex items-center gap-3">
                <span className="group-open:rotate-180 transition-transform">▶</span>
                Can I customize the AI's tone?
              </summary>
              <p className="text-gray-300 mt-4">
                Absolutely! You can tweak the generated replies before posting. The AI learns your voice and improves recommendations over time.
              </p>
            </details>

            <details className="group border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors">
              <summary className="font-semibold text-white flex items-center gap-3">
                <span className="group-open:rotate-180 transition-transform">▶</span>
                Works with other browsers?
              </summary>
              <p className="text-gray-300 mt-4">
                Currently Chrome and Edge. Firefox and Safari support coming soon. Let us know if you'd like to help test the beta!
              </p>
            </details>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
