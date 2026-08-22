import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { FALLBACK_LINE } from "@/lib/chatbotKnowledge";
import {
  DEFAULT_HUMOR,
  HUMOR_LEVELS,
  personalityInstruction,
} from "@/lib/chatPersonality";
import { SYSTEM_PROMPT } from "@/lib/chatbotPrompt";
import {
  checkRateLimits,
  clientIpFrom,
  createChatClient,
  ensureSession,
  hashIp,
  logMessage,
} from "@/lib/chatStore";
import { MissingEnvError, requireChatEnv } from "@/lib/env";

/**
 * Visitor chat — SPEC-CHATBOT §2 (allowed server surface), §3 (transport),
 * §5 (logging), §6 (personality dials), §7 (validation, rate limits).
 */

const MODEL = "claude-opus-5";

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
    /** §5 — the page the chat was opened on. Recorded once per session. */
    entryPath: z.string().max(512).optional(),
    /**
     * §6 — the humor dial. Only the five steps are accepted, so a hand-edited
     * value is a 400 rather than something to sanitize downstream. Honesty is
     * never sent: it is a server-side constant, which is exactly what stops a
     * crafted request from turning it down.
     */
    humor: z.literal(HUMOR_LEVELS).default(DEFAULT_HUMOR),
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

  // 3. Rate limits (§7) — before any spend. Both checks are Supabase-backed
  // (D4). A failure here is fatal, never a pass: these limits are the cost
  // control, so "could not check" must not mean "go ahead".
  const db = createChatClient(env);
  const ipHash = hashIp(
    clientIpFrom(request.headers),
    env.ADMIN_COOKIE_SECRET,
  );

  try {
    const verdict = await checkRateLimits(db, ipHash);
    if (!verdict.allowed) {
      console.warn(`[api/chat] limit hit: ${verdict.reason}`);
      return jsonError(`Rate limit reached (${verdict.reason}).`, 429);
    }
  } catch (error) {
    console.error("[api/chat] rate-limit check failed:", error);
    return jsonError("Could not verify rate limits.", 503);
  }

  // 4. Record the session and the visitor's turn (§5) before calling the model,
  // so the per-IP window counts this request even if the reply later fails.
  const { sessionId, message, entryPath, humor } = parsed.data;
  try {
    await ensureSession(db, {
      id: sessionId,
      entryPath: entryPath ?? null,
      referrer: request.headers.get("referer"),
      ipHash,
    });
    await logMessage(db, { sessionId, role: "user", content: message });
  } catch (error) {
    console.error("[api/chat] failed to log the user turn:", error);
    return jsonError("Could not record the conversation.", 503);
  }

  // 5. Server-side truncation — regardless of what the client sent (§3).
  const conversation = [
    ...parsed.data.history,
    { role: "user" as const, content: message },
  ].slice(-API_HISTORY_LIMIT);

  // §6 — the dial rides in a mid-conversation system turn rather than in
  // `system`, which is byte-frozen and carries the only cache breakpoint.
  // Measured: 207 uncached tokens per request while the 10,445-token prefix
  // still reads from cache in full; folding it into the system prompt would
  // forfeit that cache every request instead.
  //
  // Appended *after* truncation, so a long conversation can never slide the
  // instruction out of the window. Its placement satisfies the API's rules by
  // construction: `conversation` always ends with the visitor's turn, so this
  // follows a user message and is last.
  const messages: Anthropic.MessageParam[] = [
    ...conversation.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
    { role: "system", content: personalityInstruction(humor) },
  ];

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    output_config: { effort: "low" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
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
      let reply = "";

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
            reply += event.delta.text;
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
          const line = (emittedText ? "\n\n" : "") + FALLBACK_LINE;
          reply += line;
          controller.enqueue(encoder.encode(line));
        }
        console.log(
          `[api/chat] stop=${stopReason} in=${usage.inputTokens} out=${usage.outputTokens} ` +
            `cache_write=${usage.cacheWriteTokens} cache_read=${usage.cacheReadTokens}`,
        );
        controller.close();

        // §5 — log the assistant turn with its token usage. This runs after
        // close() because the reply is already delivered; a logging failure
        // must be loud in the server log but cannot un-send the response, and
        // must not corrupt a stream the visitor has already read.
        try {
          if (reply !== "") {
            await logMessage(db, {
              sessionId,
              role: "assistant",
              content: reply,
              model: MODEL,
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              humor,
            });
          }
        } catch (error) {
          console.error("[api/chat] failed to log the assistant turn:", error);
        }
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
