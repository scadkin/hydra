"use client";

import { useRef, useEffect } from "react";
import { motion } from "motion/react";

/**
 * ResponsePanel.tsx
 *
 * Each card is a surface tile. Provider identity via colored square accent.
 * Response text in monospace at readable contrast (#aaa, not #999).
 * Header uses the display font for provider names.
 */

interface ResponsePanelProps {
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
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

  useEffect(() => {
    if (scrollRef.current && status === "streaming") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [text, status]);

  return (
    <motion.div
      variants={cardVariants}
      className="flex flex-col min-h-[260px] rounded-xl overflow-hidden"
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0" style={{ backgroundColor: color }} />
          <span
            className="text-[14px] font-semibold text-[#ddd] tracking-[-0.01em]"
            style={{ fontFamily: "var(--font-display), var(--font-geist-sans), sans-serif" }}
          >
            {name}
          </span>
        </div>

        {status === "streaming" && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a574]"
              style={{ animation: "blink 1s step-end infinite" }}
            />
            <span className="text-[10px] text-[#555] font-mono uppercase tracking-widest">
              live
            </span>
          </span>
        )}
        {status === "done" && (
          <span className="text-[10px] text-[#444] font-mono uppercase tracking-widest">
            done
          </span>
        )}
        {status === "error" && (
          <span className="text-[10px] text-red-400/70 font-mono uppercase tracking-widest">
            failed
          </span>
        )}
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 max-h-[400px]">
        {status === "error" && error ? (
          <p className="text-[12px] text-red-400/50 leading-relaxed font-mono">{error}</p>
        ) : status === "idle" ? (
          <p className="text-[12px] text-[#2a2a2a] font-mono">Waiting for query...</p>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-[12px] text-[#aaa] leading-[1.8]">
            {text}
            {status === "streaming" && (
              <span
                className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom"
                style={{
                  backgroundColor: color,
                  animation: "blink 0.7s step-end infinite",
                }}
              />
            )}
          </pre>
        )}
      </div>
    </motion.div>
  );
}
