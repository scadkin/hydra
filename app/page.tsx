"use client";

import { useState, useCallback, useEffect } from "react";
import HydraScene from "../components/HydraScene";
import Header from "../components/Header";
import QueryInput from "../components/QueryInput";
import ResponseGrid from "../components/ResponseGrid";
import CardDesignC from "../components/cards/CardDesignC";
import SourcesPanel from "../components/SourcesPanel";
import ActionBar from "../components/ActionBar";
import { useStreamQuery } from "../lib/useStreamQuery";

/**
 * page.tsx — Main page with RAG-augmented multi-LLM comparison.
 */

export default function Home() {
  const {
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
  } = useStreamQuery();

  const [lastPrompt, setLastPrompt] = useState("");
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  // Initialize selectedCards when responses arrive
  useEffect(() => {
    const doneIds = responses.filter((r) => r.status === "done").map((r) => r.id);
    if (doneIds.length > 0) {
      setSelectedCards((prev) => {
        // Only initialize if we have new done responses not yet in the set
        const newSet = new Set(prev);
        for (const id of doneIds) {
          if (!prev.has(id)) newSet.add(id);
        }
        return newSet;
      });
    }
  }, [responses]);

  const handleSubmit = useCallback(
    (prompt: string) => {
      setLastPrompt(prompt);
      setSelectedCards(new Set());
      submit(prompt);
    },
    [submit]
  );

  const toggleCard = useCallback((id: string) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const doneResponses = responses.filter((r) => r.status === "done");
  const allSelected = doneResponses.length > 0 && doneResponses.every((r) => selectedCards.has(r.id));

  return (
    <>
      <HydraScene />
      <main className="relative z-10 min-h-screen max-w-6xl mx-auto px-6 sm:px-8 pb-24">
        <Header />

        <div className="max-w-2xl mx-auto">
          <QueryInput
            onSubmit={handleSubmit}
            isLoading={isLoading}
            providers={providers}
            selectedProviders={selectedProviders}
            onToggleProvider={toggleProvider}
            webSearch={webSearch}
            onWebSearchChange={setWebSearch}
            searchingWeb={searchingWeb}
          />
        </div>

        {/* Search sources */}
        {sources.length > 0 && <SourcesPanel sources={sources} />}

        {/* Action bar — copy, select all */}
        {doneResponses.length > 0 && (
          <ActionBar
            prompt={lastPrompt}
            responses={responses}
            selectedCards={selectedCards}
            onSelectAll={() => setSelectedCards(new Set(doneResponses.map((r) => r.id)))}
            onDeselectAll={() => setSelectedCards(new Set())}
            allSelected={allSelected}
          />
        )}

        {/* Response cards */}
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
                cutoff={r.cutoff}
                isSelected={selectedCards.has(r.id)}
                onToggleSelect={() => toggleCard(r.id)}
              />
            ))}
          </ResponseGrid>
        )}
      </main>
    </>
  );
}
