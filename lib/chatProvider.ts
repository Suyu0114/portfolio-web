/**
 * Provider-neutral reply streaming — SPEC-CHATBOT §3 ("Provider fallback",
 * v2.8).
 *
 * One shape both adapters produce, so `/api/chat` stops being written in
 * Anthropic's event vocabulary and the fallback is a second implementation
 * rather than a second copy of the route. Deliberately the *narrowest* type
 * that covers what the route actually branches on: text to forward, tokens to
 * log (§5), and a stop reason (§3 refusal handling, §7 output cap). Anything
 * richer would have to be invented twice and kept in sync twice.
 *
 * No provider SDK is imported here. This module is the seam, not a wrapper
 * (D5): each adapter keeps its own SDK surface visible in its own file.
 */

/** §5 — the per-reply token counts logged to `chat_messages`. */
export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
};

/**
 * Why generation stopped, narrowed to the three outcomes the route treats
 * differently plus a catch-all.
 *
 * `refusal` earns the standardized §4 line, because that is what §3 says a
 * refusal gets. `max_tokens` and `other` both earn the truncation note: an
 * unexplained stop is not a finished answer, but it is also not a gap in the
 * notes, and §8 counts the §4 line to find gaps. Routing an infrastructure
 * event to that string would file it as a missing-content report.
 */
export type StopReason = "end" | "refusal" | "max_tokens" | "other";

export type ChatChunk =
  | { type: "text"; text: string }
  /** Partial because providers report the counts they have, when they have them. */
  | { type: "usage"; usage: Partial<TokenUsage> }
  | { type: "stop"; reason: StopReason };

/** One turn of the replayed window (§3). */
export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatRequest = {
  /** The byte-frozen system prompt carrying the knowledge pack (§4). */
  system: string;
  /** The truncated window, always ending on the visitor's turn (§3). */
  conversation: readonly ChatTurn[];
  /** The per-request personality instruction (§6). Placement is the adapter's call. */
  dialInstruction: string;
  maxTokens: number;
  signal?: AbortSignal;
};

export type ChatStream = {
  /**
   * Every chunk of the reply, including the one the adapter already pulled to
   * force pre-stream failures to throw from `start()`.
   */
  chunks: AsyncGenerator<ChatChunk>;
  abort(): Promise<void>;
};

export type ChatProvider = {
  /** Logged verbatim into `chat_messages.model`, so /study says who answered. */
  readonly id: string;
  /**
   * Opens the stream and pulls its first event before returning.
   *
   * That pull is the whole contract: auth, quota and billing failures surface
   * as a throw here, while the route can still choose a status and a fallback.
   * Once this resolves, the status is committed and a later failure can only
   * abort the body (§3).
   */
  start(request: ChatRequest): Promise<ChatStream>;
};
