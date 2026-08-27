import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { FALLBACK_LINE } from "@/lib/chatbotKnowledge";
import {
  CONCISENESS_LEVELS,
  DEFAULT_CONCISENESS,
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
import { maybeAlertOnContact } from "@/lib/notify";

/**
 * Visitor chat — SPEC-CHATBOT §2 (allowed server surface), §3 (transport),
 * §5 (logging), §6 (personality dials), §7 (validation, rate limits).
 */

const MODEL = "claude-opus-5";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** §3 — the server truncates to the most recent 20 messages before calling the API. */
const API_HISTORY_LIMIT = 20;

/**
 * §7 — worst-case reply cost. Raised from 1024 in v2.4: conciseness 0 and 25
 * ask for multi-paragraph answers, and 1024 was measured against the terse
 * style that preceded the dial. The daily cap dropped 500 to 300 in the same
 * change, so the worst-case daily spend stays flat rather than doubling.
 */
const MAX_TOKENS = 2048;

/**
 * §7 — what a visitor sees when a reply hits that ceiling. Deliberately not
 * the fallback line: that sentence means "this is not in the notes", and §8
 * counts it to find content gaps, so reusing it here would file a truncation
 * as a missing-content report. Fail loud in the visitor's direction too, since
 * ending mid-sentence just reads as the bot losing its train of thought.
 */
const TRUNCATION_NOTE =
  "\n\n(That answer hit its length limit and stopped early. Ask me to continue, or narrow the question.)";

/**
 * §7 — request validation limits. Two constants because there are two threat
 * models, and collapsing them into one is what broke multi-turn chat:
 * `message` is what a visitor typed, and the textarea's `maxLength` matches
 * it, while a `history` entry is what *this bot* wrote on an earlier turn and
 * the client is echoing back. A reply may run the whole `MAX_TOKENS` budget,
 * so measuring it against the typed-input limit rejected every conversation
 * whose previous reply ran long, which is most of them (measured on prod
 * 2026-08-27: 1,486 chars at conciseness 75 and 4,527 at 0, against a 1,000
 * cap, so only conciseness 100 survived a second turn).
 */
const MAX_MESSAGE_CHARS = 1_000;
const MAX_HISTORY_ENTRY_CHARS = 10_000;
const MAX_HISTORY_ENTRIES = 30;
/** §6 — bounds the page-context prefix; the longest real title is far below it. */
const MAX_PROJECT_TITLE_CHARS = 120;

/**
 * §7 — the cost fuse on replayed context. `history` arrives from the client on
 * a public route, so nothing stops a crafted request from filling every entry;
 * the entry-count limit bounds how many entries there are, never how large
 * they are, so this budget is what actually bounds the input tokens billed.
 * It is enforced by trimming rather than by a 400, because history is context
 * rather than intent: a visitor cannot repair an oversized transcript, and
 * rejecting it would wedge the thread until they cleared session storage.
 */
const MAX_HISTORY_CHARS = 18_000;

const historyEntrySchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(MAX_HISTORY_ENTRY_CHARS),
  })
  .strict();

type HistoryEntry = z.infer<typeof historyEntrySchema>;

/**
 * §3 — the conversation window actually sent to the model.
 *
 * Trims oldest-first until the transcript fits both the character budget and
 * the message limit, then drops a leading assistant turn: the Messages API
 * requires the window to open on a user turn, and trimming an alternating
 * transcript to an even length lands on an assistant turn half the time. The
 * visitor's current message is never a trim candidate, because it is the
 * request rather than context for it.
 */
function windowForApi(
  history: readonly HistoryEntry[],
  message: string,
): HistoryEntry[] {
  const kept: HistoryEntry[] = [];
  let chars = 0;
  // Backwards: the most recent context is the context worth keeping.
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const entry = history[i];
    if (kept.length >= API_HISTORY_LIMIT - 1) break;
    if (chars + entry.content.length > MAX_HISTORY_CHARS) break;
    chars += entry.content.length;
    kept.push(entry);
  }
  kept.reverse();
  while (kept.length > 0 && kept[0].role === "assistant") {
    kept.shift();
  }
  return [...kept, { role: "user", content: message }];
}

const chatRequestSchema = z
  .object({
    sessionId: z.uuid(),
    message: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
    history: z.array(historyEntrySchema).max(MAX_HISTORY_ENTRIES).default([]),
    /** §5 — the page the chat was opened on. Recorded once per session. */
    entryPath: z.string().max(512).optional(),
    /**
     * §6 — the case study the visitor is reading, when they are on one. The
     * panel used to prepend this to `message` itself, which quietly spent the
     * visitor's own 1,000-char budget on server-added text: a question over
     * roughly 945 chars on a project page became a 400 even though the
     * textarea had accepted it. The title travels in its own field so
     * `message` means one thing, the visitor's typed text, and the prefix is
     * composed below where its cost is the server's to account for.
     */
    projectTitle: z
      .string()
      .trim()
      .min(1)
      .max(MAX_PROJECT_TITLE_CHARS)
      .optional(),
    /**
     * §6 — the two adjustable dials. Only the five steps are accepted, so a
     * hand-edited value is a 400 rather than something to sanitize downstream.
     * Honesty is never sent: it is a server-side constant, which is exactly
     * what stops a crafted request from turning it down.
     */
    humor: z.literal(HUMOR_LEVELS).default(DEFAULT_HUMOR),
    conciseness: z.literal(CONCISENESS_LEVELS).default(DEFAULT_CONCISENESS),
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
  const { sessionId, message, entryPath, humor, conciseness, projectTitle } =
    parsed.data;

  // §6 — page context rides in the visitor's turn, never in `system`, so the
  // cached prefix stays byte-identical. Only the first turn carries it, and the
  // visitor never sees it. Composed here rather than in the panel so that the
  // 1,000-char limit on `message` measures only what the visitor typed; it is
  // the logged content as well, which keeps /study transcripts reading exactly
  // as they did before the field moved.
  const contextualMessage =
    parsed.data.history.length === 0 && projectTitle !== undefined
      ? `Visitor is currently reading the ${projectTitle} case study.\n\n${message}`
      : message;

  try {
    await ensureSession(db, {
      id: sessionId,
      entryPath: entryPath ?? null,
      referrer: request.headers.get("referer"),
      ipHash,
    });
    await logMessage(db, {
      sessionId,
      role: "user",
      content: contextualMessage,
    });
  } catch (error) {
    console.error("[api/chat] failed to log the user turn:", error);
    return jsonError("Could not record the conversation.", 503);
  }

  // 4b. §7 — contact-signal alert. Detection is a regex, so an ordinary turn
  // pays nothing. The send is awaited here rather than queued after the stream
  // closes because ending the chat cancels the response body, which aborts the
  // stream and skips anything left behind it: a visitor who types an address
  // and immediately closes the tab is exactly the lead worth not losing. The
  // extra round trip only lands on turns that actually matched, and the call
  // never throws.
  await maybeAlertOnContact(db, {
    sessionId,
    message,
    entryPath: entryPath ?? null,
  });

  // 5. Server-side truncation — regardless of what the client sent (§3).
  const conversation = windowForApi(parsed.data.history, contextualMessage);

  // §6 — the dials ride in a mid-conversation system turn rather than in
  // `system`, which is byte-frozen and carries the only cache breakpoint.
  // Measured: 324 uncached tokens per request while the
  // 10,808-token prefix still reads from cache in full; folding them into
  // the system prompt would forfeit that cache every request instead.
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
    { role: "system", content: personalityInstruction({ humor, conciseness }) },
  ];

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
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
        } else if (stopReason === "max_tokens") {
          reply += TRUNCATION_NOTE;
          controller.enqueue(encoder.encode(TRUNCATION_NOTE));
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
              conciseness,
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
