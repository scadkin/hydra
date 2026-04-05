/**
 * Gemini provider — uses the Google Generative AI SDK.
 *
 * Streams responses by calling generateContentStream() and yielding
 * each chunk's text as it arrives.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Provider, StreamOptions } from "./types";

const MODEL = "gemini-2.5-flash";
const ENV_KEY = "GOOGLE_AI_API_KEY";

export function createGeminiProvider(): Provider {
  const apiKey = process.env[ENV_KEY] ?? "";

  return {
    id: "gemini",
    name: "Gemini",
    color: "#4285f4",
    model: MODEL,
    enabled: apiKey.length > 0,

    async *stream(prompt: string, _options?: StreamOptions) {
      const client = new GoogleGenerativeAI(apiKey);
      const model = client.getGenerativeModel({ model: MODEL });

      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    },
  };
}
