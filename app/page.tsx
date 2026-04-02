"use client";

import { useState, useCallback, useRef } from "react";
import Background from "../components/Background";
import Header from "../components/Header";
import QueryInput from "../components/QueryInput";
import ResponsePanel from "../components/ResponsePanel";
import ResponseGrid from "../components/ResponseGrid";

/**
 * page.tsx
 * Main orchestrator page. Uses MOCK data to simulate SSE streaming
 * from multiple LLM providers in parallel. Real API integration
 * will replace the mock logic later.
 */

// ─── Types ───

interface ProviderResponse {
  id: string;
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
}

// ─── Mock provider definitions ───

const MOCK_PROVIDERS = [
  { id: "claude", name: "Claude", color: "#d97706" },
  { id: "gemini", name: "Gemini", color: "#4285f4" },
  { id: "grok", name: "Grok", color: "#1d9bf0" },
  { id: "deepseek", name: "DeepSeek", color: "#4f6df5" },
  { id: "openrouter-llama", name: "Llama", color: "#764abc" },
  { id: "openrouter-qwen", name: "Qwen", color: "#06b6d4" },
  { id: "openrouter-deepseek-r1", name: "DeepSeek R1", color: "#10b981" },
];

// Some varied lorem-ipsum-style chunks for realistic-looking streaming
const MOCK_WORDS = [
  "The ", "answer ", "depends ", "on ", "several ", "factors. ",
  "First, ", "consider ", "the ", "underlying ", "architecture ",
  "of ", "the ", "system. ", "Each ", "component ", "interacts ",
  "with ", "others ", "through ", "well-defined ", "interfaces. ",
  "This ", "allows ", "for ", "modularity ", "and ", "flexibility. ",
  "In ", "practice, ", "you'll ", "want ", "to ", "evaluate ",
  "trade-offs ", "between ", "performance ", "and ", "complexity. ",
  "A ", "common ", "approach ", "is ", "to ", "start ", "simple ",
  "and ", "iterate. ", "Let ", "me ", "break ", "this ", "down ",
  "step ", "by ", "step.\n\n",
  "1. ", "Define ", "your ", "requirements ", "clearly.\n",
  "2. ", "Choose ", "the ", "right ", "tools ", "for ", "the ", "job.\n",
  "3. ", "Build ", "incrementally, ", "testing ", "as ", "you ", "go.\n\n",
  "The ", "key ", "insight ", "here ", "is ", "that ", "simplicity ",
  "often ", "wins. ", "Over-engineering ", "leads ", "to ", "technical ",
  "debt ", "that ", "compounds ", "over ", "time. ", "Focus ",
  "on ", "shipping ", "value ", "to ", "users ", "and ", "refining ",
  "based ", "on ", "feedback.\n\n",
  "Hope ", "that ", "helps! ", "Let ", "me ", "know ", "if ",
  "you'd ", "like ", "me ", "to ", "go ", "deeper ", "on ",
  "any ", "of ", "these ", "points.",
];

export default function Home() {
  const [responses, setResponses] = useState<ProviderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Track interval IDs so we can clean up if needed
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const handleSubmit = useCallback((prompt: string) => {
    // Clear any running intervals from a previous query
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];

    setIsLoading(true);

    // Initialize all providers as streaming with empty text
    const initial: ProviderResponse[] = MOCK_PROVIDERS.map((p) => ({
      ...p,
      text: "",
      status: "streaming" as const,
    }));
    setResponses(initial);

    // Start a mock stream for each provider
    MOCK_PROVIDERS.forEach((provider, index) => {
      let wordIndex = 0;

      // Randomize the starting position in the word list for variety
      const startOffset = Math.floor(Math.random() * 20);

      // Each provider streams for a random 2-5 seconds
      const totalDuration = 2000 + Math.random() * 3000;
      const startTime = Date.now();

      // Provider at index 4 (Llama) simulates an error after 1 second
      const willError = index === 4;

      const intervalMs = 50 + Math.random() * 100; // 50-150ms between chunks

      const intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;

        // Error simulation
        if (willError && elapsed > 1000) {
          clearInterval(intervalId);
          setResponses((prev) =>
            prev.map((r) =>
              r.id === provider.id
                ? {
                    ...r,
                    status: "error" as const,
                    error: "Connection timed out — model unavailable",
                  }
                : r
            )
          );
          checkAllDone();
          return;
        }

        // Done condition
        if (elapsed >= totalDuration) {
          clearInterval(intervalId);
          setResponses((prev) =>
            prev.map((r) =>
              r.id === provider.id ? { ...r, status: "done" as const } : r
            )
          );
          checkAllDone();
          return;
        }

        // Append next word chunk
        const word =
          MOCK_WORDS[(startOffset + wordIndex) % MOCK_WORDS.length];
        wordIndex++;

        setResponses((prev) =>
          prev.map((r) =>
            r.id === provider.id ? { ...r, text: r.text + word } : r
          )
        );
      }, intervalMs);

      intervalsRef.current.push(intervalId);
    });

    // Helper: check if all providers are done/errored, then stop loading
    function checkAllDone() {
      setResponses((prev) => {
        const allFinished = prev.every(
          (r) => r.status === "done" || r.status === "error"
        );
        if (allFinished) {
          setIsLoading(false);
        }
        return prev;
      });
    }
  }, []);

  return (
    <>
      <Background />
      <main className="relative z-10 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <QueryInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        {responses.length > 0 && (
          <ResponseGrid>
            {responses.map((r) => (
              <ResponsePanel
                key={r.id}
                name={r.name}
                color={r.color}
                text={r.text}
                status={r.status}
                error={r.error}
              />
            ))}
          </ResponseGrid>
        )}
      </main>
    </>
  );
}
