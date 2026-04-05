/**
 * In-memory usage tracker for LLM providers.
 *
 * Accumulates request counts and token estimates per provider.
 * Resets when the server restarts. Provides estimated costs based
 * on known pricing for each provider.
 */

interface ProviderUsage {
  requests: number;
  errors: number;
  totalChars: number; // Approximation — 1 token ≈ 4 chars
  lastUsed: string | null;
}

// Approximate cost per 1M output tokens (input is usually cheaper, but
// we track output chars only since that's what we stream back)
const COST_PER_1M_OUTPUT_TOKENS: Record<string, number> = {
  claude: 15.0, // Sonnet 4
  gemini: 0, // Free tier
  "groq-llama": 0, // Groq free tier
  "groq-qwen": 0, // Groq free tier
  gemma: 0, // Google AI free tier
};

const DASHBOARD_URLS: Record<string, string> = {
  claude: "https://console.anthropic.com/settings/billing",
  gemini: "https://aistudio.google.com/apikey",
  "groq-llama": "https://console.groq.com/settings/usage",
  "groq-qwen": "https://console.groq.com/settings/usage",
  gemma: "https://aistudio.google.com/apikey",
};

// In-memory store (resets on server restart)
const store: Record<string, ProviderUsage> = {};

function getOrCreate(providerId: string): ProviderUsage {
  if (!store[providerId]) {
    store[providerId] = {
      requests: 0,
      errors: 0,
      totalChars: 0,
      lastUsed: null,
    };
  }
  return store[providerId];
}

/** Call when a provider starts streaming */
export function trackRequest(providerId: string) {
  const usage = getOrCreate(providerId);
  usage.requests++;
  usage.lastUsed = new Date().toISOString();
}

/** Call when a provider finishes with the full response text */
export function trackCompletion(providerId: string, fullText: string) {
  const usage = getOrCreate(providerId);
  usage.totalChars += fullText.length;
}

/** Call when a provider errors */
export function trackError(providerId: string) {
  const usage = getOrCreate(providerId);
  usage.errors++;
}

/** Returns usage stats for all providers */
export function getUsageStats() {
  const stats = Object.entries(store).map(([id, usage]) => {
    const estimatedTokens = Math.round(usage.totalChars / 4);
    const costPer1M = COST_PER_1M_OUTPUT_TOKENS[id] ?? 0;
    const estimatedCost = (estimatedTokens / 1_000_000) * costPer1M;

    return {
      id,
      requests: usage.requests,
      errors: usage.errors,
      estimatedTokens,
      estimatedCost: Math.round(estimatedCost * 10000) / 10000, // 4 decimal places
      lastUsed: usage.lastUsed,
      dashboardUrl: DASHBOARD_URLS[id] ?? null,
      isFree: costPer1M === 0,
    };
  });

  return stats;
}
