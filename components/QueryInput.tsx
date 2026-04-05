"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";

/**
 * QueryInput.tsx
 *
 * The centerpiece of Hydra. Big, commanding, impossible to miss.
 * Includes clickable model toggles and web search toggle.
 */

interface ProviderInfo {
  id: string;
  name: string;
  color: string;
}

interface QueryInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  providers?: ProviderInfo[];
  selectedProviders?: Set<string>;
  onToggleProvider?: (id: string) => void;
  webSearch?: boolean;
  onWebSearchChange?: (enabled: boolean) => void;
  searchingWeb?: boolean;
}

export default function QueryInput({
  onSubmit,
  isLoading,
  providers = [],
  selectedProviders,
  onToggleProvider,
  webSearch = true,
  onWebSearchChange,
  searchingWeb,
}: QueryInputProps) {
  const [prompt, setPrompt] = useState("");
  const [focused, setFocused] = useState(false);

  const selectedCount = selectedProviders?.size ?? providers.length;

  const handleSubmit = useCallback(() => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading || selectedCount === 0) return;
    onSubmit(trimmed);
  }, [prompt, isLoading, onSubmit, selectedCount]);

  return (
    <motion.form
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: "#151515",
          border: `1px solid ${focused ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)"}`,
          boxShadow: focused
            ? "0 0 0 1px rgba(255,255,255,0.05), 0 16px 64px rgba(0,0,0,0.5)"
            : "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="What do you want to know?"
          disabled={isLoading}
          className={`
            w-full bg-transparent px-6 pt-5 pb-2 text-[16px] leading-relaxed
            text-white placeholder:text-[#3a3a3a]
            focus:outline-none
            ${isLoading ? "opacity-30 pointer-events-none" : ""}
          `}
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-6 pb-4 pt-1 gap-3">
          {/* Left: model toggles + web search toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Clickable model pills */}
            {providers.map((p) => {
              const isSelected = selectedProviders?.has(p.id) ?? true;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onToggleProvider?.(p.id)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono transition-all duration-150"
                  style={{
                    background: isSelected ? `${p.color}15` : "#1a1a1a",
                    color: isSelected ? p.color : "#333",
                    border: `1px solid ${isSelected ? `${p.color}30` : "#222"}`,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                  title={`${isSelected ? "Disable" : "Enable"} ${p.name}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isSelected ? p.color : "#333" }}
                  />
                  {p.name}
                </button>
              );
            })}

            {/* Web search toggle */}
            {onWebSearchChange && (
              <button
                type="button"
                onClick={() => onWebSearchChange(!webSearch)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono transition-all duration-200"
                style={{
                  background: webSearch ? "#d4a57415" : "#1a1a1a",
                  color: webSearch ? "#d4a574" : "#444",
                  border: `1px solid ${webSearch ? "#d4a57430" : "#222"}`,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Web
              </button>
            )}
          </div>

          {/* Right: submit button */}
          <motion.button
            type="submit"
            disabled={isLoading || !prompt.trim() || selectedCount === 0}
            whileTap={{ scale: 0.97 }}
            className={`
              flex-shrink-0 px-5 py-2 rounded-xl text-[13px] font-semibold
              transition-all duration-150
              disabled:opacity-15 disabled:cursor-not-allowed
              ${isLoading
                ? "bg-[#222] text-[#555]"
                : "bg-[#d4a574] text-[#0c0c0c] hover:bg-[#c4956a]"
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {searchingWeb ? "Searching web..." : "Streaming..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {selectedCount === providers.length ? "Search all models" : `Search ${selectedCount} models`}
                <kbd className="text-[10px] opacity-40 font-mono">{"\u2318"}↵</kbd>
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
