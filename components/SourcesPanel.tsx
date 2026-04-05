"use client";

import { motion } from "motion/react";
import { SearchSource } from "../lib/useStreamQuery";

/**
 * SourcesPanel — horizontal scrollable strip showing the web search
 * sources used for RAG context. Each source is a compact card with
 * citation number, title, domain, freshness, and snippet preview.
 */

interface SourcesPanelProps {
  sources: SearchSource[];
}

export default function SourcesPanel({ sources }: SourcesPanelProps) {
  if (sources.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="mt-8 mb-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span
          className="text-[11px] uppercase tracking-[0.15em]"
          style={{ color: "#666", fontFamily: "var(--font-geist-mono), monospace" }}
        >
          {sources.length} sources found
        </span>
      </div>

      {/* Scrollable source cards */}
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#333 transparent" }}
      >
        {sources.map((source, i) => (
          <motion.a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex-shrink-0 group block transition-all duration-200"
            style={{
              width: 240,
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "10px 12px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLElement).style.background = "#1a1a1a";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.background = "#141414";
            }}
          >
            {/* Citation badge + domain */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded"
                style={{
                  background: "#d4a57420",
                  color: "#d4a574",
                  fontFamily: "var(--font-geist-mono), monospace",
                }}
              >
                {source.index}
              </span>
              <span
                className="text-[10px] truncate"
                style={{
                  color: "#555",
                  fontFamily: "var(--font-geist-mono), monospace",
                }}
              >
                {source.domain}
              </span>
              {source.trustTier <= 2 && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#d4a574" className="flex-shrink-0">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {source.freshness && (
                <span
                  className="text-[9px] uppercase tracking-wider flex-shrink-0"
                  style={{
                    color: source.freshness === "breaking" ? "#10b981"
                      : source.freshness === "recent" ? "#06b6d4"
                      : "#444",
                    fontFamily: "var(--font-geist-mono), monospace",
                  }}
                >
                  {source.freshness}
                </span>
              )}
            </div>

            {/* Title */}
            <p
              className="text-[12px] leading-tight mb-1 line-clamp-2"
              style={{
                color: "#ccc",
                fontFamily: "var(--font-display), var(--font-geist-sans), sans-serif",
              }}
            >
              {source.title}
            </p>

            {/* Snippet preview */}
            {source.snippet && source.snippet !== source.title && (
              <p
                className="text-[10px] leading-[1.5] line-clamp-2"
                style={{ color: "#444" }}
              >
                {source.snippet.slice(0, 120)}
              </p>
            )}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
