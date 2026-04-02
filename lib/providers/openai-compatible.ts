/**
 * Factory for OpenAI-compatible providers.
 *
 * Many LLM APIs (Grok, DeepSeek, OpenRouter) follow the OpenAI chat-completions
 * spec, so we can use the official `openai` SDK pointed at a custom baseURL.
 */

import OpenAI from "openai";
import { Provider } from "./types";

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

    async *stream(prompt: string) {
      const client = new OpenAI({ apiKey, baseURL });

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      });

      // The SDK returns an async iterable of chunk objects
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    },
  };
}
