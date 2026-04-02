"use client";

import { useRef, useEffect } from "react";
import { motion } from "motion/react";

/**
 * ResponsePanel.tsx
 * A glassmorphism card that shows a single provider's streaming response.
 * Features a colored top border, status dot, and auto-scrolling text area.
 */

interface ResponsePanelProps {
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
}

// Animation variants — used by parent stagger
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

export default function ResponsePanel({
  name,
  color,
  text,
  status,
  error,
}: ResponsePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new text arrives during streaming
  useEffect(() => {
    if (scrollRef.current && status === "streaming") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [text, status]);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: `0 8px 40px ${color}10` }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden min-h-[200px] flex flex-col"
      style={{
        // Subtle colored glow at the top
        borderTopWidth: "2px",
        borderTopColor: color,
        boxShadow: `inset 0 1px 0 0 ${color}22, 0 4px 24px rgba(0,0,0,0.2)`,
      }}
    >
      {/* ─── Header bar ─── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        {/* Provider name */}
        <span className="text-sm font-medium text-gray-300">{name}</span>

        {/* Status dot */}
        <span className="flex items-center gap-2">
          {status === "streaming" && (
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              streaming
            </span>
          )}
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                status === "streaming"
                  ? color
                  : status === "done"
                    ? "#22c55e"
                    : status === "error"
                      ? "#ef4444"
                      : "#6b7280",
              animation:
                status === "streaming"
                  ? "status-pulse 1.5s ease-in-out infinite"
                  : "none",
            }}
          />
        </span>
      </div>

      {/* ─── Response body ─── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {status === "error" && error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : status === "idle" ? (
          <p className="text-gray-600 text-sm italic">Waiting for prompt...</p>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed">
            {text}
            {/* Blinking cursor while streaming */}
            {status === "streaming" && (
              <span className="inline-block w-[2px] h-4 bg-gray-400 ml-0.5 align-text-bottom animate-pulse" />
            )}
          </pre>
        )}
      </div>
    </motion.div>
  );
}
