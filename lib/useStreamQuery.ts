/**
 * useStreamQuery — shared hook for streaming LLM responses via SSE.
 *
 * Fetches the provider list from /api/providers on mount, then streams
 * real responses from /api/query when submit() is called.
 * Handles RAG events (sources, meta) alongside provider chunk/done/error events.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface ProviderResponse {
  id: string;
  name: string;
  color: string;
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  error?: string;
  cutoff?: string; // Knowledge cutoff date (e.g. "January 2025")
}

export interface SearchSource {
  index: number;
  title: string;
  url: string;
  snippet: string;
  date?: string;
  domain: string;
  trustTier: number;
  freshness: string | null;
  sourceType: string;
}

interface ProviderInfo {
  id: string;
  name: string;
  color: string;
  model: string;
}

export function useStreamQuery() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [responses, setResponses] = useState<ProviderResponse[]>([]);
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchingWeb, setSearchingWeb] = useState(false);
  const searchingWebRef = useRef(false);
  const [webSearch, setWebSearch] = useState(true);
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const cutoffsRef = useRef<Record<string, string>>({});

  // Fetch provider list on mount and initialize all as selected
  useEffect(() => {
    fetch("/api/providers")
      .then((res) => res.json())
      .then((data: ProviderInfo[]) => {
        setProviders(data);
        setSelectedProviders(new Set(data.map((p) => p.id)));
      })
      .catch(() => {
        console.warn("Could not fetch providers, using fallback list");
      });
  }, []);

  const toggleProvider = useCallback((id: string) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const submit = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isLoading) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setSources([]);
      searchingWebRef.current = webSearch;
      setSearchingWeb(webSearch);
      cutoffsRef.current = {};

      // Initialize only selected providers as streaming
      const activeProviders = providers.filter((p) => selectedProviders.has(p.id));
      const initial: ProviderResponse[] = activeProviders.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        text: "",
        status: "streaming",
      }));
      setResponses(initial);

      try {
        const providerIds = activeProviders.map((p) => p.id);
        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, webSearch, providers: providerIds }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          setResponses((prev) =>
            prev.map((r) => ({
              ...r,
              status: "error" as const,
              error: err.error || `HTTP ${res.status}`,
            }))
          );
          setIsLoading(false);
          setSearchingWeb(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setIsLoading(false);
          setSearchingWeb(false);
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

              // Handle RAG-specific events
              if (msg.type === "sources") {
                setSources(msg.sources ?? []);
                setSearchingWeb(false);
                continue;
              }

              if (msg.type === "meta") {
                cutoffsRef.current = msg.cutoffs ?? {};
                // Merge cutoff dates into existing responses
                setResponses((prev) =>
                  prev.map((r) => ({
                    ...r,
                    cutoff: cutoffsRef.current[r.id] ?? r.cutoff,
                  }))
                );
                setSearchingWeb(false);
                continue;
              }

              // Handle provider events (chunk, done, error)
              const { provider: pid, type, text, fullText, error, name } = msg;

              // First chunk arriving also means RAG is done
              if (type === "chunk" && searchingWebRef.current) {
                searchingWebRef.current = false;
                setSearchingWeb(false);
              }

              setResponses((prev) => {
                const exists = prev.some((r) => r.id === pid);
                if (!exists && pid) {
                  prev = [
                    ...prev,
                    {
                      id: pid,
                      name: name || pid,
                      color: "#888",
                      text: "",
                      status: "streaming",
                      cutoff: cutoffsRef.current[pid],
                    },
                  ];
                }

                return prev.map((r) => {
                  if (r.id !== pid) return r;

                  if (type === "chunk") {
                    return { ...r, text: r.text + text };
                  }
                  if (type === "done") {
                    return {
                      ...r,
                      text: fullText ?? r.text,
                      status: "done" as const,
                    };
                  }
                  if (type === "error") {
                    return {
                      ...r,
                      status: "error" as const,
                      error: error || "Unknown error",
                    };
                  }
                  return r;
                });
              });
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        // Mark any still-streaming providers as done
        setResponses((prev) =>
          prev.map((r) =>
            r.status === "streaming" ? { ...r, status: "done" as const } : r
          )
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        setResponses((prev) =>
          prev.map((r) =>
            r.status === "streaming"
              ? {
                  ...r,
                  status: "error" as const,
                  error: (err as Error).message || "Network error",
                }
              : r
          )
        );
      } finally {
        setIsLoading(false);
        setSearchingWeb(false);
      }
    },
    [providers, isLoading, webSearch, selectedProviders]
  );

  return {
    providers,
    responses,
    sources,
    isLoading,
    searchingWeb,
    webSearch,
    setWebSearch,
    selectedProviders,
    toggleProvider,
    submit,
  };
}
