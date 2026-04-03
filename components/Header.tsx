"use client";

import { motion } from "motion/react";

/**
 * Header.tsx
 *
 * Bold hero like Linear/Raycast. Large headline that fills the space.
 * Space Grotesk display font for distinctive character.
 * Clear value prop — "what it is, who it's for, why they should care."
 */
export default function Header() {
  return (
    <motion.div
      className="text-center pt-24 sm:pt-32 pb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Brand mark — small, top-left energy */}
      <div className="flex items-center justify-center gap-2.5 mb-8">
        <div className="w-6 h-6 rounded-lg bg-[#d4a574] flex items-center justify-center">
          <span className="text-[10px] font-bold text-black tracking-tight">H</span>
        </div>
      </div>

      {/* Hero headline — Space Grotesk, massive, tight tracking */}
      <h1
        className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold leading-[1.05] tracking-[-0.03em] max-w-4xl mx-auto"
        style={{ fontFamily: "var(--font-display), var(--font-geist-sans), sans-serif" }}
      >
        <span className="text-white">Ask once.</span>
        <br />
        <span className="text-[#666]">Every AI answers.</span>
      </h1>

      {/* Value prop — clear and specific */}
      <motion.p
        className="mt-6 text-[17px] text-[#555] max-w-md mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        One prompt. Seven models. Streamed side by side.
      </motion.p>
    </motion.div>
  );
}
