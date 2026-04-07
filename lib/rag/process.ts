/**
 * Result processing — scores, ranks, extracts relevant snippets, and builds
 * the augmented prompts for LLMs with structured source tags.
 */

import { SearchSource, RAGContext } from "./types";
import { RawSearchResult } from "./search";
import {
  TRUST_TIER_1_TLDS,
  TRUST_TIER_2_DOMAINS,
  TRUST_TIER_3_DOMAINS,
  SOURCE_TYPE_PATTERNS,
} from "./constants";

const MAX_SNIPPET_LENGTH = 1500;
const MAX_SNIPPET_LENGTH_LOW = 600;  // Shorter snippets for low-relevance sources
const MAX_SOURCES = 5;
const MAX_PER_DOMAIN = 2;           // Cap results per domain for diversity

// Common stopwords to filter from query term matching
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "shall", "to", "of", "in", "for",
  "on", "with", "at", "by", "from", "as", "into", "about", "between",
  "through", "and", "or", "but", "not", "no", "if", "then", "than",
  "so", "it", "its", "this", "that", "these", "those", "what", "which",
  "who", "how", "when", "where", "why", "all", "each", "every", "both",
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "they",
]);

// ---------------------------------------------------------------------------
// Source quality scoring
// ---------------------------------------------------------------------------

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getTrustTier(domain: string): 1 | 2 | 3 | 4 | 5 {
  for (const tld of TRUST_TIER_1_TLDS) {
    if (domain.endsWith(tld)) return 1;
  }
  for (const d of TRUST_TIER_2_DOMAINS) {
    if (domain === d || domain.endsWith("." + d)) return 2;
  }
  for (const d of TRUST_TIER_3_DOMAINS) {
    if (domain === d || domain.endsWith("." + d)) return 3;
  }
  if (domain.endsWith(".com") || domain.endsWith(".org") || domain.endsWith(".net")) return 4;
  return 5;
}

function getFreshness(dateStr?: string): SearchSource["freshness"] {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 24) return "breaking";
    if (hoursAgo < 24 * 7) return "recent";
    if (hoursAgo < 24 * 30) return "current";
    return "dated";
  } catch {
    return null;
  }
}

function getSourceType(url: string): SearchSource["sourceType"] {
  for (const { pattern, type } of SOURCE_TYPE_PATTERNS) {
    if (pattern.test(url)) return type;
  }
  return "general";
}

function scoreResult(result: RawSearchResult, trustTier: number, freshness: SearchSource["freshness"]): number {
  let score = 0;
  score += (6 - trustTier) * 3;
  if (freshness === "breaking") score += 5;
  else if (freshness === "recent") score += 3;
  else if (freshness === "current") score += 1;
  if (result.content.length > 500) score += 3;
  else if (result.content.length > 100) score += 1;
  if (result.source === "jina") score += 1;
  return score;
}

// ---------------------------------------------------------------------------
// Smart snippet extraction (A1)
// ---------------------------------------------------------------------------

/**
 * Extract the most relevant paragraphs from content based on query keyword overlap.
 * Much better than truncating from the start — finds the actual relevant info
 * even if it's buried deep in the page.
 */
function extractBestParagraphs(content: string, query: string, maxLength: number): string {
  if (!content || content.length <= maxLength) return content;

  // Extract meaningful query terms (lowercase, no stopwords, 3+ chars)
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));

  // Split content into paragraphs (double newline or single newline for short docs)
  let paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 30);
  if (paragraphs.length < 3) {
    paragraphs = content.split(/\n/).filter((p) => p.trim().length > 30);
  }

  // If we still can't split into paragraphs, fall back to sentence-based truncation
  if (paragraphs.length <= 1) {
    return content.slice(0, maxLength).trim() + "...";
  }

  // Score each paragraph by query term overlap
  const scored = paragraphs.map((p, originalIndex) => {
    const lower = p.toLowerCase();
    let hits = 0;
    for (const term of queryTerms) {
      if (lower.includes(term)) hits++;
    }
    // Small positional bonus for the first paragraph (often contains the lede)
    const posBonus = originalIndex === 0 ? 1 : 0;
    return { text: p.trim(), score: hits + posBonus, originalIndex };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Greedily accumulate best paragraphs up to maxLength
  const selected: typeof scored = [];
  let totalLength = 0;
  for (const p of scored) {
    if (totalLength + p.text.length > maxLength) {
      // If we haven't selected anything yet, take a truncated version
      if (selected.length === 0) {
        selected.push({ ...p, text: p.text.slice(0, maxLength) + "..." });
      }
      break;
    }
    selected.push(p);
    totalLength += p.text.length + 2; // +2 for \n\n separator
  }

  // Re-sort by original document order so the snippet reads naturally
  selected.sort((a, b) => a.originalIndex - b.originalIndex);

  return selected.map((p) => p.text).join("\n\n");
}

// ---------------------------------------------------------------------------
// Lost-in-the-middle reordering (A5)
// ---------------------------------------------------------------------------

/**
 * Reorder sources so the most relevant is first and second-most-relevant is last.
 * LLMs attend more to the beginning and end of context (lost-in-the-middle effect).
 */
function reorderForAttention<T>(items: T[]): T[] {
  if (items.length <= 2) return items;

  // items[0] = most relevant, items[1] = second most, etc.
  const reordered: T[] = [];
  reordered.push(items[0]); // Most relevant → first

  // Middle positions: items[2], items[3], etc.
  for (let i = 2; i < items.length; i++) {
    reordered.push(items[i]);
  }

  reordered.push(items[1]); // Second most relevant → last

  return reordered;
}

// ---------------------------------------------------------------------------
// Jina Reranker — semantic relevance scoring (A3)
// ---------------------------------------------------------------------------

/**
 * Rerank results using Jina's semantic reranker. Returns results sorted by
 * actual relevance to the query, not just heuristic scoring.
 * Falls back to null on any failure (caller uses heuristic scoring instead).
 */
export interface RerankResult {
  indices: number[];
  topScore: number; // highest relevance score (0-1), used for gating
}

export async function rerankResults(
  query: string,
  results: RawSearchResult[]
): Promise<RerankResult | null> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey || results.length === 0) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const documents = results.map(
      (r) => `${r.title}\n${r.content}`.slice(0, 2000)
    );

    const res = await fetch("https://api.jina.ai/v1/rerank", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "jina-reranker-v3",
        query,
        documents,
        top_n: MAX_SOURCES,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const ranked = data.results as Array<{ index: number; relevance_score: number }>;

    if (!Array.isArray(ranked) || ranked.length === 0) return null;

    return {
      indices: ranked.map((r) => r.index),
      topScore: ranked[0]?.relevance_score ?? 0,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Process raw search results into scored, ranked, and snippet-extracted SearchSource objects.
 * @param query - The user's original query (used for smart snippet extraction)
 * @param rerankedIndices - Optional pre-ranked indices from Jina Reranker (A3)
 * @param relevance - How relevant the sources are overall (affects snippet length)
 */
export function processResults(
  rawResults: RawSearchResult[],
  query: string,
  rerankedIndices?: number[] | null | undefined,
  relevance: "high" | "moderate" | "low" = "moderate"
): SearchSource[] {
  // Enrich all results with metadata
  const enriched = rawResults.map((r) => {
    const domain = extractDomain(r.url);
    const trustTier = getTrustTier(domain);
    const freshness = getFreshness(r.date);
    const sourceType = getSourceType(r.url);
    const score = scoreResult(r, trustTier, freshness);
    return { raw: r, domain, trustTier, freshness, sourceType, score };
  });

  // Pick top results with domain diversity enforcement
  let ranked;
  if (rerankedIndices && rerankedIndices.length > 0) {
    ranked = rerankedIndices
      .filter((i) => i < enriched.length)
      .map((i) => enriched[i]);
  } else {
    enriched.sort((a, b) => b.score - a.score);
    ranked = enriched;
  }

  // Enforce max per domain so results aren't all from one site
  const top: typeof ranked = [];
  const domainCounts = new Map<string, number>();
  for (const item of ranked) {
    const count = domainCounts.get(item.domain) ?? 0;
    if (count >= MAX_PER_DOMAIN) continue;
    domainCounts.set(item.domain, count + 1);
    top.push(item);
    if (top.length >= MAX_SOURCES) break;
  }

  // Apply lost-in-the-middle reordering (A5)
  const reordered = reorderForAttention(top);

  // Use shorter snippets for low-relevance results to reduce noise
  const snippetLength = relevance === "low" ? MAX_SNIPPET_LENGTH_LOW : MAX_SNIPPET_LENGTH;

  // Build SearchSource objects with citation indices (assigned AFTER reordering)
  return reordered.map((item, i) => ({
    index: i + 1,
    title: item.raw.title || item.domain,
    url: item.raw.url,
    snippet: extractBestParagraphs(item.raw.content || item.raw.title, query, snippetLength),
    date: item.raw.date,
    domain: item.domain,
    trustTier: item.trustTier,
    freshness: item.freshness,
    sourceType: item.sourceType,
  }));
}

/**
 * Build the full RAG context with structured source tags (A4).
 */
export function buildRAGContext(
  prompt: string,
  sources: SearchSource[],
  queries: string[],
  relevance: "high" | "moderate" | "low" = "moderate"
): RAGContext {
  if (sources.length === 0) {
    return {
      sources: [],
      searchPerformed: false,
      queries,
      rawPrompt: prompt,
      augmentedPrompt: prompt,
      systemMessage: "",
    };
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format sources as structured XML tags (A4)
  const sourcesBlock = sources
    .map((s) => {
      const datePart = s.date
        ? new Date(s.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "";
      return `<source id="${s.index}" domain="${s.domain}" date="${datePart}" title="${s.title}">\n${s.snippet}\n</source>`;
    })
    .join("\n\n");

  // Adjust prompt framing based on how relevant the sources actually are
  let sourceInstruction: string;
  let geminiPrefix: string;

  if (relevance === "high") {
    // Sources directly answer the question — emphasize them
    sourceInstruction = `Recent web search results are provided below and are directly relevant to the question. Use them as your primary information source. Cite them inline as [1], [2], etc. You may supplement with your own knowledge where the sources leave gaps.`;
    geminiPrefix = `Use these highly relevant web search results to answer. Cite as [1] [2] etc. Supplement with your own knowledge where needed.`;
  } else if (relevance === "moderate") {
    // Sources are somewhat relevant — balance sources and own knowledge
    sourceInstruction = `Recent web search results are included below as context. They may be partially relevant to the question. Use them when applicable and cite as [1], [2], etc., but also draw on your own knowledge to give a complete answer. Don't limit yourself to what the sources say.`;
    geminiPrefix = `Web search results are included as context. Use them where relevant (cite as [1] [2]), but also use your own knowledge for a complete answer.`;
  } else {
    // Sources are barely relevant — DON'T constrain the model
    sourceInstruction = `Answer this question using your own knowledge. Some loosely related web results appear below — ignore them unless one happens to be directly useful. Do NOT force citations or anchor your answer on these results.`;
    geminiPrefix = `Answer from your own knowledge. Ignore the web results below unless one is directly useful. Do NOT force citations.`;
  }

  const systemMessage = `You are a knowledgeable assistant. Today is ${today}.

${sourceInstruction}

Guidelines:
- Give a direct, substantive answer. Do not hedge or disclaim excessively.
- Be concise.

<supplementary_sources>
${sourcesBlock}
</supplementary_sources>`;

  const augmentedPrompt = `${prompt}

[WEB CONTEXT — ${geminiPrefix}]
Today is ${today}.

${sourcesBlock}`;

  return {
    sources,
    searchPerformed: true,
    queries,
    rawPrompt: prompt,
    augmentedPrompt,
    systemMessage,
  };
}
