"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import HydraNexus from "../../../components/hydra/HydraNexus";
import SourcesPanel from "../../../components/SourcesPanel";
import { useStreamQuery, ProviderResponse } from "../../../lib/useStreamQuery";

/**
 * DESIGN 3: "The Nexus"
 *
 * Cyberpunk / Neon neural interface. Page split into 3 horizontal bands:
 * Top nav, middle search area, bottom horizontal-scroll card carousel.
 * Pure black (#050505) with electric cyan (#00e5ff) and neon green (#39ff14).
 * Geist Mono everywhere — full terminal aesthetic. Matrix meets Neuromancer.
 */

type Response = ProviderResponse;

/* Terminal-style card for horizontal carousel */
function TerminalCard({ r, index }: { r: Response; index: number }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && r.status === "streaming") {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [r.text, r.status]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex-shrink-0 group relative w-[240px] sm:w-[280px]"
      style={{
        height: 500,
        background: "#0d0d0d",
        border: `1px solid ${r.status === "streaming" ? "#00e5ff" : "#151515"}`,
        boxShadow:
          r.status === "streaming"
            ? "0 0 20px rgba(0, 229, 255, 0.1), inset 0 0 30px rgba(0, 229, 255, 0.02)"
            : "none",
        transition: "border-color 0.3s, box-shadow 0.3s",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "#00e5ff";
        el.style.boxShadow =
          "0 0 25px rgba(0, 229, 255, 0.15), inset 0 0 40px rgba(0, 229, 255, 0.03)";
        el.style.transform = "scale(1.02)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor =
          r.status === "streaming" ? "#00e5ff" : "#151515";
        el.style.boxShadow =
          r.status === "streaming"
            ? "0 0 20px rgba(0, 229, 255, 0.1), inset 0 0 30px rgba(0, 229, 255, 0.02)"
            : "none";
        el.style.transform = "scale(1)";
      }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
        }}
      />

      {/* Terminal header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid #151515", background: "#0a0a0a" }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#ff3b30" }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#ffcc00" }}
          />
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                r.status === "streaming" ? "#39ff14" : "#28cd41",
              animation:
                r.status === "streaming"
                  ? "nexusPulse 0.8s ease-in-out infinite"
                  : "none",
            }}
          />
        </div>
        <span
          className="text-[10px] uppercase tracking-[0.2em] font-bold"
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            color: "#00e5ff",
          }}
        >
          {r.name}
        </span>
        <span
          className="text-[8px] uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            color:
              r.status === "streaming"
                ? "#39ff14"
                : r.status === "error"
                  ? "#ff3b30"
                  : r.status === "done"
                    ? "#39ff14"
                    : "#222",
          }}
        >
          {r.status === "streaming"
            ? "LIVE"
            : r.status === "done"
              ? "DONE"
              : r.status === "error"
                ? "ERR"
                : "---"}
        </span>
      </div>

      {/* Body */}
      <div
        ref={contentRef}
        className="relative z-0 overflow-y-auto p-3"
        style={{ height: "calc(100% - 36px)" }}
      >
        {r.status === "error" && r.error ? (
          <div
            className="text-[11px]"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              color: "#ff3b30",
            }}
          >
            <span style={{ color: "#ff3b30" }}>ERROR:</span> {r.error}
            <br />
            <br />
            <span style={{ color: "#333" }}>
              Connection terminated. Retry with /reconnect
            </span>
          </div>
        ) : (
          <pre
            className="whitespace-pre-wrap text-[11px] leading-[1.7]"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              color: "#39ff14",
            }}
          >
            {r.text}
            {r.status === "streaming" && (
              <span
                className="inline-block w-[7px] h-[13px] ml-0.5 align-text-bottom"
                style={{
                  backgroundColor: "#00e5ff",
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
  const { providers, responses, sources, isLoading, searchingWeb, webSearch, setWebSearch, submit } = useStreamQuery();
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    submit(query);
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "#050505", color: "#eee" }}
    >
      <HydraNexus />

      {/* === BAND 1: Top nav bar (60px) === */}
      <nav
        className="relative z-20 flex items-center justify-between px-5"
        style={{
          height: 60,
          minHeight: 60,
          borderBottom: "1px solid #111",
          background: "#050505",
        }}
      >
        <div className="flex items-center gap-4">
          <h1
            className="text-lg font-bold uppercase tracking-[0.3em]"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              color: "#00e5ff",
              textShadow:
                "0 0 10px rgba(0, 229, 255, 0.3), 0 0 40px rgba(0, 229, 255, 0.1)",
              animation: "nexusGlitch 4s ease-in-out infinite",
            }}
          >
            HYDRA
          </h1>

          {/* Model status indicators */}
          <div className="flex items-center gap-2 ml-4">
            {providers.map((prov) => {
              const resp = responses.find((r) => r.id === prov.id);
              const st = resp?.status ?? "idle";
              return (
                <div
                  key={prov.id}
                  className="flex items-center gap-1"
                  title={prov.name}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        st === "streaming"
                          ? "#39ff14"
                          : st === "done"
                            ? "#39ff14"
                            : st === "error"
                              ? "#ff3b30"
                              : "#1a1a1a",
                      animation:
                        st === "streaming"
                          ? "nexusPulse 0.6s ease-in-out infinite"
                          : "none",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="flex gap-3 sm:gap-5 text-[10px] uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        >
          <a
            href="/"
            className="transition-colors"
            style={{ color: "#222" }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#00e5ff";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#222";
            }}
          >
            Home
          </a>
          <a
            href="/design/1"
            className="transition-colors"
            style={{ color: "#222" }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#00e5ff";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#222";
            }}
          >
            Arena
          </a>
          <a
            href="/design/2"
            className="transition-colors"
            style={{ color: "#222" }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#00e5ff";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#222";
            }}
          >
            Sanctum
          </a>
          <a href="/design/3" style={{ color: "#00e5ff" }}>
            Nexus
          </a>
        </div>
      </nav>

      {/* === BAND 2: Search area (variable height) === */}
      <div
        className="relative z-20 flex items-center"
        style={{
          height: responses.length > 0 ? 80 : 200,
          minHeight: responses.length > 0 ? 80 : 200,
          transition: "height 0.4s ease, min-height 0.4s ease",
          background: "#0a0a0a",
          borderBottom: "1px solid #111",
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center w-full px-3 sm:px-5 gap-2 sm:gap-3"
        >
          <span
            className="text-sm font-bold select-none"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              color: "#00e5ff",
              animation: "blink 1s step-end infinite",
            }}
          >
            {">_"}
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter query..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              color: "#ccc",
              borderBottom: "2px solid #00e5ff20",
              paddingBottom: 4,
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderBottom =
                "2px solid #00e5ff";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderBottom =
                "2px solid #00e5ff20";
            }}
          />
          {/* Web search toggle */}
          <button
            type="button"
            onClick={() => setWebSearch(!webSearch)}
            className="px-3 py-2 text-[9px] uppercase tracking-[0.2em] font-bold transition-all"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              color: webSearch ? "#39ff14" : "#222",
              border: `1px solid ${webSearch ? "#39ff1430" : "#151515"}`,
            }}
          >
            {searchingWeb ? "SCAN..." : webSearch ? "NET:ON" : "NET:OFF"}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-[10px] uppercase tracking-[0.3em] font-bold transition-all"
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              background: isLoading ? "#050505" : "#00e5ff",
              color: isLoading ? "#00e5ff40" : "#050505",
              border: `1px solid ${isLoading ? "#00e5ff30" : "#00e5ff"}`,
            }}
          >
            {isLoading ? "STREAMING..." : "JACK IN"}
          </button>
        </form>
      </div>

      {/* Search sources */}
      {sources.length > 0 && (
        <div className="relative z-20 px-5" style={{ borderBottom: "1px solid #111" }}>
          <SourcesPanel sources={sources} />
        </div>
      )}

      {/* === BAND 3: Output area (remaining) === */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {responses.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex-1 flex items-start gap-4 px-5 py-5 overflow-x-auto overflow-y-hidden"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#00e5ff30 transparent",
            }}
          >
            <AnimatePresence>
              {responses.map((r, i) => (
                <TerminalCard key={r.id} r={r} index={i} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <pre
                className="text-[10px] sm:text-xs leading-[1.3] mb-6"
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  color: "#00e5ff08",
                  textShadow: "0 0 40px rgba(0, 229, 255, 0.05)",
                }}
              >
                {`
 ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
 ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
 ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝`}
              </pre>
              <p
                className="text-[10px] uppercase tracking-[0.4em]"
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  color: "#39ff14",
                  textShadow: "0 0 10px rgba(57, 255, 20, 0.2)",
                  animation: "nexusPulse 2s ease-in-out infinite",
                }}
              >
                Neural interface ready
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Global styles */}
      <style jsx global>{`
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        @keyframes nexusPulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes nexusGlitch {
          0%,
          94%,
          100% {
            text-shadow:
              0 0 10px rgba(0, 229, 255, 0.3),
              0 0 40px rgba(0, 229, 255, 0.1);
            transform: translate(0);
          }
          95% {
            text-shadow:
              -2px 0 #ff3b30,
              2px 0 #00e5ff;
            transform: translate(2px, -1px);
          }
          96% {
            text-shadow:
              2px 0 #ff3b30,
              -2px 0 #00e5ff;
            transform: translate(-2px, 1px);
          }
          97% {
            text-shadow:
              0 0 10px rgba(0, 229, 255, 0.3),
              0 0 40px rgba(0, 229, 255, 0.1);
            transform: translate(0);
          }
        }
      `}</style>
    </div>
  );
}
