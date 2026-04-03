"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * DESIGN 3: "The Forge"
 *
 * Chat-style layout with search bar FIXED AT THE BOTTOM (like ChatGPT/iMessage).
 * Outputs cascade from the top down as they stream in.
 * Very dark (#0a0a0a) with warm copper/amber accents (#c87533).
 * Space Grotesk for headings, Geist Mono for response text.
 * Discord meets a smithy. Conversational flow, not dashboard.
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

/* A single horizontal "strip" — provider initial on left, text on right */
function FeedStrip({ r, index }: { r: Response; index: number }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && r.status === "streaming") {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [r.text, r.status]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex gap-0 group transition-colors duration-200"
      style={{
        borderBottom: "1px solid #161210",
        borderLeft: `3px solid ${r.color}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "#0f0d0b";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      {/* Left: provider initial circle + name */}
      <div
        className="flex items-start gap-3 px-4 py-3 shrink-0"
        style={{ width: "180px", borderRight: "1px solid #161210" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: `${r.color}15`,
            border: `1.5px solid ${r.color}40`,
          }}
        >
          <span
            className="text-[13px] font-bold"
            style={{
              color: r.color,
              fontFamily:
                "var(--font-display), var(--font-geist-sans), sans-serif",
            }}
          >
            {r.name[0]}
          </span>
        </div>
        <div className="min-w-0">
          <span
            className="text-[13px] font-semibold block"
            style={{
              color: r.color,
              fontFamily:
                "var(--font-display), var(--font-geist-sans), sans-serif",
            }}
          >
            {r.name}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest block mt-0.5"
            style={{ color: "#4a3520" }}
          >
            {r.status === "streaming"
              ? "typing..."
              : r.status === "done"
                ? `${r.text.split(" ").length} words`
                : r.status === "error"
                  ? "failed"
                  : "ready"}
          </span>
        </div>
      </div>

      {/* Right: response text */}
      <div
        ref={contentRef}
        className="flex-1 px-4 py-3 overflow-y-auto max-h-[250px]"
      >
        {r.status === "error" && r.error ? (
          <p
            className="text-[12px]"
            style={{
              color: "#8b3333",
              fontFamily: "var(--font-geist-mono), monospace",
            }}
          >
            // Error: {r.error}
          </p>
        ) : (
          <pre
            className="whitespace-pre-wrap text-[12px] leading-[1.75]"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              color: "#888078",
            }}
          >
            {r.text}
            {r.status === "streaming" && (
              <span
                className="inline-block w-[2px] h-[13px] ml-0.5 align-text-bottom"
                style={{
                  backgroundColor: "#c87533",
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

export default function Design3() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim() || isLoading) return;
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
      setIsLoading(true);
      setSubmittedQuery(query);

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
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "#0a0a0a", color: "#ccc" }}
    >
      {/* Top nav — minimal */}
      <nav
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid #161210" }}
      >
        <h1
          className="text-lg font-bold tracking-[0.15em] uppercase"
          style={{
            color: "#c87533",
            fontFamily:
              "var(--font-display), var(--font-geist-sans), sans-serif",
            textShadow: "0 0 15px rgba(200, 117, 51, 0.2)",
          }}
        >
          HYDRA
        </h1>
        <div className="flex gap-5 text-[11px] font-mono uppercase tracking-widest">
          <a
            href="/design/1"
            className="text-[#444] hover:text-[#c87533] transition-colors"
          >
            Arena
          </a>
          <a
            href="/design/2"
            className="text-[#444] hover:text-[#c87533] transition-colors"
          >
            Lab
          </a>
          <a href="/design/3" className="text-[#c87533]">
            Forge
          </a>
        </div>
      </nav>

      {/* Feed area — scrollable, grows to fill space */}
      <div ref={feedRef} className="flex-1 overflow-y-auto">
        {responses.length > 0 ? (
          <div>
            {/* Query echo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 py-4"
              style={{
                background: "#0d0b09",
                borderBottom: "1px solid #1a1510",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: "#c8753320",
                    border: "1px solid #c8753340",
                  }}
                >
                  <span className="text-[9px] text-[#c87533]">Q</span>
                </div>
                <span
                  className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: "#c87533" }}
                >
                  Your query
                </span>
              </div>
              <p
                className="text-[14px] ml-7"
                style={{
                  color: "#a09080",
                  fontFamily:
                    "var(--font-display), var(--font-geist-sans), sans-serif",
                }}
              >
                {submittedQuery}
              </p>
            </motion.div>

            {/* Response strips */}
            <AnimatePresence>
              {responses.map((r, i) => (
                <FeedStrip key={r.id} r={r} index={i} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty state */
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2
                className="text-5xl sm:text-7xl font-bold uppercase tracking-[0.15em] mb-3"
                style={{
                  fontFamily:
                    "var(--font-display), var(--font-geist-sans), sans-serif",
                  color: "#140e08",
                  textShadow: "0 0 40px rgba(200, 117, 51, 0.1)",
                }}
              >
                THE FORGE
              </h2>
              <p
                className="font-mono text-[11px] uppercase tracking-[0.2em]"
                style={{ color: "#2a1e12" }}
              >
                Hammer your query. Watch the sparks fly.
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Fixed bottom input bar */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0"
        style={{
          borderTop: "1px solid #1a1510",
          background: "#0c0a08",
        }}
      >
        <div className="flex items-center gap-0">
          <div className="flex-1 flex items-center">
            <span
              className="pl-4 pr-2 text-[#c87533] font-mono text-sm select-none"
              style={{ opacity: 0.5 }}
            >
              //
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Forge your query..."
              className="flex-1 bg-transparent py-4 text-[14px] text-[#a09080] placeholder:text-[#2a1e12] focus:outline-none"
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 text-[12px] font-bold uppercase tracking-[0.15em] transition-all"
            style={{
              background: isLoading ? "#1a1208" : "#c87533",
              color: isLoading ? "#6a4a20" : "#0a0a0a",
              fontFamily:
                "var(--font-display), var(--font-geist-sans), sans-serif",
            }}
          >
            {isLoading ? "FORGING..." : "FORGE"}
          </button>
        </div>
        {/* Subtle model count */}
        <div
          className="flex items-center gap-3 px-4 pb-2"
          style={{ borderTop: "1px solid #12100e" }}
        >
          <span
            className="text-[9px] font-mono uppercase tracking-widest"
            style={{ color: "#2a1e12" }}
          >
            {PROVIDERS.length} models
          </span>
          <div className="flex gap-1">
            {PROVIDERS.map((p) => (
              <div
                key={p.id}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: `${p.color}40` }}
                title={p.name}
              />
            ))}
          </div>
        </div>
      </form>

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
