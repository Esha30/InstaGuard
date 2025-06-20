"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#b43a9c] via-[#da0c50] to-[#fdc468]">
      <motion.div
        className="bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-6 sm:px-10 py-12 sm:py-16 max-w-2xl w-full text-center text-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Tagline */}
        <motion.div
          className="text-xs sm:text-sm uppercase tracking-widest text-white/70 mb-4 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI-Powered Instagram Check
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          Detect Fake Instagram Profiles
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-sm sm:text-base md:text-lg text-white/80 mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Not sure if a profile is genuine? Paste the username and get quick insights — powered by smart detection that keeps things simple.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Link href="/signup">
            <button className="bg-gradient-to-r from-[#fd1d1d] via-[#e1306c] to-[#fcb045] text-white font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-pink-400/40 hover:brightness-110">
              Get Started
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};
