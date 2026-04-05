/**
 * Constants for the RAG pipeline: knowledge cutoffs, trust tiers, domain lists.
 */

// Knowledge cutoff dates per provider ID
// Verified across 2 rounds of testing with time-specific factual questions.
// Events tested: Super Bowl LVIII (Feb 24), GPT-4o (May 24), Claude 3.5 (Jun 24),
// Paris Olympics (Jul 24), CrowdStrike (Jul 24), US Election (Nov 24), DeepSeek R1 (Jan 25).
export const KNOWLEDGE_CUTOFFS: Record<string, string> = {
  claude: "~February 2025",     // knows everything through Jan 2025
  gemini: "~September 2024",    // knows Olympics (Jul 24), not election (Nov 24)
  gemma: "~August 2024",        // knows Olympics but hallucinates some details
  "groq-llama": "~December 2023",   // doesn't know anything from 2024
  "groq-qwen": "~July 2024",   // knows GPT-4o (May 24), not Claude 3.5 (Jun 24)
};

// TLD-based trust tiers (tier 1 = highest trust)
export const TRUST_TIER_1_TLDS = [".gov", ".edu", ".mil"];

// Curated high-authority domains (tier 2)
export const TRUST_TIER_2_DOMAINS = [
  // Major news agencies
  "reuters.com", "apnews.com", "bbc.co.uk", "bbc.com",
  "nytimes.com", "washingtonpost.com", "theguardian.com",
  "wsj.com", "ft.com", "bloomberg.com", "cnbc.com",
  "cnn.com", "npr.org", "pbs.org",
  // Academic / research
  "nature.com", "science.org", "arxiv.org", "pubmed.ncbi.nlm.nih.gov",
  "scholar.google.com", "ieee.org", "acm.org",
  // Major tech publications
  "techcrunch.com", "theverge.com", "arstechnica.com", "wired.com",
  // Reference
  "wikipedia.org", "britannica.com",
  // Major platforms (curated content)
  "github.com", "stackoverflow.com", "developer.mozilla.org",
];

// Well-known domains (tier 3)
export const TRUST_TIER_3_DOMAINS = [
  "medium.com", "substack.com", "dev.to", "hackernoon.com",
  "reddit.com", "news.ycombinator.com", "lobste.rs",
  "docs.google.com", "notion.so",
  "youtube.com", "twitch.tv",
];

// Source type detection patterns
export const SOURCE_TYPE_PATTERNS: Array<{ pattern: RegExp; type: "news" | "tech" | "academic" | "wiki" | "forum" }> = [
  { pattern: /wikipedia\.org/i, type: "wiki" },
  { pattern: /arxiv\.org|pubmed|nature\.com|science\.org|ieee\.org|acm\.org|scholar\.google/i, type: "academic" },
  { pattern: /reddit\.com|news\.ycombinator\.com|lobste\.rs|stackoverflow\.com|stackexchange\.com/i, type: "forum" },
  { pattern: /github\.com|dev\.to|hackernoon|medium\.com.*\/(programming|engineering|software)/i, type: "tech" },
  { pattern: /reuters|apnews|bbc\.(co\.uk|com)|nytimes|washingtonpost|theguardian|wsj\.com|bloomberg|cnbc|cnn|npr\.org|news\./i, type: "news" },
];
