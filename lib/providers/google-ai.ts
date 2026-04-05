/**
 * Factory for Google AI providers (Gemini, Gemma, etc.)
 *
 * Uses the Google Generative AI SDK. All models share the same
 * GOOGLE_AI_API_KEY and use generateContentStream() for streaming.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Provider, StreamOptions } from "./types";

interface GoogleAIProviderConfig {
  id: string;
  name: string;
  model: string;
  color: string;
}

export function createGoogleAIProvider(config: GoogleAIProviderConfig): Provider {
  const { id, name, model, color } = config;
  const apiKey = process.env.GOOGLE_AI_API_KEY ?? "";

  return {
    id,
    name,
    color,
    model,
    enabled: apiKey.length > 0,

    async *stream(prompt: string, _options?: StreamOptions) {
      const client = new GoogleGenerativeAI(apiKey);
      const genModel = client.getGenerativeModel({ model });

      const result = await genModel.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    },
  };
}
