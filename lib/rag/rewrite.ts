/**
 * Query rewriting — transforms a user's natural language question
 * into 2-3 search-engine-optimized queries via Groq LLM.
 *
 * Includes today's date so relative time references resolve to actual dates.
 * Falls back to the original prompt on any failure.
 */

import OpenAI from "openai";

/**
 * Rewrite a user query into 2-3 optimized search queries.
 * Returns the original prompt wrapped in an array on any failure.
 */
export async function rewriteQueries(prompt: string): Promise<string[]> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return [prompt];

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

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
            content: `Generate 2-3 web search queries for this question. Make them specific and include dates where relevant. If the question uses relative time ("recently", "last month"), resolve to actual dates.

Today: ${today}
Question: ${prompt}

Output ONLY a JSON array of strings, nothing else.`,
          },
        ],
        max_tokens: 150,
        temperature: 0,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const content = response.choices[0]?.message?.content ?? "";

    // Try to parse as JSON array
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((q: unknown) => typeof q === "string")) {
        return parsed;
      }
    } catch {
      // JSON parse failed — try to extract array with regex
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const extracted = JSON.parse(match[0]);
          if (Array.isArray(extracted) && extracted.length > 0) {
            return extracted;
          }
        } catch {
          // Regex extraction also failed
        }
      }
    }

    return [prompt];
  } catch {
    return [prompt];
  }
}
