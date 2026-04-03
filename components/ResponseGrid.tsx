"use client";

import { motion } from "motion/react";

/**
 * ResponseGrid.tsx
 * Responsive grid. 3 cols on desktop so 7 cards = 3+3+1, with the last
 * card sitting alone left-aligned (not stretched).
 */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

interface ResponseGridProps {
  children: React.ReactNode;
}

export default function ResponseGrid({ children }: ResponseGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
