/**
 * POST /api/query
 *
 * Accepts a prompt (and optional provider filter), streams responses from
 * all active LLM providers in parallel using Server-Sent Events (SSE).
 *
 * Each SSE message is a JSON object with:
 *   - provider: the provider's id
 *   - name:     the provider's display name
 *   - type:     "chunk" | "done" | "error"
 *   - text / fullText / error: the payload
 */

import { getActiveProviders } from "@/lib/providers";
import { Provider } from "@/lib/providers/types";

const TIMEOUT_MS = 60_000; // 60 seconds per provider

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, providers: filterIds } = body as {
    prompt: string;
    providers?: string[];
  };

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const activeProviders = getActiveProviders(filterIds);

  if (activeProviders.length === 0) {
    return Response.json(
      { error: "No active providers. Set at least one API key." },
      { status: 400 }
    );
  }

  // --- Set up the SSE stream ---
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  /**
   * Helper to write a single SSE message to the stream.
   */
  function send(data: Record<string, unknown>) {
    return writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  }

  /**
   * Streams one provider's response, accumulating the full text along the way.
   * Wrapped in a timeout so a slow provider can't block the stream forever.
   */
  async function streamProvider(provider: Provider) {
    // The actual streaming work
    const work = async () => {
      let fullText = "";

      try {
        for await (const chunk of provider.stream(prompt)) {
          fullText += chunk;
          await send({
            provider: provider.id,
            name: provider.name,
            type: "chunk",
            text: chunk,
          });
        }

        await send({
          provider: provider.id,
          name: provider.name,
          type: "done",
          fullText,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await send({
          provider: provider.id,
          name: provider.name,
          type: "error",
          error: message,
        });
      }
    };

    // Race the work against a 60-second timeout
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timed out after 60 seconds")), TIMEOUT_MS)
    );

    try {
      await Promise.race([work(), timeout]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await send({
        provider: provider.id,
        name: provider.name,
        type: "error",
        error: message,
      });
    }
  }

  // --- Launch all providers in parallel, then close the stream ---
  // We don't await this — the response starts streaming immediately.
  (async () => {
    const tasks = activeProviders.map((provider) => streamProvider(provider));
    await Promise.allSettled(tasks);
    await writer.close();
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
