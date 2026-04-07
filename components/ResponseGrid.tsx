"use client";

import { motion } from "motion/react";
import type { LayoutMode } from "./LayoutToggle";

/**
 * ResponseGrid.tsx
 * Responsive grid with switchable layout modes: grid (default), columns, stack.
 */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const layoutClasses: Record<LayoutMode, string> = {
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",
  columns: "grid grid-cols-1 md:grid-cols-2 gap-3",
  stack: "flex flex-col gap-3",
};

interface ResponseGridProps {
  children: React.ReactNode;
  layout?: LayoutMode;
}

export default function ResponseGrid({ children, layout = "grid" }: ResponseGridProps) {
  return (
    <motion.div
      className={`${layoutClasses[layout]} mt-10`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
