import { z } from "zod";

/**
 * Runtime env for the chatbot surface — SPEC-CHATBOT §2.
 *
 * These six vars are the *exhaustive* allowlist. Nothing here is read at
 * module scope: `npm run build` must pass with zero env vars set (CI has no
 * secrets), so every read happens inside a function called at request time.
 * A missing var throws `MissingEnvError`, which the route handler turns into
 * an explicit 500 (fail loud, CLAUDE.md rule 2).
 *
 * None of these may ever gain a `NEXT_PUBLIC_` prefix — the Supabase service
 * key bypasses RLS and must not reach the browser bundle.
 */

/** Thrown when a required env var is absent or blank. */
export class MissingEnvError extends Error {
  readonly missing: readonly string[];

  constructor(missing: readonly string[]) {
    super(
      `Missing required environment variable${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. ` +
        `Set them in .env.local for local development, or in the Vercel project settings for deploys.`,
    );
    this.name = "MissingEnvError";
    this.missing = missing;
  }
}

const nonEmpty = z.string().trim().min(1);

const chatEnvSchema = z.object({
  ANTHROPIC_API_KEY: nonEmpty,
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: nonEmpty,
  // §5/§7 reuse this as the HMAC key for ip_hash, so the visitor chat route
  // needs it from C3 onward — not just the admin surface. (SPEC-CHATBOT §10
  // lists it under C4; rate limiting makes it a C3 dependency in practice.)
  ADMIN_COOKIE_SECRET: nonEmpty,
});

/**
 * §2 (v2.3) — contact-signal alerts. The only optional var in the allowlist,
 * and it is read through `readNotifyEnv` rather than `requireChatEnv` for a
 * reason: alerting is a side channel, so a missing key must degrade to a
 * server-log warning, never to a 500 on a visitor's conversation.
 */
const notifyEnvSchema = z.object({
  RESEND_API_KEY: nonEmpty,
});

const adminEnvSchema = z.object({
  ADMIN_PASSWORD: nonEmpty,
  ADMIN_COOKIE_SECRET: nonEmpty,
});

/** Just the storage half — what the /study pages need, without the API key. */
const supabaseEnvSchema = chatEnvSchema.pick({
  SUPABASE_URL: true,
  SUPABASE_SERVICE_ROLE_KEY: true,
});

export type ChatEnv = z.infer<typeof chatEnvSchema>;
export type NotifyEnv = z.infer<typeof notifyEnvSchema>;
export type AdminEnv = z.infer<typeof adminEnvSchema>;
export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;

function parseOrThrow<T>(schema: z.ZodType<T>, raw: Record<string, unknown>): T {
  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }
  // Report the variable names, never the values — this message reaches a 500 body.
  const missing = parsed.error.issues.map((issue) => String(issue.path[0]));
  throw new MissingEnvError([...new Set(missing)]);
}

/**
 * Env needed by `/api/chat`. Call inside the request handler, never at module
 * scope.
 */
export function requireChatEnv(): ChatEnv {
  return parseOrThrow(chatEnvSchema, {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_COOKIE_SECRET: process.env.ADMIN_COOKIE_SECRET,
  });
}

/**
 * Env for the alert path (§7). Returns null when the key is absent instead of
 * throwing, which is what makes the alert optional: the caller warns and skips
 * rather than failing the request that happened to contain a lead.
 */
export function readNotifyEnv(): NotifyEnv | null {
  const parsed = notifyEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  });
  return parsed.success ? parsed.data : null;
}

/** Env needed to read or write the chat tables (the `/study` pages, §8). */
export function requireSupabaseEnv(): SupabaseEnv {
  return parseOrThrow(supabaseEnvSchema, {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

/**
 * Env needed by the admin surface — `middleware.ts`, `/api/admin/*`, `/study`.
 * `ADMIN_COOKIE_SECRET` is also the HMAC key for `ip_hash` (SPEC-CHATBOT
 * §5/§7), so C3 rate limiting needs it too, not only C4 login.
 */
export function requireAdminEnv(): AdminEnv {
  return parseOrThrow(adminEnvSchema, {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_COOKIE_SECRET: process.env.ADMIN_COOKIE_SECRET,
  });
}
