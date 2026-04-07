"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { MergeState } from "../lib/useMerge";

/**
 * MergeCard — displays the merged "super response" that synthesizes
 * all individual LLM responses into one comprehensive answer.
 */

interface MergeCardProps {
  merge: MergeState;
  onClose: () => void;
}

export default function MergeCard({ merge, onClose }: MergeCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll while streaming
  useEffect(() => {
    if (scrollRef.current && merge.status === "streaming") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [merge.text, merge.status]);

  const handleCopy = () => {
    navigator.clipboard.writeText(merge.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (merge.status === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-8 rounded-xl overflow-hidden"
      style={{
        background: "#111",
        border: "1px solid rgba(212, 165, 116, 0.15)",
        boxShadow: "0 0 32px rgba(212, 165, 116, 0.04)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 relative overflow-hidden"
        style={{ background: "rgba(212, 165, 116, 0.06)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md transition-colors"
          style={{ color: "#555", background: "#0c0c0c60" }}
          title="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Copy button */}
        {merge.status === "done" && (
          <button
            onClick={handleCopy}
            className="absolute top-4 right-12 p-1.5 rounded-md transition-colors"
            style={{ color: copied ? "#10b981" : "#555", background: "#0c0c0c60" }}
            title="Copy merged response"
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
            )}
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Merge icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="1.5">
            <path d="M6 3v6c0 3.3 2.7 6 6 6s6-2.7 6-6V3" />
            <path d="M12 15v6" />
          </svg>

          <h3
            className="text-[24px] font-bold tracking-[-0.03em] leading-none"
            style={{ color: "#d4a574", fontFamily: "var(--font-display), sans-serif" }}
          >
            Merged Response
          </h3>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {merge.status === "streaming" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#d4a574", animation: "blink 0.8s step-end infinite" }} />
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#d4a57488" }}>
                synthesizing responses
              </span>
            </>
          )}
          {merge.status === "done" && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#555]">
              synthesis complete • {merge.text.split(" ").length} words
            </span>
          )}
          {merge.status === "error" && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/70">
              merge failed
            </span>
          )}
        </div>

        {/* Decorative */}
        <span
          className="absolute -right-4 -top-6 text-[120px] font-black leading-none select-none pointer-events-none"
          style={{ color: "#d4a57406", fontFamily: "var(--font-display), sans-serif" }}
        >
          M
        </span>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="px-6 py-5 max-h-[500px] overflow-y-auto">
        {merge.status === "error" && merge.error ? (
          <p className="text-[12px] text-red-400/50 font-mono">{merge.error}</p>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-[13px] text-[#bbb] leading-[1.8]">
            {merge.text}
            {merge.status === "streaming" && (
              <span
                className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom"
                style={{ backgroundColor: "#d4a574", animation: "blink 0.7s step-end infinite" }}
              />
            )}
          </pre>
        )}
      </div>
    </motion.div>
  );
}
