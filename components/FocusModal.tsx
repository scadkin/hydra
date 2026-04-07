"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * FocusModal — Full-width overlay for reading a single LLM response.
 * Opens when user clicks expand on a card, closes on Escape or clicking backdrop.
 */

interface FocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  color: string;
  text: string;
  cutoff?: string;
}

export default function FocusModal({ isOpen, onClose, name, color, text, cutoff }: FocusModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            className="relative w-full max-w-4xl mx-6 my-12 rounded-xl overflow-hidden"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Header */}
            <div
              className="px-8 py-6 relative overflow-hidden"
              style={{ background: `${color}10` }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors z-10"
                style={{ color: "#666", background: "#0c0c0c60" }}
                title="Close (Esc)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Provider name */}
              <h2
                className="text-[36px] font-bold tracking-[-0.03em] leading-none"
                style={{ color, fontFamily: "var(--font-display), sans-serif" }}
              >
                {name}
              </h2>

              <div className="flex items-center gap-3 mt-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#555]">
                  {text.split(" ").length} words
                </span>
                {cutoff && (
                  <span className="text-[10px] font-mono" style={{ color: "#3a3a3a" }}>
                    • Knowledge cutoff: {cutoff}
                  </span>
                )}
              </div>

              {/* Decorative initial */}
              <span
                className="absolute -right-6 -top-8 text-[160px] font-black leading-none select-none pointer-events-none"
                style={{ color: `${color}06`, fontFamily: "var(--font-display), sans-serif" }}
              >
                {name[0]}
              </span>
            </div>

            {/* Response text — larger, more readable */}
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-[14px] text-[#bbb] leading-[1.9]">
                {text}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
