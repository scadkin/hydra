"use client";

import { useRef, useEffect } from "react";
import { motion } from "motion/react";

/**
 * DESIGN A: "Terminal"
 *
 * Retro terminal/hacker aesthetic. Each card looks like a terminal window.
 * Green-tinted text on dark bg, scanline effect, window chrome with
 * traffic light dots, monospace everything. Bold and distinctive.
 */

interface CardProps {
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
}

const variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CardDesignA({ name, color, text, status, error }: CardProps) {
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
        background: "#0d1117",
        border: "1px solid #21262d",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {/* Window chrome — like a terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#161b22", borderBottom: "1px solid #21262d" }}>
        {/* Traffic light dots */}
        <span className="w-2.5 h-2.5 rounded-full bg-[#f85149]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#d29922]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" />
        <span className="flex-1 text-center font-mono text-[10px] text-[#484f58] uppercase tracking-widest">
          {name}
        </span>
        {status === "streaming" && (
          <span className="w-2 h-2 rounded-full bg-[#3fb950]" style={{ animation: "blink 1s step-end infinite" }} />
        )}
      </div>

      {/* Terminal body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 max-h-[380px] relative">
        {/* Subtle scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
          }}
        />

        {status === "error" && error ? (
          <p className="font-mono text-[12px] text-[#f85149]">
            <span className="text-[#484f58]">$ error: </span>{error}
          </p>
        ) : status === "idle" ? (
          <p className="font-mono text-[12px] text-[#484f58]">
            <span className="text-[#3fb950]">$</span> waiting for input...
          </p>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-[1.75] relative z-10"
            style={{ color: color }}
          >
            <span className="text-[#484f58]">$ query &gt; </span>
            {text}
            {status === "streaming" && (
              <span className="inline-block w-[7px] h-[14px] ml-0.5 align-text-bottom bg-current"
                style={{ animation: "blink 0.6s step-end infinite" }}
              />
            )}
          </pre>
        )}
      </div>
    </motion.div>
  );
}
