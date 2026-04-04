"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import HydraSanctum from "../../../components/hydra/HydraSanctum";

/**
 * DESIGN 2: "The Sanctum"
 *
 * Mystical / Ancient temple ritual layout. Centered summoning circle with
 * a text input inside it. 7 glowing oracle dots arranged in a ring around
 * the circle. Outputs unfurl as horizontal scroll-strips below the circle.
 *
 * Deep midnight blue (#0a0e1a) background. Gold/amber (#c9a84c) accents.
 * Silver text. Space Grotesk headings. All caps labels with generous
 * letter-spacing. Ancient Greek temple at night.
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

/* Oracle dot positioned around the summoning circle */
function OracleDot({
  provider,
  index,
  total,
  status,
}: {
  provider: { id: string; name: string; color: string };
  index: number;
  total: number;
  status: "idle" | "streaming" | "done" | "error";
}) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 190;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <div
      className="absolute flex flex-col items-center gap-1"
      style={{
        left: `calc(50% + ${x}px - 20px)`,
        top: `calc(50% + ${y}px - 20px)`,
        width: 40,
      }}
    >
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor:
            status === "streaming"
              ? "#c9a84c"
              : status === "done"
                ? provider.color
                : status === "error"
                  ? "#ff3333"
                  : "#1a1f33",
          boxShadow:
            status === "streaming"
              ? `0 0 12px ${provider.color}, 0 0 24px rgba(201, 168, 76, 0.3)`
              : status === "done"
                ? `0 0 8px ${provider.color}40`
                : "none",
        }}
        animate={
          status === "streaming"
            ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }
            : {}
        }
        transition={
          status === "streaming"
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      />
      <span
        className="text-[8px] uppercase tracking-[0.2em] text-center whitespace-nowrap"
        style={{
          color:
            status === "streaming" || status === "done"
              ? provider.color
              : "#2a2f44",
        }}
      >
        {provider.name}
      </span>
    </div>
  );
}

/* A single scroll strip for a response */
function ScrollStrip({ r, index }: { r: Response; index: number }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && r.status === "streaming") {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [r.text, r.status]);

  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0, height: 0 }}
      animate={{ opacity: 1, scaleY: 1, height: "auto" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      style={{ transformOrigin: "top center" }}
    >
      <div
        className="group relative w-full transition-all duration-300"
        style={{
          borderLeft: `3px solid ${r.status === "error" ? "#ff3333" : "#c9a84c"}`,
          background: "rgba(10, 14, 26, 0.8)",
          backdropFilter: "blur(4px)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 0 20px rgba(201, 168, 76, 0.15), inset 0 0 40px rgba(201, 168, 76, 0.02)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-2"
          style={{ borderBottom: "1px solid #1a1f33" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  r.status === "streaming"
                    ? "#c9a84c"
                    : r.status === "done"
                      ? r.color
                      : r.status === "error"
                        ? "#ff3333"
                        : "#1a1f33",
                animation:
                  r.status === "streaming"
                    ? "sanctumPulse 1.5s ease-in-out infinite"
                    : "none",
              }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.25em]"
              style={{
                color: "#c9a84c",
                fontFamily:
                  "var(--font-display), var(--font-geist-sans), sans-serif",
              }}
            >
              {r.name}
            </span>
          </div>
          <span
            className="text-[9px] uppercase tracking-[0.3em]"
            style={{ color: "#3a3520" }}
          >
            {r.status === "streaming"
              ? "CHANNELING"
              : r.status === "done"
                ? "RECEIVED"
                : r.status === "error"
                  ? "SEVERED"
                  : "WAITING"}
          </span>
        </div>

        {/* Body */}
        <div ref={contentRef} className="px-5 py-3 max-h-[200px] overflow-y-auto">
          {r.status === "error" && r.error ? (
            <p
              className="text-[11px] italic"
              style={{ color: "#993333", fontFamily: "var(--font-geist-mono), monospace" }}
            >
              The oracle&apos;s connection was severed: {r.error}
            </p>
          ) : (
            <pre
              className="whitespace-pre-wrap text-[12px] leading-[1.8]"
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                color: "#9a9ab0",
              }}
            >
              {r.text}
              {r.status === "streaming" && (
                <span
                  className="inline-block w-[6px] h-[14px] ml-0.5 align-text-bottom rounded-sm"
                  style={{
                    backgroundColor: "#c9a84c",
                    animation: "blink 0.6s step-end infinite",
                  }}
                />
              )}
            </pre>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Design2() {
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
      style={{ background: "#0a0e1a", color: "#c0c0d0" }}
    >
      <HydraSanctum />

      {/* Nav bar — minimal, ethereal */}
      <nav
        className="relative z-20 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #141828" }}
      >
        <h1
          className="text-xl font-bold uppercase tracking-[0.5em]"
          style={{
            color: "#c9a84c",
            fontFamily:
              "var(--font-display), var(--font-geist-sans), sans-serif",
            textShadow: "0 0 30px rgba(201, 168, 76, 0.2)",
          }}
        >
          HYDRA
        </h1>
        <div className="flex gap-6 text-[10px] uppercase tracking-[0.3em]">
          <a
            href="/design/1"
            className="transition-colors"
            style={{ color: "#2a2f44" }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#c9a84c";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#2a2f44";
            }}
          >
            Arena
          </a>
          <a href="/design/2" style={{ color: "#c9a84c" }}>
            Sanctum
          </a>
          <a
            href="/design/3"
            className="transition-colors"
            style={{ color: "#2a2f44" }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#c9a84c";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#2a2f44";
            }}
          >
            Nexus
          </a>
        </div>
      </nav>

      {/* Summoning Circle Area */}
      <div className="relative z-10 flex flex-col items-center pt-12 pb-8">
        {/* Circle container */}
        <div className="relative" style={{ width: 420, height: 420 }}>
          {/* Oracle dots */}
          {PROVIDERS.map((prov, i) => {
            const resp = responses.find((r) => r.id === prov.id);
            return (
              <OracleDot
                key={prov.id}
                provider={prov}
                index={i}
                total={PROVIDERS.length}
                status={resp?.status ?? "idle"}
              />
            );
          })}

          {/* The summoning circle itself */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 320,
              height: 320,
            }}
          >
            {/* Outer decorative ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid #c9a84c20",
                animation: isLoading
                  ? "sanctumSpin 20s linear infinite"
                  : "none",
              }}
            />
            {/* Inner ring */}
            <div
              className="absolute rounded-full"
              style={{
                inset: 12,
                border: `2px solid ${isLoading ? "#c9a84c" : "#c9a84c40"}`,
                boxShadow: isLoading
                  ? "0 0 30px rgba(201, 168, 76, 0.15), inset 0 0 30px rgba(201, 168, 76, 0.05)"
                  : "none",
                transition: "all 0.6s ease",
              }}
            />

            {/* Inner content area */}
            <form
              onSubmit={handleSubmit}
              className="relative z-10 flex flex-col items-center gap-4 px-8"
              style={{ width: 260 }}
            >
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Speak your question..."
                rows={3}
                className="w-full resize-none bg-transparent text-center text-[13px] leading-relaxed placeholder:text-[#2a2844] focus:outline-none"
                style={{
                  color: "#c0c0d0",
                  fontFamily: "var(--font-geist-mono), monospace",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2 text-[10px] uppercase tracking-[0.4em] font-bold rounded-full transition-all duration-300"
                style={{
                  fontFamily:
                    "var(--font-display), var(--font-geist-sans), sans-serif",
                  background: isLoading ? "transparent" : "transparent",
                  color: isLoading ? "#5a4a20" : "#c9a84c",
                  border: `1px solid ${isLoading ? "#3a3020" : "#c9a84c60"}`,
                  boxShadow: isLoading
                    ? "none"
                    : "0 0 15px rgba(201, 168, 76, 0.1)",
                }}
              >
                {isLoading ? "CHANNELING..." : "SUMMON"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Output scrolls — full-width horizontal strips stacking vertically */}
      {responses.length > 0 && (
        <div className="relative z-10 flex-1 px-6 pb-8 space-y-[1px]">
          <AnimatePresence>
            {responses.map((r, i) => (
              <ScrollStrip key={r.id} r={r} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {responses.length === 0 && (
        <div className="relative z-10 flex-1 flex items-center justify-center -mt-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.5 }}
          >
            <h2
              className="text-5xl sm:text-7xl font-bold uppercase tracking-[0.3em] mb-4"
              style={{
                fontFamily:
                  "var(--font-display), var(--font-geist-sans), sans-serif",
                color: "#c9a84c12",
                textShadow: "0 0 80px rgba(201, 168, 76, 0.08)",
              }}
            >
              THE SANCTUM
            </h2>
            <p
              className="text-[10px] uppercase tracking-[0.4em]"
              style={{ color: "#2a2844" }}
            >
              Seven oracles await your question
            </p>
          </motion.div>
        </div>
      )}

      {/* Global styles */}
      <style jsx global>{`
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        @keyframes sanctumPulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes sanctumSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
