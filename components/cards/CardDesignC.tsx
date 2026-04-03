"use client";

import { useRef, useEffect } from "react";
import { motion } from "motion/react";

/**
 * DESIGN C: "Magazine / Editorial"
 *
 * Bold, dramatic cards with oversized colored headers. The provider name
 * is the hero of each card — large, colored, impossible to miss.
 * Mixed typography: display font for names, mono for content.
 * Feels more like a design portfolio piece than a tech dashboard.
 */

interface CardProps {
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
}

const variants = {
  hidden: { opacity: 0, y: 20, rotateX: 5 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.4 } },
};

export default function CardDesignC({ name, color, text, status, error }: CardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && status === "streaming") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [text, status]);

  return (
    <motion.div
      variants={variants}
      className="rounded-xl overflow-hidden min-h-[260px] flex flex-col"
      style={{
        background: "#111",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Bold colored header — the provider IS the design */}
      <div
        className="px-5 py-4 relative overflow-hidden"
        style={{ background: `${color}10` }}
      >
        {/* Large provider name */}
        <h3
          className="text-[28px] font-bold tracking-[-0.03em] leading-none"
          style={{ color: color, fontFamily: "var(--font-display), sans-serif" }}
        >
          {name}
        </h3>

        {/* Status line underneath */}
        <div className="flex items-center gap-2 mt-2">
          {status === "streaming" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, animation: "blink 0.8s step-end infinite" }} />
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: `${color}88` }}>
                generating response
              </span>
            </>
          )}
          {status === "done" && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#555]">
              response complete • {text.split(" ").length} words
            </span>
          )}
          {status === "error" && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/70">
              request failed
            </span>
          )}
          {status === "idle" && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#333]">
              awaiting query
            </span>
          )}
        </div>

        {/* Decorative element — faded large initial behind the name */}
        <span
          className="absolute -right-4 -top-6 text-[120px] font-black leading-none select-none pointer-events-none"
          style={{ color: `${color}08`, fontFamily: "var(--font-display), sans-serif" }}
        >
          {name[0]}
        </span>
      </div>

      {/* Content area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 max-h-[360px]">
        {status === "error" && error ? (
          <p className="text-[12px] text-red-400/50 font-mono">{error}</p>
        ) : status === "idle" ? (
          <p className="text-[12px] text-[#2a2a2a]">—</p>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-[12px] text-[#aaa] leading-[1.8]">
            {text}
            {status === "streaming" && (
              <span className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom"
                style={{ backgroundColor: color, animation: "blink 0.7s step-end infinite" }}
              />
            )}
          </pre>
        )}
      </div>
    </motion.div>
  );
}
