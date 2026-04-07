/**
 * POST /api/merge
 *
 * Takes the original prompt + multiple LLM responses and synthesizes them
 * into a single "super response" using Claude. Streams the result via SSE.
 *
 * SSE events:
 *   - type: "chunk" — streaming text
 *   - type: "done"  — merge complete
 *   - type: "error" — merge failed
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-20250514";

interface MergeInput {
  name: string;
  text: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, responses } = body as {
    prompt: string;
    responses: MergeInput[];
  };

  if (!prompt || !responses || responses.length === 0) {
    return Response.json(
      { error: "prompt and responses are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) {
    return Response.json(
      { error: "Claude API key not configured" },
      { status: 500 }
    );
  }

  // Build the merge prompt with all responses
  const responsesBlock = responses
    .map((r, i) => `<response model="${r.name}" index="${i + 1}">\n${r.text}\n</response>`)
    .join("\n\n");

  const systemMessage = `You are a synthesis expert. The user asked a question to ${responses.length} different AI models. Your job is to merge their responses into one comprehensive, well-structured answer.

Guidelines:
- Combine the best insights from all responses into a single cohesive answer
- Where models agree, state the consensus clearly
- Where models disagree, note the different perspectives
- Remove redundancy — don't repeat the same point from multiple models
- Use clear structure (headings, bullet points) when the content warrants it
- Credit specific models by name only when they offer a uniquely different take
- Keep the tone informative and direct
- Do NOT mention that you are merging responses or explain your process`;

  const userMessage = `Original question: ${prompt}

Here are the responses from ${responses.length} AI models:

${responsesBlock}

Synthesize these into one comprehensive answer.`;

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  function send(data: Record<string, unknown>) {
    return writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  }

  (async () => {
    try {
      const client = new Anthropic({ apiKey });
      let fullText = "";

      const stream = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        stream: true,
        system: systemMessage,
        messages: [{ role: "user", content: userMessage }],
      });

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          fullText += event.delta.text;
          await send({ type: "chunk", text: event.delta.text });
        }
      }

      await send({ type: "done", fullText });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await send({ type: "error", error: message });
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
