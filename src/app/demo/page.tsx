'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Heading */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              See X Reply Drafter in Action
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Watch how our AI helps you write engaging replies in seconds
            </p>
          </div>

          {/* Video container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-900"
          >
            {/* Glow background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl" />
            </div>

            {/* Video player */}
            <div className="relative z-10 aspect-video bg-gray-950 flex items-center justify-center">
              <video
                controls
                width={1280}
                height={720}
                className="w-full h-full object-contain"
                poster="/demo-poster.jpg"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="space-y-2">
              <p className="text-gray-400">Ready to try it?</p>
              <h2 className="text-2xl font-bold text-white">
                Add X Reply Drafter to Chrome
              </h2>
            </div>

            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all duration-300"
            >
              Add to Chrome - Free
            </motion.a>

            <p className="text-sm text-gray-500">
              No API key. No monthly fees. Just add the extension.
            </p>
          </motion.div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8"
          >
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-400">⚡</div>
              <p className="font-semibold text-white">Instant</p>
              <p className="text-sm text-gray-400">Generate replies in seconds</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-400">🎯</div>
              <p className="font-semibold text-white">Smart</p>
              <p className="text-sm text-gray-400">AI learns your voice</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-400">🔒</div>
              <p className="font-semibold text-white">Private</p>
              <p className="text-sm text-gray-400">Your data stays yours</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
