/**
 * Claude provider — uses the official Anthropic SDK.
 *
 * Streams responses from Claude by listening for content_block_delta events
 * and yielding each text chunk as it arrives.
 */

import Anthropic from "@anthropic-ai/sdk";
import { Provider } from "./types";

const MODEL = "claude-sonnet-4-20250514";
const ENV_KEY = "ANTHROPIC_API_KEY";

export function createClaudeProvider(): Provider {
  const apiKey = process.env[ENV_KEY] ?? "";

  return {
    id: "claude",
    name: "Claude",
    color: "#d97706",
    model: MODEL,
    enabled: apiKey.length > 0,

    async *stream(prompt: string) {
      const client = new Anthropic({ apiKey });

      // The SDK returns a Stream object we can iterate over
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      });

      for await (const event of response) {
        // Each streamed event has a type — we only care about text deltas
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      }
    },
  };
}
