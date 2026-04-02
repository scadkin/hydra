"use client";

import { motion } from "motion/react";

/**
 * Header.tsx
 * Hero branding for Hydra — large gradient title with tagline.
 * Fades in and slides up on mount for a polished first impression.
 */
export default function Header() {
  return (
    <motion.header
      className="text-center pt-4 pb-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Main title with gradient text */}
      <h1
        className="text-6xl sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #a78bfa 0%, #6366f1 40%, #3b82f6 70%, #06b6d4 100%)",
        }}
      >
        HYDRA
      </h1>

      {/* Tagline */}
      <motion.p
        className="mt-3 text-sm sm:text-base text-gray-500 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Query every AI at once
      </motion.p>
    </motion.header>
  );
}
