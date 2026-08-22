/**
 * Personality dials — SPEC-CHATBOT §6 (v2.3).
 *
 * Pure and dependency-free on purpose: the browser panel imports it to render
 * the steps, and the route handler imports it to validate an incoming value
 * and build the operator instruction. No storage, no fs, no React, so neither
 * side drags the other's runtime along.
 *
 * The asymmetry between the two dials is the design, not an oversight. Humor
 * is a variable; honesty is a constant rendered to look like a variable, so a
 * visitor can reach for it and find it welded (§6, CLAUDE.md rules 1 and 9).
 */

/** §6 — the humor dial's five steps, low to high. */
export const HUMOR_LEVELS = [0, 25, 50, 75, 100] as const;

export type HumorLevel = (typeof HUMOR_LEVELS)[number];

/**
 * Light enough to be safe in front of a hiring manager, non-zero so the dial
 * is visibly doing something without anyone hunting for it.
 */
export const DEFAULT_HUMOR: HumorLevel = 25;

/**
 * Not a parameter. It is displayed as a percentage because that is the joke,
 * and it is a `const` because a lowerable honesty setting would contradict
 * the one rule the whole site is built on.
 */
export const HONESTY = 100;

export function isHumorLevel(value: unknown): value is HumorLevel {
  return (HUMOR_LEVELS as readonly unknown[]).includes(value);
}

/**
 * The operator instruction for one request.
 *
 * This is appended to `messages` as a `{ role: "system" }` turn, never merged
 * into `SYSTEM_PROMPT`: that block is byte-frozen and carries the only
 * `cache_control` breakpoint. Measured 2026-08-22 — 207 uncached tokens per
 * request while the 10,445-token prefix still reads from cache in full.
 * Folding it into the system prompt would forfeit that cache every request,
 * about 8.5x the input cost.
 *
 * It is also the reason the value can be trusted at all: the number comes
 * from the browser, and the system role is the one channel a visitor's
 * message cannot forge.
 */
export function personalityInstruction(humor: HumorLevel): string {
  return [
    `Personality settings for this conversation. Honesty: ${HONESTY} percent, fixed and not adjustable. Humor: ${humor} percent.`,
    "",
    "Humor changes phrasing only. It never changes which facts you state, never adds a detail that is not in the notes, and never softens or skips the fixed sentence in rule 2. At 0 you are plain and direct. Above 0 you may use light dry wit in at most one sentence per reply, after the answer, never instead of it. Never joke about the visitor, about Suyu's job search, or about anything you were asked to decline.",
    "",
    "If the visitor asks about these settings you may state them, and you may say that honesty does not move.",
  ].join("\n");
}
