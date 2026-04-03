"use client";

import { useRef, useEffect } from "react";
import { motion } from "motion/react";

/**
 * DESIGN B: "Gradient Glass"
 *
 * Each card has a unique gradient border that matches the provider's color.
 * Inner content sits on a dark surface. The border creates a glowing frame
 * effect. More dramatic, more visual energy. Bento-grid friendly.
 */

interface CardProps {
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
}

const variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
};

export default function CardDesignB({ name, color, text, status, error }: CardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && status === "streaming") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [text, status]);

  return (
    <motion.div
      variants={variants}
      className="rounded-2xl p-[1px] min-h-[260px]"
      style={{
        background: `linear-gradient(135deg, ${color}40 0%, transparent 50%, ${color}20 100%)`,
      }}
    >
      {/* Inner card */}
      <div className="rounded-2xl h-full flex flex-col overflow-hidden" style={{ background: "#111" }}>
        {/* Header with gradient accent bar */}
        <div className="relative px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          {/* Top gradient line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Provider icon — circle with initial */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ background: `${color}20`, color: color }}
              >
                {name[0]}
              </div>
              <span className="text-[14px] font-semibold text-white tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                {name}
              </span>
            </div>

            {status === "streaming" && (
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color, animation: "blink 0.8s step-end infinite" }} />
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color, animation: "blink 0.8s step-end infinite 0.2s" }} />
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color, animation: "blink 0.8s step-end infinite 0.4s" }} />
              </div>
            )}
            {status === "done" && (
              <span className="text-[10px] font-mono text-[#3fb950] uppercase tracking-wider">✓ done</span>
            )}
            {status === "error" && (
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">✗ error</span>
            )}
          </div>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 max-h-[380px]">
          {status === "error" && error ? (
            <p className="text-[12px] text-red-400/60 font-mono">{error}</p>
          ) : status === "idle" ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[12px] text-[#333] italic">Ready</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-[12px] text-[#bbb] leading-[1.8]">
              {text}
              {status === "streaming" && (
                <span className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom"
                  style={{ backgroundColor: color, animation: "blink 0.7s step-end infinite" }}
                />
              )}
            </pre>
          )}
        </div>
      </div>
    </motion.div>
  );
}
