/**
 * RAG pipeline orchestrator — ties together classification, rewriting,
 * multi-source search, and context building.
 *
 * This is the single entry point called from the API route.
 * It NEVER throws — every failure mode falls back gracefully.
 */

import { RAGContext } from "./types";
import { classifyQuery } from "./classify";
import { rewriteQueries } from "./rewrite";
import { searchMultiSource } from "./search";
import { processResults, buildRAGContext, rerankResults } from "./process";

// If the best reranker score is below this, search results are too
// tangential — skip injection so models use their own knowledge instead.
const SKIP_THRESHOLD = 0.15;

/**
 * Run the full RAG pipeline for a user query.
 *
 * @param prompt - The user's original query
 * @param webSearch - Whether web search is enabled (user toggle)
 * @returns RAGContext with sources, prompts, and metadata
 */
export async function runRAGPipeline(
  prompt: string,
  webSearch: boolean
): Promise<RAGContext> {
  const emptyContext: RAGContext = {
    sources: [],
    searchPerformed: false,
    queries: [],
    rawPrompt: prompt,
    augmentedPrompt: prompt,
    systemMessage: "",
  };

  // User disabled web search
  if (!webSearch) return emptyContext;

  try {
    // Step 1: Classify and rewrite in PARALLEL (both hit Groq, ~200-400ms)
    const [classification, queries] = await Promise.all([
      classifyQuery(prompt),
      rewriteQueries(prompt),
    ]);

    // If the query doesn't need search, skip
    if (!classification.needsSearch) return emptyContext;

    // Step 2: Search multiple sources in parallel (~1-2s)
    const rawResults = await searchMultiSource(queries, classification.focus);

    // If no results from any source, fall back to raw prompt
    if (rawResults.length === 0) return emptyContext;

    // Step 3: Rerank results using Jina semantic reranker (~500ms)
    const rerankResult = await rerankResults(prompt, rawResults);

    // Step 4: Relevance gating
    const topScore = rerankResult?.topScore ?? 0.5;
    if (rerankResult && topScore < SKIP_THRESHOLD) {
      console.log(`[RAG] Skipping — top score ${topScore.toFixed(2)} below ${SKIP_THRESHOLD}`);
      return emptyContext;
    }

    // Pass relevance level so both snippets and prompts adapt
    const relevance: "high" | "moderate" | "low" = topScore > 0.5 ? "high" : topScore > 0.2 ? "moderate" : "low";

    // Step 5: Process, rank, extract snippets, and build prompts
    let sources = processResults(
      rawResults,
      prompt,
      rerankResult?.indices ?? null,
      relevance
    );

    // For low-relevance results, limit to 3 sources to reduce noise
    if (relevance === "low") {
      sources = sources.slice(0, 3);
    }
    const context = buildRAGContext(prompt, sources, queries, relevance);

    return context;
  } catch {
    // Pipeline should never throw, but just in case — return empty context
    return emptyContext;
  }
}
