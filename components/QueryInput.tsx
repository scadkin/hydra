"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";

/**
 * QueryInput.tsx
 *
 * The centerpiece of Hydra. Big, commanding, impossible to miss.
 * Inspired by Perplexity's search and Linear's command bar.
 * The ONLY accent-colored element is the submit button.
 */

interface QueryInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export default function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [prompt, setPrompt] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = useCallback(() => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }, [prompt, isLoading, onSubmit]);

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
        <div className="flex items-center justify-between px-6 pb-4 pt-1">
          {/* Model indicators — tiny colored squares showing what will be queried */}
          <div className="flex items-center gap-1.5">
            {["#d4a574","#7a9ec2","#89b4c8","#8888b8","#a888a8","#7ab0a0","#88b088"].map((c, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: c, opacity: 0.6 }} />
            ))}
            <span className="text-[11px] text-[#444] ml-2 font-mono">7 models</span>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            whileTap={{ scale: 0.97 }}
            className={`
              px-5 py-2 rounded-xl text-[13px] font-semibold
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
                Searching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Search all models
                <kbd className="text-[10px] opacity-40 font-mono">{"\u2318"}↵</kbd>
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
