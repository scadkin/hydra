/**
 * useMerge — hook for merging multiple LLM responses into a "super response"
 * via the /api/merge endpoint. Streams the result using SSE.
 */

"use client";

import { useState, useRef, useCallback } from "react";

export interface MergeState {
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
}

export function useMerge() {
  const [merge, setMerge] = useState<MergeState>({ text: "", status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const startMerge = useCallback(
    async (prompt: string, responses: { name: string; text: string }[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setMerge({ text: "", status: "streaming" });

      try {
        const res = await fetch("/api/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, responses }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          setMerge({ text: "", status: "error", error: err.error });
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setMerge({ text: "", status: "error", error: "No stream" });
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const msg = JSON.parse(trimmed.slice(6));

              if (msg.type === "chunk") {
                setMerge((prev) => ({ ...prev, text: prev.text + msg.text }));
              } else if (msg.type === "done") {
                setMerge((prev) => ({
                  ...prev,
                  text: msg.fullText ?? prev.text,
                  status: "done",
                }));
              } else if (msg.type === "error") {
                setMerge((prev) => ({
                  ...prev,
                  status: "error",
                  error: msg.error,
                }));
              }
            } catch {
              // Skip malformed lines
            }
          }
        }

        // If stream ended without a "done" event, mark as done
        setMerge((prev) =>
          prev.status === "streaming" ? { ...prev, status: "done" } : prev
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMerge({
          text: "",
          status: "error",
          error: (err as Error).message || "Network error",
        });
      }
    },
    []
  );

  const clearMerge = useCallback(() => {
    abortRef.current?.abort();
    setMerge({ text: "", status: "idle" });
  }, []);

  return { merge, startMerge, clearMerge };
}
