"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import HydraSanctum from "../../../components/hydra/HydraSanctum";
import SourcesPanel from "../../../components/SourcesPanel";
import { useStreamQuery, ProviderResponse } from "../../../lib/useStreamQuery";

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

type Response = ProviderResponse;

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
  // Use percentage-based radius so dots scale with container
  const radiusPct = 45; // % of container half-size
  const x = Math.cos(angle) * radiusPct;
  const y = Math.sin(angle) * radiusPct;

  return (
    <div
      className="absolute flex flex-col items-center gap-1"
      style={{
        left: `calc(50% + ${x}% - 20px)`,
        top: `calc(50% + ${y}% - 20px)`,
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
  const { providers, responses, sources, isLoading, searchingWeb, webSearch, setWebSearch, submit } = useStreamQuery();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    submit(query);
  };

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
        <div className="flex gap-4 sm:gap-6 text-[10px] uppercase tracking-[0.3em]">
          <a
            href="/"
            className="transition-colors"
            style={{ color: "#2a2f44" }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#c9a84c";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#2a2f44";
            }}
          >
            Home
          </a>
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
        {/* Circle container — scales down on mobile */}
        <div className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px]">
          {/* Oracle dots */}
          {providers.map((prov, i) => {
            const resp = responses.find((r) => r.id === prov.id);
            return (
              <OracleDot
                key={prov.id}
                provider={prov}
                index={i}
                total={providers.length}
                status={resp?.status ?? "idle"}
              />
            );
          })}

          {/* The summoning circle itself */}
          <div
            className="absolute inset-0 flex items-center justify-center w-[220px] h-[220px] sm:w-[320px] sm:h-[320px]"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
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
              className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 px-4 sm:px-8 w-[180px] sm:w-[260px]"
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

              {/* Web search toggle */}
              <button
                type="button"
                onClick={() => setWebSearch(!webSearch)}
                className="text-[9px] uppercase tracking-[0.3em] transition-all"
                style={{
                  color: webSearch ? "#c9a84c88" : "#2a2844",
                  fontFamily: "var(--font-geist-mono), monospace",
                }}
              >
                {searchingWeb ? "scrying the web..." : webSearch ? "⦿ web oracle" : "⦾ web oracle"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Search sources */}
      {sources.length > 0 && (
        <div className="relative z-10 px-6">
          <SourcesPanel sources={sources} />
        </div>
      )}

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
