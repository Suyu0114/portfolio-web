import type { SupabaseClient } from "@supabase/supabase-js";
import {
  claimSessionAlert,
  countAlertsToday,
  DAILY_ALERT_CAP,
  markAlertSent,
} from "@/lib/chatStore";
import { detectContactSignal, type ContactSignal } from "@/lib/contactSignal";
import { readNotifyEnv, type NotifyEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/site";

/**
 * Contact-signal alerts — SPEC-CHATBOT §7 (v2.3).
 *
 * One POST to Resend's REST API. No SDK: a single request does not need a
 * wrapper, and keeping it direct is the same reasoning as D1 — the dependency
 * tree stays small and the API surface stays visible.
 *
 * The recipient is a constant. It is never derived from the message, so a
 * visitor cannot aim this at anyone: whatever they type, the mail lands in
 * Suyu's inbox or nowhere. That is the whole anti-abuse story, and it is why
 * this needs no allowlist of its own.
 */

/** Already public: it is in the fallback line and in the FAQ notes. */
const ALERT_TO = "suyu0229@gmail.com";

/**
 * Resend's shared sender. The site runs on a vercel.app subdomain, which
 * cannot take the DNS records a verified sending domain needs, so the free
 * tier's own address is the only option. It is allowed to deliver to the
 * account owner, which is the only address this ever writes to.
 */
const ALERT_FROM = "STET <onboarding@resend.dev>";

const ENDPOINT = "https://api.resend.com/emails";

export type ContactAlert = {
  sessionId: string;
  signal: ContactSignal;
  message: string;
  entryPath: string | null;
};

function body(alert: ContactAlert): string {
  const why =
    alert.signal.kind === "handle"
      ? "left a way to reach them"
      : "said they are hiring";

  return [
    `Someone ${why} in the chat.`,
    "",
    `matched:  ${alert.signal.matched}`,
    `on page:  ${alert.entryPath ?? "unknown"}`,
    "",
    "what they said:",
    alert.message,
    "",
    `transcript: ${SITE_URL}/study/session/${alert.sessionId}`,
  ].join("\n");
}

/**
 * Sends the alert. Throws on any non-2xx so the caller can log it and leave
 * `alerted_at` unset — a flagged session that was never emailed has to stay
 * distinguishable from one that was (§5).
 */
export async function sendContactAlert(
  env: NotifyEnv,
  alert: ContactAlert,
): Promise<void> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: ALERT_FROM,
      to: [ALERT_TO],
      subject: `Chat lead: ${alert.signal.kind === "handle" ? "contact details" : "hiring"} on ${alert.entryPath ?? "the site"}`,
      text: body(alert),
    }),
  });

  if (!response.ok) {
    // Read the body: Resend explains sender and domain rejections there, and
    // that is exactly the class of failure this is most likely to hit.
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Resend returned ${response.status}: ${detail.slice(0, 300)}`,
    );
  }
}

/**
 * The whole alert path for one visitor turn (§7).
 *
 * Never throws. Alerting is a side channel, so every failure in here is loud
 * in the server log and invisible to the visitor — losing a notification must
 * not cost someone their answer. That is a narrow exception to fail-loud in
 * the same shape as the assistant-turn logging in the route: the work is
 * already done, and refusing to deliver it would help nobody.
 *
 * Flagging and emailing are separate steps on purpose. The session is claimed
 * first, so `/study` shows the badge even when no key is configured or the
 * daily fuse has blown; `alerted_at` is written only if mail actually left.
 */
export async function maybeAlertOnContact(
  db: SupabaseClient,
  input: { sessionId: string; message: string; entryPath: string | null },
): Promise<void> {
  const signal = detectContactSignal(input.message);
  if (signal === null) return;

  try {
    const claimed = await claimSessionAlert(db, input.sessionId, signal.kind);
    // Not an error: this is the second contact message in one conversation.
    if (!claimed) return;

    const env = readNotifyEnv();
    if (env === null) {
      console.warn(
        `[api/chat] contact signal (${signal.kind}) flagged on session ` +
          `${input.sessionId}, but RESEND_API_KEY is unset. Visible in /study, ` +
          `not emailed.`,
      );
      return;
    }

    const sentToday = await countAlertsToday(db);
    if (sentToday >= DAILY_ALERT_CAP) {
      console.warn(
        `[api/chat] daily alert cap reached (${sentToday}/${DAILY_ALERT_CAP}); ` +
          `session ${input.sessionId} is flagged but not emailed.`,
      );
      return;
    }

    await sendContactAlert(env, { ...input, signal });
    await markAlertSent(db, input.sessionId);
    console.log(
      `[api/chat] contact alert sent for session ${input.sessionId} (${signal.kind})`,
    );
  } catch (error) {
    console.error("[api/chat] contact alert failed:", error);
  }
}
