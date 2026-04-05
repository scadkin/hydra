/**
 * POST /api/query
 *
 * Accepts a prompt (and optional provider filter), runs the RAG pipeline
 * for web search augmentation, then streams responses from all active LLM
 * providers in parallel using Server-Sent Events (SSE).
 *
 * SSE event types:
 *   - type: "sources"  — search sources used for RAG context
 *   - type: "meta"     — metadata like knowledge cutoff dates
 *   - type: "chunk"    — streaming text from a provider
 *   - type: "done"     — provider finished streaming
 *   - type: "error"    — provider error
 */

import { getActiveProviders } from "@/lib/providers";
import { Provider } from "@/lib/providers/types";
import { trackRequest, trackCompletion, trackError } from "@/lib/usage";
import { runRAGPipeline } from "@/lib/rag";
import { KNOWLEDGE_CUTOFFS } from "@/lib/rag/constants";

const TIMEOUT_MS = 60_000; // 60 seconds per provider

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, providers: filterIds, webSearch = true } = body as {
    prompt: string;
    providers?: string[];
    webSearch?: boolean;
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

  function send(data: Record<string, unknown>) {
    return writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  }

  /**
   * Streams one provider's response with optional RAG context.
   */
  async function streamProvider(
    provider: Provider,
    effectivePrompt: string,
    systemMessage?: string
  ) {
    const work = async () => {
      let fullText = "";
      trackRequest(provider.id);

      try {
        const options = systemMessage ? { systemMessage } : undefined;
        for await (const chunk of provider.stream(effectivePrompt, options)) {
          fullText += chunk;
          await send({
            provider: provider.id,
            name: provider.name,
            type: "chunk",
            text: chunk,
          });
        }

        trackCompletion(provider.id, fullText);
        await send({
          provider: provider.id,
          name: provider.name,
          type: "done",
          fullText,
        });
      } catch (err) {
        trackError(provider.id);
        const message = err instanceof Error ? err.message : String(err);
        await send({
          provider: provider.id,
          name: provider.name,
          type: "error",
          error: message,
        });
      }
    };

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

  // --- Run RAG pipeline, then launch providers ---
  (async () => {
    // Step 1: Run the RAG pipeline (classify, rewrite, search, process)
    const ragContext = await runRAGPipeline(prompt, webSearch);

    // Step 2: Emit sources (so the UI can show them before LLM responses arrive)
    if (ragContext.searchPerformed && ragContext.sources.length > 0) {
      await send({ type: "sources", sources: ragContext.sources });
    }

    // Step 3: Emit knowledge cutoff metadata for active providers
    const cutoffs: Record<string, string> = {};
    for (const p of activeProviders) {
      if (KNOWLEDGE_CUTOFFS[p.id]) {
        cutoffs[p.id] = KNOWLEDGE_CUTOFFS[p.id];
      }
    }
    await send({ type: "meta", cutoffs });

    // Step 4: Fan out to all providers with appropriate prompt/context
    const tasks = activeProviders.map((provider) => {
      // Google AI providers (Gemini, Gemma) don't support system messages —
      // use the augmented prompt with context prepended
      if (provider.id === "gemini" || provider.id === "gemma") {
        return streamProvider(provider, ragContext.augmentedPrompt);
      }

      // All other providers: use raw prompt + system message
      return streamProvider(
        provider,
        ragContext.rawPrompt,
        ragContext.systemMessage || undefined
      );
    });

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
