"use client";

import { useState, useCallback, useRef } from "react";
import HydraAscii from "../components/HydraAscii";
import Header from "../components/Header";
import QueryInput from "../components/QueryInput";
import ResponseGrid from "../components/ResponseGrid";
import CardDesignC from "../components/cards/CardDesignC";

/**
 * page.tsx — Main page with animated ASCII Hydra background + Design C cards.
 */

interface ProviderResponse {
  id: string;
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
}

const MOCK_PROVIDERS = [
  { id: "claude", name: "Claude", color: "#d4a574" },
  { id: "gemini", name: "Gemini", color: "#7a9ec2" },
  { id: "grok", name: "Grok", color: "#89b4c8" },
  { id: "deepseek", name: "DeepSeek", color: "#8888b8" },
  { id: "openrouter-llama", name: "Llama", color: "#a888a8" },
  { id: "openrouter-qwen", name: "Qwen", color: "#7ab0a0" },
  { id: "openrouter-deepseek-r1", name: "DeepSeek R1", color: "#88b088" },
];

const MOCK_CHUNKS = [
  "That's a great question. ", "Let me think through this carefully.\n\n",
  "The short answer is that it depends on context, ",
  "but here's how I'd break it down:\n\n",
  "First, consider what you're optimizing for. ",
  "If speed matters most, you'd want to ",
  "minimize round trips and batch operations. ",
  "If correctness is the priority, ",
  "then a more methodical approach works better.\n\n",
  "Here's a practical framework:\n\n",
  "1. Start with the simplest version that could work\n",
  "2. Measure actual performance, not guesses\n",
  "3. Optimize only the bottlenecks you find\n",
  "4. Keep the code readable throughout\n\n",
  "The trap most people fall into is premature optimization. ",
  "Profile first, then decide.\n\n",
  "Want me to go deeper on any of these points?",
];

export default function Home() {
  const [responses, setResponses] = useState<ProviderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const handleSubmit = useCallback((_prompt: string) => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
    setIsLoading(true);

    const initial: ProviderResponse[] = MOCK_PROVIDERS.map((p) => ({
      ...p, text: "", status: "streaming" as const,
    }));
    setResponses(initial);

    MOCK_PROVIDERS.forEach((provider, index) => {
      let ci = 0;
      const offset = Math.floor(Math.random() * 6);
      const dur = 2500 + Math.random() * 3500;
      const start = Date.now();
      const willError = index === 4;
      const ms = 60 + Math.random() * 120;

      const id = setInterval(() => {
        const elapsed = Date.now() - start;
        if (willError && elapsed > 1200) {
          clearInterval(id);
          setResponses(p => p.map(r => r.id === provider.id ? { ...r, status: "error" as const, error: "Request timed out" } : r));
          checkDone(); return;
        }
        if (elapsed >= dur) {
          clearInterval(id);
          setResponses(p => p.map(r => r.id === provider.id ? { ...r, status: "done" as const } : r));
          checkDone(); return;
        }
        const chunk = MOCK_CHUNKS[(offset + ci) % MOCK_CHUNKS.length];
        ci++;
        setResponses(p => p.map(r => r.id === provider.id ? { ...r, text: r.text + chunk } : r));
      }, ms);
      intervalsRef.current.push(id);
    });

    function checkDone() {
      setResponses(p => {
        if (p.every(r => r.status === "done" || r.status === "error")) setIsLoading(false);
        return p;
      });
    }
  }, []);

  return (
    <>
      <HydraAscii />
      <main className="relative z-10 min-h-screen max-w-6xl mx-auto px-6 sm:px-8 pb-24">
        <Header />

        <div className="max-w-2xl mx-auto">
          <QueryInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {responses.length > 0 && (
          <ResponseGrid>
            {responses.map((r) => (
              <CardDesignC
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
