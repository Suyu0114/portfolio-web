import crypto from "node:crypto";
import {
  createClient,
  type PostgrestError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { ConcisenessLevel, HumorLevel } from "@/lib/chatPersonality";
import type { SupabaseEnv } from "@/lib/env";

/**
 * Supabase access for the chatbot surface — SPEC-CHATBOT §5 (logging), §7
 * (rate limits, D4: Supabase-backed rather than a second storage dependency)
 * and, since v2.13, §8's login throttle. All of it lives here because all of
 * it is the same dependency reached the same way; splitting the admin half out
 * would mean exporting `supabaseError` to keep one error shape.
 *
 * Server-side only. Everything here runs with the service/secret key, which
 * bypasses RLS; no table has a public policy and the anon key is never used.
 */

/** §7 — per IP-hash: 20 requests / 5 minutes. */
export const RATE_LIMIT_REQUESTS = 20;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

/**
 * §7 — global daily cap on assistant messages. This is the spend fuse: a
 * constant in code, deliberately not an env var, so changing it is a commit.
 * Confirmed at 500 by Suyu 2026-08-03; cut to 300 in v2.4, where max_tokens
 * doubled to 2048 to pay for the conciseness dial. Trading half the ceiling on
 * volume for double the ceiling on length keeps worst-case daily spend flat.
 */
export const DAILY_ASSISTANT_MESSAGE_CAP = 300;

/**
 * §7 (v2.3) — global daily cap on contact alerts. A constant for the same
 * reason as the one above: raising it should be a commit, not a dashboard
 * click. Sized well under Resend's free tier so the fuse is ours, not theirs.
 */
export const DAILY_ALERT_CAP = 20;

export function createChatClient(env: SupabaseEnv): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Reads one field off a PostgREST error, tolerating its absence.
 *
 * The declared type promises four strings and the library does not always
 * deliver them: when a response arrives with a body it cannot parse — an empty
 * 503 from the edge in front of Supabase, for one — it builds the error from
 * `message` alone and leaves `code`, `details` and `hint` undefined. Trusting
 * the type there threw a TypeError inside `supabaseError` itself, which turned
 * a diagnosable outage into an unrelated crash: exactly backwards for a helper
 * whose whole job is saying what went wrong.
 */
function errorField(
  error: PostgrestError,
  key: "message" | "code" | "details" | "hint",
): string {
  const value: string | undefined = error[key];
  return typeof value === "string" ? value : "";
}

/**
 * One Error shape for every Supabase failure below — fail loud with something
 * worth reading (CLAUDE.md rule 2).
 *
 * These wrappers used to interpolate `error.message` and drop the rest, which
 * cost a live diagnosis on 2026-09-13: a visitor-facing 503 reached the Vercel
 * log as `Rate-limit check failed:` with nothing after the colon. Everything
 * that identifies such a failure sits outside `message`, and `message` is
 * empty in precisely the case that took the chat down.
 *
 * `status` is the field that matters most: postgrest-js reports 0 when the
 * request never got an HTTP response at all, so it separates "could not reach
 * Supabase" from "Supabase answered, badly" — the difference between a socket
 * to retry and a project to go look at. `code` and `hint` are Postgres's own,
 * and the hint is usually the actionable half when the cause is a real query
 * error.
 */
function supabaseError(
  prefix: string,
  result: { error: PostgrestError | null; status: number; statusText: string },
): Error {
  const { error } = result;
  const message = error === null ? "" : errorField(error, "message");
  const code = error === null ? "" : errorField(error, "code");
  const hint = error === null ? "" : errorField(error, "hint");
  const details = error === null ? "" : errorField(error, "details");

  const fields: readonly (string | null)[] = [
    `status=${result.status}`,
    result.statusText === "" ? null : `statusText=${result.statusText}`,
    error === null
      ? "no error body"
      : message === ""
        ? "no message reported"
        : message,
    code === "" ? null : `code=${code}`,
    hint === "" ? null : `hint=${hint}`,
    ...condenseDetails(message, details),
  ];
  const detail = fields.filter(
    (field): field is string => field !== null && field !== "",
  );
  return new Error(`${prefix}: ${detail.join(" | ")}`, { cause: error });
}

/**
 * The half of postgrest-js's `details` worth putting in a log line.
 *
 * That field holds Postgres's own detail text when the failure is a query
 * error, and for a network failure the `Caused by:` chain followed by a stack.
 * Frames are dropped rather than truncated away, so the line naming the socket
 * or DNS reason survives however long the trace above it runs; the frames are
 * still on `cause` for whoever wants them. Lines already contained in
 * something kept are dropped as well — the chain restates its own cause, and
 * both restate `message` — because a log line saying the same thing three
 * times is the failure this helper exists to fix.
 */
function condenseDetails(message: string, details: string): string[] {
  const kept: string[] = [];
  for (const line of details.split("\n").map((raw) => raw.trim())) {
    if (line === "" || line.startsWith("at ")) continue;
    if (message !== "" && message.includes(line)) continue;
    if (kept.some((already) => already.includes(line))) continue;
    kept.push(line);
  }
  return kept;
}

/**
 * §5 — raw IPs are never stored. Only this HMAC reaches the database, and it
 * exists solely so §7's per-visitor limit can work.
 */
export function hashIp(ip: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

/** Best-effort client IP from the proxy chain. Vercel sets x-forwarded-for. */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded !== null && forwarded.trim() !== "") {
    return forwarded.split(",")[0].trim();
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export type LimitVerdict =
  | { allowed: true }
  | { allowed: false; reason: "per-ip" | "daily-cap" };

/**
 * Both §7 checks, one indexed count query each.
 *
 * Fails **closed**: if Supabase cannot be reached the caller gets an error
 * rather than an unmetered request. These limits are the cost control, so
 * "we could not check" must never mean "go ahead" (CLAUDE.md rule 2).
 */
export async function checkRateLimits(
  db: SupabaseClient,
  ipHash: string,
): Promise<LimitVerdict> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const perIp = await db
    .from("chat_messages")
    .select("id, chat_sessions!inner(ip_hash)", { count: "exact", head: true })
    .eq("chat_sessions.ip_hash", ipHash)
    .eq("role", "user")
    .gte("created_at", windowStart);

  if (perIp.error) {
    throw supabaseError("Rate-limit check failed", perIp);
  }
  // A missing count is not zero. PostgREST answers a HEAD count with no error
  // and a null count in some failure modes (a missing table, for one), and
  // treating that as "0 requests so far" would silently disable the limit —
  // the exact opposite of a fuse.
  if (perIp.count === null) {
    throw new Error("Rate-limit check returned no count for the per-IP window");
  }
  if (perIp.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, reason: "per-ip" };
  }

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const daily = await db
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("role", "assistant")
    .gte("created_at", dayStart.toISOString());

  if (daily.error) {
    throw supabaseError("Daily-cap check failed", daily);
  }
  if (daily.count === null) {
    throw new Error("Daily-cap check returned no count");
  }
  if (daily.count >= DAILY_ASSISTANT_MESSAGE_CAP) {
    return { allowed: false, reason: "daily-cap" };
  }

  return { allowed: true };
}

/**
 * §8 (v2.13) — the admin login throttle: 5 attempts per IP hash per 15
 * minutes. Constants rather than env vars for the same reason as the caps
 * above: changing a fuse should be a commit.
 */
export const ADMIN_LOGIN_ATTEMPTS = 5;
export const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;

/**
 * True when this IP hash has used up the window.
 *
 * Throws rather than returning `false` when the count cannot be read, so the
 * caller fails **closed**. `/api/admin/login` is the one route guarding
 * everything else, and "we could not check" must not resolve to "go ahead"
 * there any more than it does in `checkRateLimits`.
 */
export async function isLoginThrottled(
  db: SupabaseClient,
  ipHash: string,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - ADMIN_LOGIN_WINDOW_MS).toISOString();

  const recent = await db
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("attempted_at", windowStart);

  if (recent.error) {
    throw supabaseError("Login throttle check failed", recent);
  }
  // Same reasoning as the per-IP window above: a null count is not zero, and
  // reading it as zero would disable the throttle silently.
  if (recent.count === null) {
    throw new Error("Login throttle check returned no count");
  }
  return recent.count >= ADMIN_LOGIN_ATTEMPTS;
}

/**
 * Records one attempt, right or wrong, before the password is checked. Writing
 * it first is what stops a correct-guess-on-the-last-try from going unrecorded
 * if the response path throws.
 */
export async function recordLoginAttempt(
  db: SupabaseClient,
  ipHash: string,
): Promise<void> {
  const inserted = await db.from("admin_login_attempts").insert({ ip_hash: ipHash });
  if (inserted.error) {
    throw supabaseError("Recording the login attempt failed", inserted);
  }
}

/**
 * Records the session on first sight. The client generates the id, so this is
 * an upsert that ignores conflicts — later turns must not overwrite the entry
 * path or restart the clock.
 */
export async function ensureSession(
  db: SupabaseClient,
  session: {
    id: string;
    entryPath: string | null;
    referrer: string | null;
    ipHash: string;
  },
): Promise<void> {
  const result = await db.from("chat_sessions").upsert(
    {
      id: session.id,
      entry_path: session.entryPath,
      referrer: session.referrer,
      ip_hash: session.ipHash,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (result.error) throw supabaseError("Session upsert failed", result);
}

/**
 * §7 — claims the one alert this session is allowed, atomically.
 *
 * The condition is `alerted_at`, not `signal_kind`, because the invariant is
 * one *email* per session and `alerted_at` is the only column recording that
 * one was sent. Gating on `signal_kind` forfeited the notification permanently
 * whenever the claim succeeded but the send did not: an unset key, a Resend
 * rejection, or a blown daily fuse each left the session flagged and
 * unemailable for good, so a lead that arrived during a misconfiguration could
 * never be recovered once it was fixed.
 *
 * Still one conditional update, so there is no read-then-write window, and
 * `markAlertSent` closes it permanently. Two contact turns landing in the same
 * instant could both claim, but the panel blocks input while a reply streams,
 * and DAILY_ALERT_CAP bounds it regardless.
 *
 * Returns false when this session has already been emailed. A false is normal,
 * not an error: it is the second contact message in a conversation.
 */
export async function claimSessionAlert(
  db: SupabaseClient,
  sessionId: string,
  kind: string,
): Promise<boolean> {
  const result = await db
    .from("chat_sessions")
    .update({ signal_kind: kind })
    .eq("id", sessionId)
    .is("alerted_at", null)
    .select("id");

  if (result.error) throw supabaseError("Alert claim failed", result);
  return (result.data ?? []).length > 0;
}

/**
 * §7 — today's sent alerts, counted the same way as the two limits above,
 * including the guard that a null count is a failure and not a zero. That
 * distinction was the fail-open bug found in C3; it applies here for the same
 * reason, since this count is also a fuse.
 */
export async function countAlertsToday(db: SupabaseClient): Promise<number> {
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const result = await db
    .from("chat_sessions")
    .select("id", { count: "exact", head: true })
    .gte("alerted_at", dayStart.toISOString());

  if (result.error) throw supabaseError("Alert-cap check failed", result);
  if (result.count === null) {
    throw new Error("Alert-cap check returned no count");
  }
  return result.count;
}

/**
 * §5 — written only after the send succeeds, so `/study` can tell a session
 * that was flagged from one that was actually delivered.
 */
export async function markAlertSent(
  db: SupabaseClient,
  sessionId: string,
): Promise<void> {
  const result = await db
    .from("chat_sessions")
    .update({ alerted_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (result.error) {
    throw supabaseError("Alert timestamp update failed", result);
  }
}

export async function logMessage(
  db: SupabaseClient,
  message: {
    sessionId: string;
    role: "user" | "assistant";
    content: string;
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    /** §6 — the dials this reply was generated at. Null on the user turn. */
    humor?: HumorLevel;
    conciseness?: ConcisenessLevel;
  },
): Promise<void> {
  const result = await db.from("chat_messages").insert({
    session_id: message.sessionId,
    role: message.role,
    content: message.content,
    model: message.model ?? null,
    input_tokens: message.inputTokens ?? null,
    output_tokens: message.outputTokens ?? null,
    humor: message.humor ?? null,
    conciseness: message.conciseness ?? null,
  });
  if (result.error) throw supabaseError("Message insert failed", result);
}
