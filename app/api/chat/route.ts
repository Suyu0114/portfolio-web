import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { FALLBACK_LINE } from "@/lib/chatbotKnowledge";
import { SYSTEM_PROMPT } from "@/lib/chatbotPrompt";
import { MissingEnvError, requireChatEnv } from "@/lib/env";

/**
 * Visitor chat — SPEC-CHATBOT §2 (allowed server surface), §3 (transport),
 * §7 (request validation).
 *
 * C0 scope: prove the streaming path end to end. Supabase logging (§5) and
 * rate limiting (§7) land in C3; the final system prompt (§4) lands in C1.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** §3 — the server truncates to the most recent 20 messages before calling the API. */
const API_HISTORY_LIMIT = 20;

/** §7 — request validation limits. */
const MAX_MESSAGE_CHARS = 1_000;
const MAX_HISTORY_ENTRIES = 30;

const historyEntrySchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
  })
  .strict();

const chatRequestSchema = z
  .object({
    sessionId: z.uuid(),
    message: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
    history: z.array(historyEntrySchema).max(MAX_HISTORY_ENTRIES).default([]),
  })
  .strict();

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  // 1. Body validation (§7). Runs before the env check so a malformed request
  // gets an accurate 400 rather than a misleading 500 about server config.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(z.prettifyError(parsed.error), 400);
  }

  // 2. Env — read at request time so `npm run build` passes with zero env vars (§2).
  let env;
  try {
    env = requireChatEnv();
  } catch (error) {
    if (error instanceof MissingEnvError) {
      console.error("[api/chat] env misconfigured:", error.message);
      return jsonError(error.message, 500);
    }
    throw error;
  }

  // 3. Server-side truncation — regardless of what the client sent (§3).
  const conversation = [
    ...parsed.data.history,
    { role: "user" as const, content: parsed.data.message },
  ].slice(-API_HISTORY_LIMIT);

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: "claude-opus-5",
    max_tokens: 1024,
    output_config: { effort: "low" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: conversation.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
  });

  const iterator = stream[Symbol.asyncIterator]();

  // Pull the first event before returning a Response. Auth, quota, and model
  // errors surface here as a real status code; once the body is streaming the
  // status is already committed and the only honest option is to fail the
  // stream (below).
  let first: IteratorResult<Anthropic.MessageStreamEvent>;
  try {
    first = await iterator.next();
  } catch (error) {
    const status = error instanceof Anthropic.APIError ? error.status : 502;
    console.error("[api/chat] Anthropic request failed:", error);
    return jsonError(
      error instanceof Error ? error.message : "Anthropic request failed.",
      typeof status === "number" ? status : 502,
    );
  }

  const encoder = new TextEncoder();

  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      let stopReason: Anthropic.StopReason | null = null;
      let emittedText = false;

      // Token usage. §5 persists these to chat_messages in C3; until then they
      // are logged so cost and cache-hit rate are observable.
      const usage = {
        inputTokens: 0,
        outputTokens: 0,
        cacheWriteTokens: 0,
        cacheReadTokens: 0,
      };

      const handle = (event: Anthropic.MessageStreamEvent): void => {
        // Only visible text reaches the visitor. Thinking deltas are never
        // forwarded (Opus 5 runs adaptive thinking by default).
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          if (event.delta.text.length > 0) {
            emittedText = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        } else if (event.type === "message_start") {
          const u = event.message.usage;
          usage.inputTokens = u.input_tokens;
          usage.cacheWriteTokens = u.cache_creation_input_tokens ?? 0;
          usage.cacheReadTokens = u.cache_read_input_tokens ?? 0;
        } else if (event.type === "message_delta") {
          stopReason = event.delta.stop_reason;
          usage.outputTokens = event.usage.output_tokens;
        }
      };

      try {
        if (!first.done) {
          handle(first.value);
        }
        while (true) {
          const next = await iterator.next();
          if (next.done) break;
          handle(next.value);
        }

        // §3 — check stop_reason before trusting the content. A refusal gets
        // the standardized fallback line, never a fabricated answer.
        if (stopReason === "refusal") {
          controller.enqueue(
            encoder.encode((emittedText ? "\n\n" : "") + FALLBACK_LINE),
          );
        }
        console.log(
          `[api/chat] stop=${stopReason} in=${usage.inputTokens} out=${usage.outputTokens} ` +
            `cache_write=${usage.cacheWriteTokens} cache_read=${usage.cacheReadTokens}`,
        );
        controller.close();
      } catch (error) {
        // Fail loud: the status is already sent, so surface it in the server
        // log and abort the body rather than closing on a truncated reply.
        console.error("[api/chat] stream failed:", error);
        controller.error(error);
      }
    },
    async cancel() {
      await stream.abort();
    },
  });

  return new Response(body$, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      // Discourage intermediary buffering so deltas flush incrementally.
      "X-Accel-Buffering": "no",
    },
  });
}
