"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import HydraArena from "../../../components/hydra/HydraArena";
import SourcesPanel from "../../../components/SourcesPanel";
import { useStreamQuery, ProviderResponse } from "../../../lib/useStreamQuery";

/**
 * DESIGN 1: "The Arena"
 *
 * Dark fantasy war room. Full-width command-line search bar across the top.
 * Outputs in a dense 2-row grid (4 top, 3 bottom) filling the viewport.
 * Deep black (#080808) with dark crimson/blood red (#8b2020) accents.
 * Sharp edges, no rounded corners. Gothic/fantasy feel.
 * Dark Souls meets Bloomberg Terminal.
 */

type Response = ProviderResponse;

/* A single arena panel — dark with crimson left border */
function ArenaPanel({ r }: { r: Response }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && r.status === "streaming") {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [r.text, r.status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden"
      style={{
        background: "#0c0c0c",
        borderLeft: "3px solid #8b2020",
        borderTop: "1px solid #1a1010",
        borderRight: "1px solid #1a1010",
        borderBottom: "1px solid #1a1010",
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 0 20px rgba(139, 32, 32, 0.25), inset 0 0 30px rgba(139, 32, 32, 0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid #1a1010" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2"
            style={{
              backgroundColor:
                r.status === "streaming"
                  ? "#8b2020"
                  : r.status === "done"
                    ? "#3a2020"
                    : r.status === "error"
                      ? "#ff3333"
                      : "#1a1a1a",
              animation:
                r.status === "streaming"
                  ? "blink 0.8s step-end infinite"
                  : "none",
            }}
          />
          <span
            className="text-[13px] font-bold uppercase tracking-[0.15em]"
            style={{
              color: r.color,
              fontFamily:
                "var(--font-display), var(--font-geist-sans), sans-serif",
            }}
          >
            {r.name}
          </span>
        </div>
        <span className="font-mono text-[9px] text-[#4a2020] uppercase tracking-widest">
          {r.status === "streaming"
            ? "LIVE"
            : r.status === "done"
              ? `${r.text.split(" ").length}w`
              : r.status === "error"
                ? "FAIL"
                : "IDLE"}
        </span>
      </div>

      {/* Body */}
      <div
        ref={contentRef}
        className="overflow-y-auto px-3 py-2"
        style={{ height: "calc(100% - 36px)" }}
      >
        {r.status === "error" && r.error ? (
          <p className="font-mono text-[11px] text-red-900/80">
            /// ERROR: {r.error}
          </p>
        ) : (
          <pre
            className="whitespace-pre-wrap text-[11px] leading-[1.7]"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              color: "#666",
            }}
          >
            {r.text}
            {r.status === "streaming" && (
              <span
                className="inline-block w-[6px] h-[12px] ml-0.5 align-text-bottom"
                style={{
                  backgroundColor: "#8b2020",
                  animation: "blink 0.5s step-end infinite",
                }}
              />
            )}
          </pre>
        )}
      </div>
    </motion.div>
  );
}

export default function Design1() {
  const { responses, sources, isLoading, searchingWeb, webSearch, setWebSearch, submit } = useStreamQuery();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    submit(query);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#080808", color: "#ccc" }}
    >
      <HydraArena />

      {/* Nav bar */}
      <nav
        className="relative z-20 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #1a0a0a" }}
      >
        <h1
          className="text-2xl font-bold tracking-[0.3em] uppercase"
          style={{
            color: "#8b2020",
            fontFamily:
              "var(--font-display), var(--font-geist-sans), sans-serif",
            textShadow: "0 0 20px rgba(139, 32, 32, 0.3)",
          }}
        >
          HYDRA
        </h1>
        <div className="flex gap-3 sm:gap-6 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest">
          <a href="/" className="text-[#444] hover:text-[#8b2020] transition-colors">
            Home
          </a>
          <a href="/design/1" className="text-[#8b2020]">
            Arena
          </a>
          <a
            href="/design/2"
            className="text-[#444] hover:text-[#8b2020] transition-colors"
          >
            Sanctum
          </a>
          <a
            href="/design/3"
            className="text-[#444] hover:text-[#8b2020] transition-colors"
          >
            Nexus
          </a>
        </div>
      </nav>

      {/* Full-width command-line search bar */}
      <form onSubmit={handleSubmit} className="relative z-20">
        <div
          className="flex items-center"
          style={{
            borderBottom: "2px solid #8b2020",
            background: "#0a0a0a",
          }}
        >
          <span
            className="px-4 text-[#8b2020] font-mono text-sm font-bold select-none"
            style={{ textShadow: "0 0 8px rgba(139, 32, 32, 0.4)" }}
          >
            {">"}
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your query, challenger..."
            className="flex-1 bg-transparent py-3 text-sm text-[#aaa] placeholder:text-[#2a1515] focus:outline-none font-mono"
          />
          {/* Web search toggle */}
          <button
            type="button"
            onClick={() => setWebSearch(!webSearch)}
            className="px-3 py-3 font-mono text-[9px] uppercase tracking-widest transition-all"
            style={{
              color: webSearch ? "#8b2020" : "#3a1515",
              borderLeft: "1px solid #1a0a0a",
            }}
            title={webSearch ? "Web search ON" : "Web search OFF"}
          >
            {searchingWeb ? "SEARCHING..." : webSearch ? "WEB ON" : "WEB OFF"}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold transition-all"
            style={{
              background: isLoading ? "#1a0808" : "#8b2020",
              color: isLoading ? "#4a2020" : "#080808",
            }}
          >
            {isLoading ? "STREAMING" : "UNLEASH"}
          </button>
        </div>
      </form>

      {/* Search sources */}
      {sources.length > 0 && (
        <div className="relative z-20 px-4" style={{ borderBottom: "1px solid #1a0a0a" }}>
          <SourcesPanel sources={sources} />
        </div>
      )}

      {/* Output grid: 2 rows, edge-to-edge, filling viewport */}
      {responses.length > 0 && (
        <motion.div
          className="relative z-10 flex-1 grid gap-[1px] p-[1px]"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            background: "#1a0a0a",
            minHeight: "calc(100vh - 100px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {responses.map((r) => (
            <ArenaPanel key={r.id} r={r} />
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {responses.length === 0 && (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2
              className="text-4xl sm:text-6xl md:text-8xl font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-4"
              style={{
                fontFamily:
                  "var(--font-display), var(--font-geist-sans), sans-serif",
                color: "#1a0808",
                textShadow: "0 0 60px rgba(139, 32, 32, 0.15)",
              }}
            >
              THE ARENA
            </h2>
            <p
              className="font-mono text-[11px] uppercase tracking-[0.3em]"
              style={{ color: "#3a1515" }}
            >
              Seven models enter. One query rules them all.
            </p>
          </motion.div>
        </div>
      )}

      {/* Global style for blink animation */}
      <style jsx global>{`
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
