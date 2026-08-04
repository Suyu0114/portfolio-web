/**
 * Admin session cookie — SPEC-CHATBOT §8.
 *
 * Uses Web Crypto rather than `node:crypto` so the same code runs in Edge
 * middleware and in Node route handlers. One operator, no user table, no OAuth.
 */

export const ADMIN_COOKIE_NAME = "suyu_study";

/** §8 — 7-day expiry. */
export const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();

async function hmacHex(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compares two equal-length hex digests without an early exit, so the time
 * taken does not reveal how many leading characters matched.
 */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * §8 — constant-time password check. Both sides are hashed first so the
 * comparison is always over 64 hex characters; comparing the raw strings would
 * leak the password's length through the early length check.
 */
export async function passwordMatches(
  supplied: string,
  expected: string,
  secret: string,
): Promise<boolean> {
  const [a, b] = await Promise.all([
    hmacHex(supplied, secret),
    hmacHex(expected, secret),
  ]);
  return timingSafeEqualHex(a, b);
}

/** Builds a signed cookie value: `<expiresAtMs>.<hmac>`. */
export async function createSessionCookie(secret: string): Promise<string> {
  const expiresAt = String(Date.now() + ADMIN_SESSION_TTL_MS);
  return `${expiresAt}.${await hmacHex(expiresAt, secret)}`;
}

/** True only for a well-formed, correctly signed, unexpired cookie. */
export async function isValidSessionCookie(
  value: string | undefined,
  secret: string,
): Promise<boolean> {
  if (value === undefined) return false;

  const separator = value.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  if (!/^\d+$/.test(payload)) return false;

  // Verify the signature before trusting the expiry it carries.
  if (!timingSafeEqualHex(signature, await hmacHex(payload, secret))) {
    return false;
  }
  return Number(payload) > Date.now();
}
