/**
 * Provider registry — the single source of truth for all LLM providers.
 *
 * Each provider is constructed here with its config. The two exported helpers
 * let the rest of the app either list provider metadata (for the UI) or grab
 * the live, streamable provider objects (for the API route).
 */

import { Provider, ProviderInfo } from "./types";
import { createClaudeProvider } from "./claude";
import { createGeminiProvider } from "./gemini";
import { createOpenAIProvider } from "./openai-compatible";

// ---------------------------------------------------------------------------
// Build every provider once at module load
// ---------------------------------------------------------------------------

function buildProviders(): Provider[] {
  return [
    // Native SDK providers
    createClaudeProvider(),
    createGeminiProvider(),

    // OpenAI-compatible providers (direct APIs)
    createOpenAIProvider({
      id: "grok",
      name: "Grok",
      model: "grok-3",
      color: "#1d9bf0",
      apiKey: process.env.XAI_API_KEY ?? "",
      baseURL: "https://api.x.ai/v1",
    }),
    createOpenAIProvider({
      id: "deepseek",
      name: "DeepSeek",
      model: "deepseek-chat",
      color: "#4f6df5",
      apiKey: process.env.DEEPSEEK_API_KEY ?? "",
      baseURL: "https://api.deepseek.com",
    }),

    // OpenRouter providers (free-tier models)
    createOpenAIProvider({
      id: "openrouter-llama",
      name: "Llama",
      model: "meta-llama/llama-4-maverick:free",
      color: "#764abc",
      apiKey: process.env.OPENROUTER_API_KEY ?? "",
      baseURL: "https://openrouter.ai/api/v1",
    }),
    createOpenAIProvider({
      id: "openrouter-qwen",
      name: "Qwen",
      model: "qwen/qwen3-235b:free",
      color: "#06b6d4",
      apiKey: process.env.OPENROUTER_API_KEY ?? "",
      baseURL: "https://openrouter.ai/api/v1",
    }),
    createOpenAIProvider({
      id: "openrouter-deepseek-r1",
      name: "DeepSeek R1",
      model: "deepseek/deepseek-r1:free",
      color: "#10b981",
      apiKey: process.env.OPENROUTER_API_KEY ?? "",
      baseURL: "https://openrouter.ai/api/v1",
    }),
  ];
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Returns public info for every provider (safe to send to the browser).
 */
export function getAllProviders(): ProviderInfo[] {
  return buildProviders().map(({ id, name, color, model }) => ({
    id,
    name,
    color,
    model,
  }));
}

/**
 * Returns only providers whose API key is set, optionally filtered by ID.
 * This is what the streaming API route uses to kick off parallel requests.
 */
export function getActiveProviders(filterIds?: string[]): Provider[] {
  let providers = buildProviders().filter((p) => p.enabled);

  if (filterIds && filterIds.length > 0) {
    providers = providers.filter((p) => filterIds.includes(p.id));
  }

  return providers;
}
