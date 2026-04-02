/**
 * Shared types for LLM providers.
 *
 * ProviderInfo is the subset of data safe to send to the frontend (no keys, no stream fn).
 * Provider extends it with the runtime bits needed on the server.
 */

export interface ProviderInfo {
  id: string; // Unique identifier, e.g. "claude"
  name: string; // Display name, e.g. "Claude"
  color: string; // Brand color hex for UI
  model: string; // Model ID sent to the API
}

export interface Provider extends ProviderInfo {
  enabled: boolean; // true when the required API key is set in the environment
  stream: (prompt: string) => AsyncGenerator<string, void, unknown>;
}
