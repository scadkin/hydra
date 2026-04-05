"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

/**
 * DESIGN C: "Magazine / Editorial"
 *
 * Bold, dramatic cards with oversized colored headers. Hover reveals
 * action icons (copy, expand). Supports selection checkboxes for
 * copy/merge operations.
 */

interface CardProps {
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
  cutoff?: string;
  onCopy?: () => void;
  onExpand?: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const variants = {
  hidden: { opacity: 0, y: 20, rotateX: 5 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.4 } },
};

export default function CardDesignC({
  name,
  color,
  text,
  status,
  error,
  cutoff,
  onCopy,
  onExpand,
  isSelected,
  onToggleSelect,
}: CardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current && status === "streaming") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [text, status]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
    onCopy?.();
  };

  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl overflow-hidden min-h-[260px] flex flex-col transition-all duration-200"
      style={{
        background: "#111",
        border: `1px solid rgba(255,255,255,0.05)`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.12)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${color}08`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Bold colored header */}
      <div
        className="px-5 py-4 relative overflow-hidden"
        style={{ background: `${color}10` }}
      >
        {/* Hover action bar — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {/* Copy button */}
          {status === "done" && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md transition-colors"
              style={{ background: "#0c0c0c80", color: copied ? "#10b981" : "#666" }}
              title="Copy response"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              )}
            </button>
          )}

          {/* Expand button */}
          {onExpand && status === "done" && (
            <button
              onClick={onExpand}
              className="p-1.5 rounded-md transition-colors"
              style={{ background: "#0c0c0c80", color: "#666" }}
              title="Expand"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
            </button>
          )}
        </div>

        {/* Selection checkbox — shown when responses are done */}
        {onToggleSelect && status === "done" && (
          <button
            onClick={onToggleSelect}
            className="absolute top-3 left-3 w-4 h-4 rounded border flex items-center justify-center transition-all z-10"
            style={{
              borderColor: isSelected ? color : "#333",
              background: isSelected ? `${color}30` : "transparent",
            }}
          >
            {isSelected && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            )}
          </button>
        )}

        {/* Large provider name */}
        <h3
          className="text-[28px] font-bold tracking-[-0.03em] leading-none"
          style={{ color: color, fontFamily: "var(--font-display), sans-serif" }}
        >
          {name}
        </h3>

        {/* Status line */}
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

        {/* Knowledge cutoff */}
        {cutoff && (
          <p className="text-[9px] font-mono mt-1.5" style={{ color: "#3a3a3a" }}>
            * Knowledge cutoff: {cutoff}
          </p>
        )}

        {/* Decorative large initial */}
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
