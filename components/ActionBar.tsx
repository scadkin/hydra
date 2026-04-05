"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ProviderResponse } from "../lib/useStreamQuery";

/**
 * ActionBar — floating bar with Copy and Merge actions.
 * Appears once at least one response is done.
 */

interface ActionBarProps {
  prompt: string;
  responses: ProviderResponse[];
  selectedCards: Set<string>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allSelected: boolean;
}

export default function ActionBar({
  prompt,
  responses,
  selectedCards,
  onSelectAll,
  onDeselectAll,
  allSelected,
}: ActionBarProps) {
  const [copied, setCopied] = useState(false);

  const doneResponses = responses.filter((r) => r.status === "done");
  if (doneResponses.length === 0) return null;

  const selectedResponses = doneResponses.filter((r) => selectedCards.has(r.id));

  const handleCopyAll = () => {
    const parts = [`# Query: ${prompt}`, ""];

    const toCopy = selectedResponses.length > 0 ? selectedResponses : doneResponses;

    for (const r of toCopy) {
      parts.push(`## ${r.name}`);
      parts.push(r.text);
      parts.push("");
    }

    navigator.clipboard.writeText(parts.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 py-3"
    >
      {/* Select all / deselect all */}
      <button
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="text-[10px] font-mono uppercase tracking-[0.1em] px-2.5 py-1 rounded-md transition-colors"
        style={{
          color: "#555",
          background: "#141414",
          border: "1px solid #222",
        }}
      >
        {allSelected ? "Deselect All" : "Select All"}
      </button>

      {/* Copy button */}
      <button
        onClick={handleCopyAll}
        className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.1em] px-2.5 py-1 rounded-md transition-all"
        style={{
          color: copied ? "#10b981" : "#d4a574",
          background: copied ? "#10b98115" : "#d4a57415",
          border: `1px solid ${copied ? "#10b98130" : "#d4a57430"}`,
        }}
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
            {selectedCards.size < doneResponses.length ? `Copy ${selectedCards.size} Selected` : "Copy All"}
          </>
        )}
      </button>

      {/* Response count */}
      <span className="text-[10px] font-mono text-[#333]">
        {selectedCards.size} of {doneResponses.length} selected
      </span>
    </motion.div>
  );
}
