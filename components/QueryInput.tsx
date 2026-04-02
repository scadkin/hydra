"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";

/**
 * QueryInput.tsx
 * Glass-styled prompt input with submit button.
 * Supports Ctrl+Enter / Cmd+Enter to submit.
 */

interface QueryInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export default function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }, [prompt, isLoading, onSubmit]);

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="relative"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
    >
      {/* Textarea with glass styling */}
      <textarea
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          // Submit on Ctrl+Enter or Cmd+Enter
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Ask anything..."
        disabled={isLoading}
        className={`
          w-full rounded-xl px-5 py-4 text-base text-white
          bg-white/[0.05] backdrop-blur-md
          border border-white/[0.1]
          placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500/40
          focus:shadow-[0_0_30px_rgba(59,130,246,0.15)]
          focus:border-blue-500/30
          transition-all duration-300
          ${isLoading ? "opacity-50 pointer-events-none" : ""}
        `}
      />

      {/* Submit button — gradient with hover scale */}
      <motion.button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`
          mt-3 w-full sm:w-auto sm:absolute sm:bottom-3 sm:right-3
          px-6 py-2.5 rounded-lg text-sm font-medium text-white
          bg-gradient-to-r from-blue-600 to-purple-600
          hover:from-blue-500 hover:to-purple-500
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-center gap-2
        `}
      >
        {isLoading ? (
          <>
            {/* Simple CSS spinner */}
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Querying...
          </>
        ) : (
          <>
            Send
            <span className="text-white/40 text-xs hidden sm:inline">
              {"\u2318"}Enter
            </span>
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
