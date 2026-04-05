"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * /usage — Usage dashboard showing request counts, token estimates,
 * and cost estimates per provider. Auto-refreshes every 10 seconds.
 */

interface UsageStat {
  id: string;
  requests: number;
  errors: number;
  estimatedTokens: number;
  estimatedCost: number;
  lastUsed: string | null;
  dashboardUrl: string | null;
  isFree: boolean;
}

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      const data = await res.json();
      setStats(data);
    } catch {
      // Silently fail — will retry on next interval
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and every 10 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const totalRequests = stats.reduce((sum, s) => sum + s.requests, 0);
  const totalTokens = stats.reduce((sum, s) => sum + s.estimatedTokens, 0);
  const totalCost = stats.reduce((sum, s) => sum + s.estimatedCost, 0);
  const totalErrors = stats.reduce((sum, s) => sum + s.errors, 0);

  return (
    <div
      className="min-h-screen py-12 px-6"
      style={{ background: "#0c0c0c", color: "#e8e8e6" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1
              className="text-3xl font-bold tracking-tight mb-1"
              style={{
                fontFamily: "var(--font-display), var(--font-geist-sans), sans-serif",
              }}
            >
              Usage Tracker
            </h1>
            <p className="text-sm" style={{ color: "#666" }}>
              Session stats — resets on server restart
            </p>
          </div>
          <a
            href="/"
            className="text-xs uppercase tracking-widest px-4 py-2 transition-colors"
            style={{
              color: "#d4a574",
              border: "1px solid #d4a57440",
              fontFamily: "var(--font-geist-mono), monospace",
            }}
          >
            Back to Hydra
          </a>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <SummaryCard label="Requests" value={totalRequests.toString()} />
          <SummaryCard
            label="Est. Tokens"
            value={totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens.toString()}
          />
          <SummaryCard
            label="Est. Cost"
            value={totalCost === 0 ? "Free" : `$${totalCost.toFixed(4)}`}
            highlight={totalCost > 0}
          />
          <SummaryCard label="Errors" value={totalErrors.toString()} warn={totalErrors > 0} />
        </div>

        {/* Provider table */}
        {loading ? (
          <p
            className="text-center py-12 text-sm"
            style={{ color: "#555", fontFamily: "var(--font-geist-mono), monospace" }}
          >
            Loading...
          </p>
        ) : stats.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm mb-2" style={{ color: "#555" }}>
              No usage data yet
            </p>
            <p className="text-xs" style={{ color: "#333" }}>
              Submit a query on any page to start tracking
            </p>
          </div>
        ) : (
          <div
            className="overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.05)",
              background: "#141414",
            }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-6 gap-4 px-5 py-3 text-[10px] uppercase tracking-[0.15em] font-bold"
              style={{
                color: "#555",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "var(--font-geist-mono), monospace",
              }}
            >
              <span className="col-span-2">Provider</span>
              <span className="text-right">Requests</span>
              <span className="text-right">Tokens</span>
              <span className="text-right">Cost</span>
              <span className="text-right">Dashboard</span>
            </div>

            {/* Rows */}
            {stats.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-6 gap-4 px-5 py-3 items-center transition-colors"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                {/* Provider name */}
                <div className="col-span-2 flex items-center gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      fontFamily: "var(--font-display), var(--font-geist-sans), sans-serif",
                    }}
                  >
                    {nameFromId(s.id)}
                  </span>
                  {s.isFree && (
                    <span
                      className="text-[9px] uppercase tracking-widest px-1.5 py-0.5"
                      style={{
                        color: "#10b981",
                        background: "#10b98115",
                        fontFamily: "var(--font-geist-mono), monospace",
                      }}
                    >
                      Free
                    </span>
                  )}
                  {s.errors > 0 && (
                    <span
                      className="text-[9px] uppercase tracking-widest px-1.5 py-0.5"
                      style={{
                        color: "#ef4444",
                        background: "#ef444415",
                        fontFamily: "var(--font-geist-mono), monospace",
                      }}
                    >
                      {s.errors} err
                    </span>
                  )}
                </div>

                {/* Requests */}
                <span
                  className="text-right text-sm tabular-nums"
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    color: "#999",
                  }}
                >
                  {s.requests}
                </span>

                {/* Tokens */}
                <span
                  className="text-right text-sm tabular-nums"
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    color: "#999",
                  }}
                >
                  {s.estimatedTokens > 1000
                    ? `${(s.estimatedTokens / 1000).toFixed(1)}k`
                    : s.estimatedTokens}
                </span>

                {/* Cost */}
                <span
                  className="text-right text-sm tabular-nums"
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    color: s.estimatedCost > 0 ? "#d4a574" : "#999",
                  }}
                >
                  {s.estimatedCost === 0 ? "$0" : `$${s.estimatedCost.toFixed(4)}`}
                </span>

                {/* Dashboard link */}
                <div className="text-right">
                  {s.dashboardUrl && (
                    <a
                      href={s.dashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] uppercase tracking-widest transition-colors"
                      style={{
                        color: "#555",
                        fontFamily: "var(--font-geist-mono), monospace",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = "#d4a574";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = "#555";
                      }}
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 space-y-2">
          <p className="text-[11px]" style={{ color: "#333" }}>
            Token counts are estimated (1 token ≈ 4 characters). Costs are approximate based on published pricing.
          </p>
          <p className="text-[11px]" style={{ color: "#333" }}>
            For exact billing, use the dashboard links above to check each provider directly.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Map provider ID to display name */
function nameFromId(id: string): string {
  const names: Record<string, string> = {
    claude: "Claude",
    gemini: "Gemini",
    "groq-llama": "Llama 3.3",
    "groq-qwen": "Qwen 3",
    gemma: "Gemma 3",
  };
  return names[id] ?? id;
}

function SummaryCard({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className="px-4 py-3"
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.15em] mb-1"
        style={{
          color: "#555",
          fontFamily: "var(--font-geist-mono), monospace",
        }}
      >
        {label}
      </p>
      <p
        className="text-xl font-bold tabular-nums"
        style={{
          fontFamily: "var(--font-display), var(--font-geist-sans), sans-serif",
          color: warn ? "#ef4444" : highlight ? "#d4a574" : "#e8e8e6",
        }}
      >
        {value}
      </p>
    </div>
  );
}
