"use client";

import { useState, useCallback, useEffect } from "react";
import HydraScene from "../components/HydraScene";
import Header from "../components/Header";
import QueryInput from "../components/QueryInput";
import ResponseGrid from "../components/ResponseGrid";
import CardDesignC from "../components/cards/CardDesignC";
import SourcesPanel from "../components/SourcesPanel";
import ActionBar from "../components/ActionBar";
import FocusModal from "../components/FocusModal";
import MergeCard from "../components/MergeCard";
import LayoutToggle, { LayoutMode } from "../components/LayoutToggle";
import { useStreamQuery } from "../lib/useStreamQuery";
import { useMerge } from "../lib/useMerge";

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

  const { merge, startMerge, clearMerge } = useMerge();

  const [lastPrompt, setLastPrompt] = useState("");
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [focusedCard, setFocusedCard] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutMode>("grid");

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
      clearMerge();
      submit(prompt);
    },
    [submit, clearMerge]
  );

  const doneResponses = responses.filter((r) => r.status === "done");

  // Merge selected (or all) responses into a super response
  const handleMerge = useCallback(() => {
    const toMerge = doneResponses.filter((r) => selectedCards.has(r.id));
    const target = toMerge.length >= 2 ? toMerge : doneResponses;
    if (target.length < 2) return;
    startMerge(
      lastPrompt,
      target.map((r) => ({ name: r.name, text: r.text }))
    );
  }, [doneResponses, selectedCards, lastPrompt, startMerge]);

  const toggleCard = useCallback((id: string) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
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

        {/* Action bar — copy, select all, layout toggle */}
        {doneResponses.length > 0 && (
          <div className="flex items-center justify-between">
            <ActionBar
              prompt={lastPrompt}
              responses={responses}
              selectedCards={selectedCards}
              onSelectAll={() => setSelectedCards(new Set(doneResponses.map((r) => r.id)))}
              onDeselectAll={() => setSelectedCards(new Set())}
              allSelected={allSelected}
              onMerge={handleMerge}
              isMerging={merge.status === "streaming"}
            />
            <LayoutToggle mode={layout} onChange={setLayout} />
          </div>
        )}

        {/* Response cards */}
        {responses.length > 0 && (
          <ResponseGrid layout={layout}>
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
                onExpand={() => setFocusedCard(r.id)}
              />
            ))}
          </ResponseGrid>
        )}

        {/* Merged super response */}
        {merge.status !== "idle" && (
          <MergeCard merge={merge} onClose={clearMerge} />
        )}

        {/* Footer nav to design variants */}
        <nav className="mt-20 pt-6 flex items-center justify-center gap-6 text-[10px] font-mono uppercase tracking-[0.15em]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <a href="/design/1" className="text-[#333] hover:text-[#8b2020] transition-colors">Arena</a>
          <a href="/design/2" className="text-[#333] hover:text-[#c9a84c] transition-colors">Sanctum</a>
          <a href="/design/3" className="text-[#333] hover:text-[#00e5ff] transition-colors">Nexus</a>
          <a href="/usage" className="text-[#333] hover:text-[#d4a574] transition-colors">Usage</a>
        </nav>
      </main>

      {/* Focus/Expand modal */}
      {(() => {
        const focused = responses.find((r) => r.id === focusedCard);
        return (
          <FocusModal
            isOpen={!!focused}
            onClose={() => setFocusedCard(null)}
            name={focused?.name ?? ""}
            color={focused?.color ?? "#999"}
            text={focused?.text ?? ""}
            cutoff={focused?.cutoff}
          />
        );
      })()}
    </>
  );
}
