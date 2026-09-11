/**
 * The `/api/chat` failure vocabulary — SPEC-CHATBOT §6 (error states), §7
 * (upstream failure classification), v2.8.
 *
 * Shared by the route and the panel, which is why it has **zero imports**:
 * the panel is a client component, and a module that pulled in a provider SDK
 * to share three string unions would drag that SDK into the browser bundle.
 * The classifier itself stays in the route, where the SDK is already imported.
 *
 * Codes exist because the HTTP status cannot carry this on its own. 503 already
 * means two unrelated things on this route (rate-limit check down, logging
 * down) and now a third (provider out of credit), and those must not all show
 * the same sentence. Status is for caches and monitoring; the code is for copy.
 */

export const CHAT_ERROR_CODES = [
  /** Malformed JSON, or a body that failed zod (§7). */
  "bad_request",
  /** Missing env, or a Supabase dependency that is down. */
  "server_error",
  /** This site's own per-IP or daily fuse (§7). Always paired with 429. */
  "rate_limited",
  /** The provider account has no credit left. */
  "upstream_credit",
  /** The provider throttled us or is overloaded. */
  "upstream_busy",
  /** The provider rejected our key. A server misconfiguration, not a visitor's problem. */
  "upstream_auth",
  /** Any other provider failure, including one we could not classify. */
  "upstream_error",
] as const;

export type ChatErrorCode = (typeof CHAT_ERROR_CODES)[number];

export function isChatErrorCode(value: unknown): value is ChatErrorCode {
  return (CHAT_ERROR_CODES as readonly unknown[]).includes(value);
}

/**
 * Narrows a parsed error body to its code, or null when the body is not this
 * route's contract at all. A platform-level 502 from the host arrives as an
 * HTML page, so this has to tolerate anything.
 */
export function readChatErrorCode(value: unknown): ChatErrorCode | null {
  if (typeof value !== "object" || value === null) return null;
  const body = value as Record<string, unknown>;
  return isChatErrorCode(body.code) ? body.code : null;
}

/**
 * §6 — why a reply came from the fallback provider. Travels on a response
 * header rather than in the streamed body, so it never enters the logged reply
 * and therefore never reaches §8's gap count.
 *
 * Three values, not one, because the notice names the cause and naming the
 * wrong cause is a rule 1 breach in its own right: "out of credit" must not
 * appear when the real reason was a throttle, and neither is true when a
 * developer simply asked for the other model (`forced`, v2.9, which cannot
 * occur in production).
 */
export const FALLBACK_REASON_HEADER = "X-Chat-Fallback-Reason";

export const FALLBACK_REASONS = ["credit", "unavailable", "forced"] as const;

export type FallbackReason = (typeof FALLBACK_REASONS)[number];

export function isFallbackReason(value: unknown): value is FallbackReason {
  return (FALLBACK_REASONS as readonly unknown[]).includes(value);
}
