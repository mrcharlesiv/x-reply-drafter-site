'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Chrome Extension', href: 'https://chrome.google.com/webstore' },
      { label: 'Roadmap', href: '#roadmap' },
    ],
    Company: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Careers', href: '#careers' },
      { label: 'Contact', href: 'mailto:hello@x-reply-drafter.com' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
    Social: [
      { label: 'Twitter', href: 'https://twitter.com/x_reply_drafter', icon: Twitter },
      { label: 'GitHub', href: 'https://github.com/mrcharlesiv/x-reply-drafter', icon: Github },
      { label: 'Email', href: 'mailto:hello@x-reply-drafter.com', icon: Mail },
    ],
  };

  return (
    <footer className="relative bg-dark border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4">X Reply Drafter</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Draft viral replies on X in one click. AI-powered. Your voice.
            </p>
          </motion.div>

          {/* Links */}
          {Object.entries(links).slice(0, 3).map(([category, items]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-gray-500 hover:text-accent transition-colors text-sm"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {links.Social.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-dark-secondary border border-dark-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                    title={item.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-dark-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} X Reply Drafter. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-accent transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-accent transition-colors">
                Terms
              </a>
              <a href="/cookies" className="hover:text-accent transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
