/**
 * Provider registry — the single source of truth for all LLM providers.
 *
 * Each provider is constructed here with its config. The two exported helpers
 * let the rest of the app either list provider metadata (for the UI) or grab
 * the live, streamable provider objects (for the API route).
 */

import { Provider, ProviderInfo } from "./types";
import { createClaudeProvider } from "./claude";
import { createGoogleAIProvider } from "./google-ai";
import { createOpenAIProvider } from "./openai-compatible";

// ---------------------------------------------------------------------------
// Build every provider once at module load
// ---------------------------------------------------------------------------

function buildProviders(): Provider[] {
  return [
    // Native SDK providers
    createClaudeProvider(),
    createGoogleAIProvider({
      id: "gemini",
      name: "Gemini",
      model: "gemini-2.5-flash",
      color: "#4285f4",
    }),
    createGoogleAIProvider({
      id: "gemma",
      name: "Gemma 3",
      model: "gemma-3-27b-it",
      color: "#4ecdc4",
    }),

    // Groq providers (free tier, fast inference, OpenAI-compatible)
    createOpenAIProvider({
      id: "groq-llama",
      name: "Llama 3.3",
      model: "llama-3.3-70b-versatile",
      color: "#764abc",
      apiKey: process.env.GROQ_API_KEY ?? "",
      baseURL: "https://api.groq.com/openai/v1",
    }),
    createOpenAIProvider({
      id: "groq-qwen",
      name: "Qwen 3",
      model: "qwen/qwen3-32b",
      color: "#06b6d4",
      apiKey: process.env.GROQ_API_KEY ?? "",
      baseURL: "https://api.groq.com/openai/v1",
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
