"use client";

import { motion } from "motion/react";

/**
 * ResponseGrid.tsx
 * Responsive grid that staggers its children's entrance animations.
 * Wraps ResponsePanel cards in a 1 / 2 / 3-column layout.
 */

// Stagger container variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface ResponseGridProps {
  children: React.ReactNode;
}

export default function ResponseGrid({ children }: ResponseGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
