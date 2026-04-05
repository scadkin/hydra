/**
 * Factory for OpenAI-compatible providers.
 *
 * Many LLM APIs (Grok, DeepSeek, OpenRouter) follow the OpenAI chat-completions
 * spec, so we can use the official `openai` SDK pointed at a custom baseURL.
 */

import OpenAI from "openai";
import { Provider, StreamOptions } from "./types";

interface OpenAIProviderConfig {
  id: string;
  name: string;
  model: string;
  color: string;
  apiKey: string;
  baseURL: string;
}

export function createOpenAIProvider(config: OpenAIProviderConfig): Provider {
  const { id, name, model, color, apiKey, baseURL } = config;

  return {
    id,
    name,
    color,
    model,
    enabled: apiKey.length > 0,

    async *stream(prompt: string, options?: StreamOptions) {
      const client = new OpenAI({ apiKey, baseURL });

      // Build messages array — prepend system message if RAG context provided
      const messages: Array<{ role: "system" | "user"; content: string }> = [];
      if (options?.systemMessage) {
        messages.push({ role: "system", content: options.systemMessage });
      }
      messages.push({ role: "user", content: prompt });

      const response = await client.chat.completions.create({
        model,
        messages,
        stream: true,
      });

      // Track whether we're inside a <think>...</think> block (reasoning models
      // like Qwen 3 emit their chain-of-thought in these tags before the answer)
      let insideThink = false;
      let buffer = "";

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content;
        if (!content) continue;

        buffer += content;

        // Strip <think>...</think> blocks from the output
        while (true) {
          if (!insideThink) {
            const openIdx = buffer.indexOf("<think>");
            if (openIdx === -1) {
              // No think tag — yield whatever we have
              if (buffer) {
                yield buffer;
                buffer = "";
              }
              break;
            }
            // Yield everything before the think tag
            if (openIdx > 0) {
              yield buffer.slice(0, openIdx);
            }
            buffer = buffer.slice(openIdx + 7); // skip "<think>"
            insideThink = true;
          }

          if (insideThink) {
            const closeIdx = buffer.indexOf("</think>");
            if (closeIdx === -1) {
              // Still inside think block — discard and wait for more
              buffer = "";
              break;
            }
            // Skip past the closing tag
            buffer = buffer.slice(closeIdx + 8);
            insideThink = false;
          }
        }
      }

      // Yield any remaining buffer after stream ends
      if (buffer && !insideThink) {
        yield buffer;
      }
    },
  };
}
