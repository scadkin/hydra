/**
 * Query classification — determines if a query needs web search
 * and what focus mode to use.
 *
 * Tier 1: Regex heuristics (instant, no API call)
 * Tier 2: LLM fallback via Groq for ambiguous queries (~200ms)
 */

import OpenAI from "openai";
import { ClassificationResult } from "./types";

type Focus = ClassificationResult["focus"];

// --- Tier 1: Regex patterns ---

const DEFINITELY_SEARCH: Array<{ pattern: RegExp; focus: Focus }> = [
  // Temporal markers
  { pattern: /\b(today|tonight|yesterday|this week|this month|this year|right now|breaking)\b/i, focus: "news" },
  { pattern: /\b(latest|newest|most recent|current|up.?to.?date|just (released|announced|launched))\b/i, focus: "news" },
  { pattern: /\b20(2[4-9]|[3-9]\d)\b/, focus: "general" }, // Years 2024-2099
  // News / events
  { pattern: /\b(news|update on|what happened|who won|who died|election|scandal|crisis)\b/i, focus: "news" },
  { pattern: /\b(stock price|market cap|earnings|revenue|ipo|quarterly)\b/i, focus: "news" },
  { pattern: /\b(weather|forecast|temperature)\b/i, focus: "general" },
  { pattern: /\b(score|standings|playoff|championship|super bowl|world cup|olympics)\b/i, focus: "news" },
  // Tech-specific currentness
  { pattern: /\b(best .+ (framework|library|tool|app|software)|vs\.?|versus|comparison|benchmark)\b/i, focus: "tech" },
  { pattern: /\b(release|version|update|changelog|deprecated|end.?of.?life)\b.*\b(20[2-9]\d)\b/i, focus: "tech" },
  // Explicit recency
  { pattern: /\b(how much does|price of|cost of|salary|pay)\b/i, focus: "general" },
  // URLs in query
  { pattern: /https?:\/\//, focus: "general" },
];

const DEFINITELY_NO_SEARCH: RegExp[] = [
  /^(write|compose|create|generate|make|draft)\s+(me\s+)?(a|an|the|some)\b/i,
  /^(explain|describe|what is|what are|how does|how do)\s+(the\s+)?(concept|theory|meaning|definition|difference between)\b/i,
  /^(code|implement|refactor|debug|fix|build|design)\s/i,
  /^(translate|convert)\s/i,
  /^(calculate|compute|solve|what is \d|how many|if .+ then)\b/i,
  /^(tell me a|write a|give me a)\s+(joke|story|poem|song|essay|haiku|limerick)/i,
  /^(summarize|rewrite|paraphrase|simplify|expand)\s/i,
  /^(help me|can you|please)\s+(write|code|create|build|make|design|explain)\b/i,
];

// Focus detection for queries that pass through to Tier 2
const FOCUS_HINTS: Array<{ pattern: RegExp; focus: Focus }> = [
  { pattern: /\b(react|vue|angular|next\.?js|node|python|rust|go|java|typescript|api|sdk|npm|pip|cargo|docker|kubernetes|aws|gcp|azure)\b/i, focus: "tech" },
  { pattern: /\b(paper|study|research|journal|peer.?review|meta.?analysis|clinical trial)\b/i, focus: "academic" },
  { pattern: /\b(breaking|headline|report|coverage|press|media|journalist)\b/i, focus: "news" },
];

/**
 * Classify a query: should we search the web? What focus mode?
 * Returns in <300ms worst case (Groq LLM call has 2s timeout).
 */
export async function classifyQuery(prompt: string): Promise<ClassificationResult> {
  // Tier 1: Check definite-search patterns
  for (const { pattern, focus } of DEFINITELY_SEARCH) {
    if (pattern.test(prompt)) {
      return { needsSearch: true, confidence: 0.9, focus };
    }
  }

  // Tier 1: Check definite-no-search patterns
  for (const pattern of DEFINITELY_NO_SEARCH) {
    if (pattern.test(prompt)) {
      return { needsSearch: false, confidence: 0.9, focus: "general" };
    }
  }

  // Detect focus hint even if search decision is ambiguous
  let hintedFocus: Focus = "general";
  for (const { pattern, focus } of FOCUS_HINTS) {
    if (pattern.test(prompt)) {
      hintedFocus = focus;
      break;
    }
  }

  // Tier 2: Ambiguous — ask the LLM
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    // No Groq key — default to searching (safer)
    return { needsSearch: true, confidence: 0.5, focus: hintedFocus };
  }

  try {
    const client = new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await client.chat.completions.create(
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Does this question require current/real-time web information to answer accurately? Reply with exactly one word: YES or NO.\n\nQuestion: ${prompt}`,
          },
        ],
        max_tokens: 3,
        temperature: 0,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const answer = (response.choices[0]?.message?.content ?? "").trim().toUpperCase();
    const needsSearch = answer.startsWith("YES");

    return { needsSearch, confidence: 0.7, focus: hintedFocus };
  } catch {
    // LLM failed — default to searching (safer than missing context)
    return { needsSearch: true, confidence: 0.4, focus: hintedFocus };
  }
}
