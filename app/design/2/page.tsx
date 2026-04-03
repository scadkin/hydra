"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "motion/react";

/**
 * DESIGN 2: "The Lab"
 *
 * Light mode, clinical, split-screen. Two columns:
 * Left sidebar (30%) with search input, model selector toggles, and settings.
 * Right column (70%) with scrollable stacked output cards.
 * White/warm gray (#fafaf9, #f0eeeb), black text, teal accent (#0d9488).
 * Notion meets Linear. Clean productivity tool.
 */

interface Response {
  id: string;
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
  enabled: boolean;
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

/* Output card — light, clean, teal left border */
function OutputCard({ r }: { r: Response }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && r.status === "streaming") {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [r.text, r.status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-md"
      style={{
        background: "#ffffff",
        border: "1px solid #e8e5e0",
        borderLeft: "3px solid #0d9488",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #f0eeeb" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: r.color }}
          />
          <span
            className="text-[14px] font-semibold"
            style={{
              color: "#0d9488",
              fontFamily: "var(--font-geist-sans), sans-serif",
            }}
          >
            {r.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {r.status === "streaming" && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-[#0d9488] uppercase tracking-wide">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#0d9488]"
                style={{ animation: "blink 0.8s step-end infinite" }}
              />
              Streaming
            </span>
          )}
          {r.status === "done" && (
            <span className="text-[10px] font-medium text-[#999] uppercase tracking-wide">
              {r.text.split(" ").length} words
            </span>
          )}
          {r.status === "error" && (
            <span className="text-[10px] font-medium text-red-500 uppercase tracking-wide">
              Error
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div ref={contentRef} className="px-4 py-3 max-h-[300px] overflow-y-auto">
        {r.status === "error" && r.error ? (
          <p className="text-[13px] text-red-500">{r.error}</p>
        ) : (
          <pre
            className="whitespace-pre-wrap text-[13px] leading-[1.7]"
            style={{
              fontFamily: "var(--font-geist-sans), sans-serif",
              color: "#374151",
            }}
          >
            {r.text}
            {r.status === "streaming" && (
              <span
                className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom"
                style={{
                  backgroundColor: "#0d9488",
                  animation: "blink 0.6s step-end infinite",
                }}
              />
            )}
          </pre>
        )}
      </div>
    </motion.div>
  );
}

export default function Design2() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [enabledModels, setEnabledModels] = useState<Set<string>>(
    new Set(PROVIDERS.map((p) => p.id))
  );
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const toggleModel = useCallback((id: string) => {
    setEnabledModels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim() || isLoading) return;
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
      setIsLoading(true);

      const activeProviders = PROVIDERS.filter((p) =>
        enabledModels.has(p.id)
      );

      setResponses(
        activeProviders.map((p) => ({
          ...p,
          text: "",
          status: "streaming",
          enabled: true,
        }))
      );

      activeProviders.forEach((prov, idx) => {
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
    [query, isLoading, enabledModels]
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#fafaf9", color: "#1a1a1a" }}
    >
      {/* Top nav bar */}
      <nav
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e8e5e0",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#0d9488] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">H</span>
          </div>
          <span
            className="text-[15px] font-semibold"
            style={{
              color: "#1a1a1a",
              fontFamily: "var(--font-geist-sans), sans-serif",
            }}
          >
            Hydra
          </span>
          <span className="text-[11px] text-[#999] ml-2">
            Multi-model query tool
          </span>
        </div>
        <div className="flex gap-4 text-[11px] font-medium">
          <a
            href="/design/1"
            className="text-[#999] hover:text-[#0d9488] transition-colors"
          >
            Arena
          </a>
          <a href="/design/2" className="text-[#0d9488]">
            Lab
          </a>
          <a
            href="/design/3"
            className="text-[#999] hover:text-[#0d9488] transition-colors"
          >
            Forge
          </a>
        </div>
      </nav>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — 30% */}
        <aside
          className="w-[30%] min-w-[280px] max-w-[380px] flex flex-col overflow-y-auto"
          style={{
            background: "#ffffff",
            borderRight: "1px solid #e8e5e0",
          }}
        >
          {/* Search input */}
          <div className="p-4" style={{ borderBottom: "1px solid #f0eeeb" }}>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#999] mb-2">
              Query
            </label>
            <form onSubmit={handleSubmit}>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to ask?"
                rows={3}
                className="w-full px-3 py-2 text-[13px] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:ring-offset-1"
                style={{
                  background: "#fafaf9",
                  border: "1px solid #e8e5e0",
                  color: "#1a1a1a",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 px-3 py-2 rounded-md text-[12px] font-semibold transition-all disabled:opacity-40"
                style={{
                  background: "#0d9488",
                  color: "#ffffff",
                }}
              >
                {isLoading ? "Querying models..." : "Run Query"}
              </button>
              <p className="mt-1.5 text-[10px] text-[#bbb]">
                {navigator.platform?.includes("Mac") ? "Cmd" : "Ctrl"}+Enter to
                submit
              </p>
            </form>
          </div>

          {/* Model toggles */}
          <div className="p-4" style={{ borderBottom: "1px solid #f0eeeb" }}>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#999] mb-3">
              Models ({enabledModels.size}/{PROVIDERS.length})
            </label>
            <div className="space-y-1.5">
              {PROVIDERS.map((p) => {
                const enabled = enabledModels.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleModel(p.id)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors"
                    style={{
                      background: enabled ? "#f0eeeb" : "transparent",
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-sm flex items-center justify-center"
                      style={{
                        background: enabled ? p.color : "transparent",
                        border: enabled
                          ? `1.5px solid ${p.color}`
                          : "1.5px solid #d0cdc8",
                      }}
                    >
                      {enabled && (
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          fill="none"
                        >
                          <path
                            d="M1.5 4L3.2 5.7L6.5 2.3"
                            stroke="white"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: enabled ? "#1a1a1a" : "#999" }}
                    >
                      {p.name}
                    </span>
                    <div
                      className="ml-auto w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: enabled ? p.color : "#e0ddd8",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings section (decorative) */}
          <div className="p-4">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#999] mb-3">
              Settings
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#666] mb-1">
                  Temperature
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-1.5 rounded-full"
                    style={{ background: "#f0eeeb" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: "#0d9488",
                        width: "70%",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#999]">
                    0.7
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-[#666] mb-1">
                  Max tokens
                </label>
                <div
                  className="px-2.5 py-1.5 rounded-md text-[11px] font-mono"
                  style={{
                    background: "#fafaf9",
                    border: "1px solid #e8e5e0",
                    color: "#666",
                  }}
                >
                  4096
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-[#666]">
                  Stream responses
                </label>
                <div
                  className="w-8 h-4.5 rounded-full relative"
                  style={{ background: "#0d9488" }}
                >
                  <div
                    className="absolute right-0.5 top-0.5 w-3.5 h-3.5 rounded-full bg-white"
                    style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right content — 70% */}
        <main className="flex-1 overflow-y-auto p-6">
          {responses.length > 0 ? (
            <motion.div
              className="space-y-3 max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-[13px] font-semibold text-[#666]"
                  style={{
                    fontFamily: "var(--font-geist-sans), sans-serif",
                  }}
                >
                  Responses ({responses.length})
                </h2>
                {isLoading && (
                  <span className="text-[11px] text-[#0d9488]">
                    Streaming...
                  </span>
                )}
              </div>
              {responses.map((r) => (
                <OutputCard key={r.id} r={r} />
              ))}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#f0eeeb] flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="1.5"
                  >
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </div>
                <h2
                  className="text-[15px] font-semibold text-[#666] mb-1"
                  style={{
                    fontFamily: "var(--font-geist-sans), sans-serif",
                  }}
                >
                  Ready to query
                </h2>
                <p className="text-[12px] text-[#bbb]">
                  Enter a prompt in the sidebar and click Run Query
                </p>
              </motion.div>
            </div>
          )}
        </main>
      </div>

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
