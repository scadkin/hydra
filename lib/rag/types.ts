/**
 * Shared types for the RAG (Retrieval-Augmented Generation) pipeline.
 */

export interface SearchSource {
  index: number;          // 1-based citation number [1], [2], etc.
  title: string;
  url: string;
  snippet: string;        // truncated relevant excerpt (~1500 chars max)
  date?: string;          // publication date if available
  domain: string;         // extracted domain name (e.g. "reuters.com")
  trustTier: 1 | 2 | 3 | 4 | 5; // 1=highest (.gov,.edu), 5=unknown
  freshness: "breaking" | "recent" | "current" | "dated" | null;
  sourceType: "news" | "tech" | "academic" | "wiki" | "forum" | "general";
}

export interface ClassificationResult {
  needsSearch: boolean;
  confidence: number;     // 0-1
  focus: "news" | "tech" | "academic" | "general";
}

export interface RAGContext {
  sources: SearchSource[];
  searchPerformed: boolean;
  queries: string[];       // the rewritten queries that were actually searched
  rawPrompt: string;       // original user prompt (for Claude/OpenAI system msg approach)
  augmentedPrompt: string; // context prepended to user prompt (for Gemini)
  systemMessage: string;   // system message with sources (for Claude/OpenAI)
}

/** Raw result from Jina Search API */
export interface JinaResult {
  title: string;
  url: string;
  content: string;
  description?: string;
  publishedDate?: string;
}

/** Raw result from Google News RSS */
export interface NewsResult {
  title: string;
  url: string;
  pubDate: string;
  source: string;
}

/** Raw result from HackerNews Algolia API */
export interface HNResult {
  title: string;
  url: string;
  points: number;
  numComments: number;
  createdAt: string;
}
