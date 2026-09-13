import { APIError } from "@anthropic-ai/sdk";
import { after } from "next/server";
import { z } from "zod";
import {
  canonicalizeFallbackLine,
  FALLBACK_LINE,
} from "@/lib/chatbotKnowledge";
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
import {
  FALLBACK_REASON_HEADER,
  type ChatErrorCode,
  type FallbackReason,
} from "@/lib/chatErrors";
import type {
  ChatProvider,
  ChatRequest,
  ChatStream,
  StopReason,
} from "@/lib/chatProvider";
import { anthropicProvider } from "@/lib/providers/anthropic";
import { geminiProvider } from "@/lib/providers/gemini";
import {
  MissingEnvError,
  readFallbackEnv,
  readForcedProvider,
  requireChatEnv,
} from "@/lib/env";
import { maybeAlertOnContact } from "@/lib/notify";

/**
 * Visitor chat — SPEC-CHATBOT §2 (allowed server surface), §3 (transport and
 * provider fallback), §5 (logging), §6 (personality dials), §7 (validation,
 * rate limits, upstream failure classification).
 */

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
 *
 * v2.8 routes an *unexplained* provider stop here as well, for the same
 * reason: it is not a gap in the notes either.
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

/**
 * §7 — the error contract. `code` is required rather than optional so the
 * compiler forces every call site to declare which failure this is. The panel
 * chooses its copy from the code and never renders `message`, which is
 * developer-facing.
 */
function jsonError(
  message: string,
  status: number,
  code: ChatErrorCode,
): Response {
  return Response.json({ error: message, code }, { status });
}

type UpstreamFailure = {
  status: number;
  code: ChatErrorCode;
  message: string;
};

/**
 * §7 — the credit test.
 *
 * Anthropic's SDK defines a `billing_error` type, but the live API returns
 * HTTP 400 with `invalid_request_error` and states the balance only in prose
 * (probed 2026-09-09), so both are checked. The haystack is `error.message`
 * because the SDK composes that from the whole response body whenever the body
 * has no top-level `message`, which Anthropic's envelope does not, so the
 * phrase is reachable whether it arrives nested or flattened.
 */
const CREDIT_SIGNAL =
  /credit balance|insufficient (?:credits?|funds)|purchase credits/i;

function isCreditExhausted(
  error: APIError,
  outgoing: readonly HistoryEntry[],
): boolean {
  if (error.type === "billing_error") return true;
  if (error.status !== 400) return false;
  // A 400 that quotes our own request back at us must never read as a billing
  // failure. Without this, a visitor could type "credit balance", provoke a
  // validation error that echoes it, and make PATS announce that Suyu is out
  // of money: a rule 1 breach anyone could trigger on demand.
  if (outgoing.some((turn) => CREDIT_SIGNAL.test(turn.content))) return false;
  return CREDIT_SIGNAL.test(error.message);
}

/**
 * §7 — turns a provider failure into an honest status and a code.
 *
 * Never forwards the provider's status: a 400 from Anthropic means *this
 * server* sent something it disliked, so repeating it blames the visitor for a
 * request they cannot fix, and it collides with this route's own two real
 * 400s. Never forwards the provider's message either, since the SDK builds
 * that from the raw upstream body. The full error goes to the server log.
 */
function classifyUpstream(
  error: unknown,
  outgoing: readonly HistoryEntry[],
): UpstreamFailure {
  if (!(error instanceof APIError)) {
    return {
      status: 502,
      code: "upstream_error",
      message: "The model call failed.",
    };
  }
  if (isCreditExhausted(error, outgoing)) {
    return {
      status: 503,
      code: "upstream_credit",
      message: "The model account is out of credit.",
    };
  }
  const status = error.status;
  // APIConnectionError and APIConnectionTimeoutError are APIErrors with no status.
  if (typeof status !== "number") {
    return {
      status: 504,
      code: "upstream_error",
      message: "Could not reach the model.",
    };
  }
  if (status === 401 || status === 403) {
    // Same class as MissingEnvError below: a key that is present but rejected
    // is a server misconfiguration, so it gets the same 500.
    return {
      status: 500,
      code: "upstream_auth",
      message: "The model credentials were rejected.",
    };
  }
  if (status === 429 || status === 529 || error.type === "overloaded_error") {
    // Deliberately NOT 429. This route's 429 means the site's own fuse (§7),
    // and forwarding an upstream throttle there is what made a provider hiccup
    // render to the visitor as "the notebook is resting, back tomorrow".
    return {
      status: 503,
      code: "upstream_busy",
      message: "The model is busy.",
    };
  }
  return {
    status: 502,
    code: "upstream_error",
    message: "The model call failed.",
  };
}

export async function POST(request: Request): Promise<Response> {
  // 1. Body validation (§7). Runs before the env check so a malformed request
  // gets an accurate 400 rather than a misleading 500 about server config.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400, "bad_request");
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(z.prettifyError(parsed.error), 400, "bad_request");
  }

  // 2. Env — read at request time so `npm run build` passes with zero env vars (§2).
  let env;
  try {
    env = requireChatEnv();
  } catch (error) {
    if (error instanceof MissingEnvError) {
      console.error("[api/chat] env misconfigured:", error.message);
      return jsonError(error.message, 500, "server_error");
    }
    throw error;
  }

  // 3. Rate limits (§7) — before any spend. Both checks are Supabase-backed
  // (D4). A failure here is fatal, never a pass: these limits are the cost
  // control, so "could not check" must not mean "go ahead".
  const db = createChatClient(env);
  const ipHash = hashIp(clientIpFrom(request.headers), env.ADMIN_COOKIE_SECRET);

  try {
    const verdict = await checkRateLimits(db, ipHash);
    if (!verdict.allowed) {
      console.warn(`[api/chat] limit hit: ${verdict.reason}`);
      return jsonError(
        `Rate limit reached (${verdict.reason}).`,
        429,
        "rate_limited",
      );
    }
  } catch (error) {
    console.error("[api/chat] rate-limit check failed:", error);
    return jsonError("Could not verify rate limits.", 503, "server_error");
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
    return jsonError("Could not record the conversation.", 503, "server_error");
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

  const modelRequest: ChatRequest = {
    system: SYSTEM_PROMPT,
    conversation,
    dialInstruction: personalityInstruction({ humor, conciseness }),
    maxTokens: MAX_TOKENS,
  };

  // 6. §3 provider fallback (v2.8). Anthropic is always tried first: the
  // fallback is a rescue, not a router. `start()` pulls the first event, so an
  // auth, quota or billing failure throws here while the status is still ours
  // to choose. Once it resolves the status is committed, and a later failure
  // can only abort the body.
  let provider: ChatProvider = anthropicProvider(env.ANTHROPIC_API_KEY);
  let stream: ChatStream;
  let fallbackReason: FallbackReason | null = null;

  // §3 (v2.9) — the development-only override. `readForcedProvider` returns
  // null in production before it even parses the value, so this branch cannot
  // run on the live site. When it does run there is deliberately no fallback
  // back to Claude: a test run that quietly reverted to the model you were
  // trying to bypass would be worse than no override at all.
  const forced = readForcedProvider();
  if (forced === "gemini") {
    const forcedEnv = readFallbackEnv();
    if (forcedEnv === null) {
      console.error(
        "[api/chat] CHAT_FORCE_PROVIDER=gemini but GEMINI_API_KEY is unset.",
      );
      return jsonError(
        "The forced provider has no API key.",
        500,
        "server_error",
      );
    }
    console.warn(
      "[api/chat] CHAT_FORCE_PROVIDER=gemini — answering from the fallback model. Development only.",
    );
    provider = geminiProvider(forcedEnv.GEMINI_API_KEY);
    fallbackReason = "forced";
  }

  try {
    stream = await provider.start(modelRequest);
  } catch (primaryError) {
    const failure = classifyUpstream(primaryError, conversation);
    console.error(
      `[api/chat] ${provider.id} failed (${failure.code}):`,
      primaryError,
    );

    // Already on the forced provider: report honestly rather than silently
    // answering from the model the override exists to avoid.
    if (fallbackReason === "forced") {
      return jsonError(failure.message, failure.status, failure.code);
    }

    const fallbackEnv = readFallbackEnv();
    if (fallbackEnv === null) {
      console.error(
        "[api/chat] no fallback provider configured (GEMINI_API_KEY unset).",
      );
      return jsonError(failure.message, failure.status, failure.code);
    }

    // §6 — the notice names the cause, so the reason is carried rather than
    // guessed downstream. "out of credit" must never appear for a throttle.
    fallbackReason =
      failure.code === "upstream_credit" ? "credit" : "unavailable";
    provider = geminiProvider(fallbackEnv.GEMINI_API_KEY);

    try {
      stream = await provider.start(modelRequest);
    } catch (fallbackError) {
      console.error(
        `[api/chat] fallback ${provider.id} failed as well:`,
        fallbackError,
      );
      // The primary's code is kept when it was a credit failure, because that
      // is still the truest thing we know about why the visitor got nothing.
      return jsonError(
        "Both providers are unavailable.",
        503,
        failure.code === "upstream_credit"
          ? "upstream_credit"
          : "upstream_error",
      );
    }
  }

  const answeringModel = provider.id;
  const encoder = new TextEncoder();

  /**
   * §5 — keeps the invocation alive until the assistant turn is written.
   *
   * That write is the one piece of work here that runs after the response has
   * been fully flushed (below, past `controller.close()`), and on a serverless
   * host the platform is entitled to freeze or reclaim the instance the moment
   * a response ends. Pending I/O then dies mid-flight as "TypeError: fetch
   * failed", which is how two replies went unlogged on 2026-09-13 while the
   * visitors sat reading them. Nothing was wrong with the database: the writes
   * that run *before* the response, the session upsert and the visitor's turn,
   * have never failed.
   *
   * `after()` is the supported way to say the invocation is not finished yet.
   * It changes none of §5's ordering — the reply still reaches the visitor
   * before anything is written, and a logging failure still cannot un-send it
   * — and only stops the runtime pulling the floor out from under the write.
   *
   * A promise rather than a callback, because the work is already scheduled
   * inside the stream below; this just holds the door open until it settles.
   */
  let markLogged: () => void = () => {};
  const logged = new Promise<void>((resolve) => {
    markLogged = resolve;
  });
  after(logged);

  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      let stopReason: StopReason | null = null;
      let emittedText = false;
      let reply = "";

      // Token usage. §5 persists these to chat_messages; they are logged as
      // well, so cost and cache-hit rate stay observable.
      const usage = {
        inputTokens: 0,
        outputTokens: 0,
        cacheWriteTokens: 0,
        cacheReadTokens: 0,
      };

      try {
        for await (const chunk of stream.chunks) {
          if (chunk.type === "text") {
            emittedText = true;
            reply += chunk.text;
            controller.enqueue(encoder.encode(chunk.text));
          } else if (chunk.type === "usage") {
            Object.assign(usage, chunk.usage);
          } else {
            stopReason = chunk.reason;
          }
        }

        // §3 — check the stop reason before trusting the content. A refusal
        // gets the standardized fallback line, never a fabricated answer.
        if (stopReason === "refusal") {
          const line = (emittedText ? "\n\n" : "") + FALLBACK_LINE;
          reply += line;
          controller.enqueue(encoder.encode(line));
        } else if (stopReason === "max_tokens" || stopReason === "other") {
          // "other" is an unexplained provider stop. It gets this note rather
          // than the fallback line, because §8 counts that line to find gaps in
          // the notes, and an infrastructure event is not one.
          reply += TRUNCATION_NOTE;
          controller.enqueue(encoder.encode(TRUNCATION_NOTE));
        }
        console.log(
          `[api/chat] model=${answeringModel} stop=${stopReason} in=${usage.inputTokens} out=${usage.outputTokens} ` +
            `cache_write=${usage.cacheWriteTokens} cache_read=${usage.cacheReadTokens}`,
        );
        controller.close();

        // §5 — log the assistant turn with its token usage and the model that
        // actually answered, so /study never attributes a fallback reply to
        // Opus 5. This runs after close() because the reply is already
        // delivered; a logging failure must be loud in the server log but
        // cannot un-send the response, and must not corrupt a stream the
        // visitor has already read.
        try {
          if (reply !== "") {
            // §4/§8 — restore byte-identity of the fixed sentence before it is
            // stored, because the gap analysis matches it exactly and a
            // paraphrase would drop out of that list rather than degrade it.
            const { content, normalized } = canonicalizeFallbackLine(reply);
            if (normalized) {
              console.warn(
                `[api/chat] ${answeringModel} paraphrased the fixed fallback line; canonicalized for the gap analysis (§8).`,
              );
            }
            await logMessage(db, {
              sessionId,
              role: "assistant",
              content,
              model: answeringModel,
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
        // There is deliberately no fallback here (§3): the visitor has already
        // read tokens, and restarting the answer from another model halfway
        // through would rewrite text they watched appear.
        console.error("[api/chat] stream failed:", error);
        controller.error(error);
      } finally {
        // However this ended — a clean close, a mid-stream abort, a visitor
        // closing the tab — there is no more work to wait for. Resolving here
        // rather than after the logging block is what stops `after()` holding
        // an instance open for a promise nothing would ever settle.
        markLogged();
      }
    },
    async cancel() {
      await stream.abort();
    },
  });

  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    // Discourage intermediary buffering so deltas flush incrementally.
    "X-Accel-Buffering": "no",
  });
  if (fallbackReason !== null) {
    // §6 — the reason travels as a header, not in the streamed body, so it
    // never enters the logged reply and therefore never reaches §8's count.
    headers.set(FALLBACK_REASON_HEADER, fallbackReason);
  }

  return new Response(body$, { status: 200, headers });
}
