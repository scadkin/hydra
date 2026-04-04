"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import HydraArena from "../../../components/hydra/HydraArena";

/**
 * DESIGN 1: "The Arena"
 *
 * Dark fantasy war room. Full-width command-line search bar across the top.
 * Outputs in a dense 2-row grid (4 top, 3 bottom) filling the viewport.
 * Deep black (#080808) with dark crimson/blood red (#8b2020) accents.
 * Sharp edges, no rounded corners. Gothic/fantasy feel.
 * Dark Souls meets Bloomberg Terminal.
 */

interface Response {
  id: string;
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
}

const PROVIDERS = [
  { id: "claude", name: "Claude", color: "#d4a574" },
  { id: "gemini", name: "Gemini", color: "#7a9ec2" },
  { id: "grok", name: "Grok", color: "#89b4c8" },
  { id: "deepseek", name: "DeepSeek", color: "#8888b8" },
  { id: "llama", name: "Llama", color: "#a888a8" },
  { id: "qwen", name: "Qwen", color: "#7ab0a0" },
  { id: "deepseek-r1", name: "DeepSeek R1", color: "#88b088" },
];

const CHUNKS = [
  "That's a great question. ",
  "Let me think through this carefully.\n\n",
  "The short answer depends on context, ",
  "but here's how I'd break it down:\n\n",
  "First, consider what you're optimizing for. ",
  "If speed matters most, minimize round trips. ",
  "If correctness is the priority, ",
  "be more methodical.\n\n",
  "Here's a practical framework:\n\n",
  "1. Start simple\n",
  "2. Measure, don't guess\n",
  "3. Optimize bottlenecks only\n",
  "4. Keep code readable\n\n",
  "Profile first, then decide.\n\n",
  "Want me to go deeper?",
];

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
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim() || isLoading) return;
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
      setIsLoading(true);

      setResponses(
        PROVIDERS.map((p) => ({ ...p, text: "", status: "streaming" }))
      );

      PROVIDERS.forEach((prov, idx) => {
        let ci = 0;
        const off = Math.floor(Math.random() * 5);
        const dur = 2000 + Math.random() * 4000;
        const start = Date.now();
        const err = idx === 4;
        const ms = 50 + Math.random() * 100;
        const id = setInterval(() => {
          const el = Date.now() - start;
          if (err && el > 1000) {
            clearInterval(id);
            setResponses((p) =>
              p.map((r) =>
                r.id === prov.id
                  ? { ...r, status: "error", error: "Request timed out" }
                  : r
              )
            );
            check();
            return;
          }
          if (el >= dur) {
            clearInterval(id);
            setResponses((p) =>
              p.map((r) =>
                r.id === prov.id ? { ...r, status: "done" } : r
              )
            );
            check();
            return;
          }
          setResponses((p) =>
            p.map((r) =>
              r.id === prov.id
                ? { ...r, text: r.text + CHUNKS[(off + ci) % CHUNKS.length] }
                : r
            )
          );
          ci++;
        }, ms);
        intervalsRef.current.push(id);
      });

      function check() {
        setResponses((p) => {
          if (p.every((r) => r.status === "done" || r.status === "error"))
            setIsLoading(false);
          return p;
        });
      }
    },
    [query, isLoading]
  );

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
        <div className="flex gap-6 text-[11px] font-mono uppercase tracking-widest">
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

      {/* Output grid: 2 rows, edge-to-edge, filling viewport */}
      {responses.length > 0 && (
        <motion.div
          className="relative z-10 flex-1 grid gap-[1px] p-[1px]"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "1fr 1fr",
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
              className="text-6xl sm:text-8xl font-bold uppercase tracking-[0.2em] mb-4"
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
