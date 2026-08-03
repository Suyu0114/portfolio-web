import crypto from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ChatEnv } from "@/lib/env";

/**
 * Supabase access for the chat surface — SPEC-CHATBOT §5 (logging) and §7
 * (rate limits, D4: Supabase-backed rather than a second storage dependency).
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
 * Confirmed at 500 by Suyu 2026-08-03.
 */
export const DAILY_ASSISTANT_MESSAGE_CAP = 500;

export function createChatClient(env: ChatEnv): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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
    throw new Error(`Rate-limit check failed: ${perIp.error.message}`);
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
    throw new Error(`Daily-cap check failed: ${daily.error.message}`);
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
  const { error } = await db.from("chat_sessions").upsert(
    {
      id: session.id,
      entry_path: session.entryPath,
      referrer: session.referrer,
      ip_hash: session.ipHash,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) throw new Error(`Session upsert failed: ${error.message}`);
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
  },
): Promise<void> {
  const { error } = await db.from("chat_messages").insert({
    session_id: message.sessionId,
    role: message.role,
    content: message.content,
    model: message.model ?? null,
    input_tokens: message.inputTokens ?? null,
    output_tokens: message.outputTokens ?? null,
  });
  if (error) throw new Error(`Message insert failed: ${error.message}`);
}
