/**
 * Contact-signal detection — SPEC-CHATBOT §7 (v2.3).
 *
 * Deterministic and dependency-free. No second model call, for the same
 * reason D3 rejected one for gap detection: it would double the cost and
 * latency of the hot path to classify something a regex already settles.
 *
 * Narrow on purpose. A false positive is worse than a miss here, because an
 * alert that fires on ordinary curiosity trains its only reader to ignore it.
 * The suggested chips are the standing trap: "What is Suyu looking for?" ships
 * as a chip, so hiring-adjacent vocabulary on its own can never be a trigger.
 * Only two things count as signal: a visitor handing over a way to reach them,
 * or a visitor stating in the first person that they are hiring.
 */

export type ContactSignalKind = "handle" | "intent";

export type ContactSignal = {
  kind: ContactSignalKind;
  /**
   * The matched fragment only, never the whole message. The alert body quotes
   * the message separately; this is the reason the alert fired, and keeping
   * the two apart is what makes a misfire diagnosable.
   */
  matched: string;
};

/**
 * Suyu's own address, which the bot hands out in the fallback line. A visitor
 * quoting it back ("I'll email suyu0229@gmail.com") is not a lead, and
 * alerting on the site's own contact detail would fire on the bot's success
 * case.
 */
const OWN_ADDRESS = "suyu0229@gmail.com";

const HANDLE_PATTERNS: readonly RegExp[] = [
  /[\w.+-]+@[\w-]+\.[\w.-]{2,}/,
  /\blinkedin\.com\/in\/[\w%-]+/i,
  /\b(?:calendly\.com|cal\.com|savvycal\.com)\/[\w/-]+/i,
  // North American phone. Anchored on non-digits at both ends so the figures
  // that show up in these conversations (n=1,181, 4,325 rows, 10285 tokens)
  // cannot be read as a number someone can be called on.
  /(?<!\d)(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?!\d)/,
];

/**
 * First person, present tense, and explicit. "We have a role open" is a lead
 * too, but it is close enough to the chip wording that catching it would cost
 * more in noise than it returns.
 */
const INTENT_PATTERN =
  /\b(?:i'?m|i am|we'?re|we are)\b[^.!?\n]{0,60}?\b(?:hiring|recruiting|a recruiter|the recruiter|looking to hire|trying to fill)\b/i;

export function detectContactSignal(message: string): ContactSignal | null {
  for (const pattern of HANDLE_PATTERNS) {
    const found = message.match(pattern);
    if (found === null) continue;
    if (found[0].toLowerCase().includes(OWN_ADDRESS)) continue;
    return { kind: "handle", matched: found[0] };
  }

  const intent = message.match(INTENT_PATTERN);
  if (intent !== null) return { kind: "intent", matched: intent[0] };

  return null;
}
