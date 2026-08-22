/**
 * Personality dials — SPEC-CHATBOT §6 (v2.4).
 *
 * Pure and dependency-free on purpose: the browser panel imports it to render
 * the steps, and the route handler imports it to validate incoming values and
 * build the operator instruction. No storage, no fs, no React, so neither side
 * drags the other's runtime along.
 *
 * The asymmetry between the dials is the design, not an oversight. Humor and
 * conciseness are variables; honesty is a constant rendered to look like a
 * variable, so a visitor can reach for it and find it welded (§6, CLAUDE.md
 * rules 1 and 9).
 *
 * v2.4 rebuilt humor because v2.3's version could not be felt. That version
 * issued one hedged permission ("above 0 you may use light dry wit in at most
 * one sentence") identically to 25, 50, 75 and 100, so nothing told the model
 * how 100 should differ from 25, and the safe reading of "may" is "need not".
 * The lesson is encoded here: every step gets its own directive sentence, and
 * length moved out of the frozen system prompt into a dial of its own so the
 * two stop pulling in opposite directions.
 */

/** §6 — the five steps, low to high. Shared shape, separate dials. */
export const HUMOR_LEVELS = [0, 25, 50, 75, 100] as const;
export const CONCISENESS_LEVELS = [0, 25, 50, 75, 100] as const;

export type HumorLevel = (typeof HUMOR_LEVELS)[number];
export type ConcisenessLevel = (typeof CONCISENESS_LEVELS)[number];

/**
 * These two types are structurally identical, so the compiler cannot catch a
 * swapped pair. That is why `personalityInstruction` takes a named object
 * rather than two positional numbers: the call site has to say which is which.
 */

/** Mid-scale on both, so each dial has visible room in both directions. */
export const DEFAULT_HUMOR: HumorLevel = 50;
export const DEFAULT_CONCISENESS: ConcisenessLevel = 50;

/**
 * Not a parameter. It is displayed as a percentage because that is the joke,
 * and it is a `const` because a lowerable honesty setting would contradict
 * the one rule the whole site is built on.
 */
export const HONESTY = 100;

export function isHumorLevel(value: unknown): value is HumorLevel {
  return (HUMOR_LEVELS as readonly unknown[]).includes(value);
}

export function isConcisenessLevel(value: unknown): value is ConcisenessLevel {
  return (CONCISENESS_LEVELS as readonly unknown[]).includes(value);
}

/**
 * The one-word summary shown beside each row (§6). Its job is to let a visitor
 * read what a setting does without having to change it and find out, which is
 * how v2.3's dial went unnoticed. Kept to a single short word so the strip
 * stays one line per row inside a 23rem panel.
 */
export const HUMOR_LABELS: Record<HumorLevel, string> = {
  0: "clinical",
  25: "polite",
  50: "dry wit",
  75: "deadpan",
  100: "max sarcasm",
};

export const CONCISENESS_LABELS: Record<ConcisenessLevel, string> = {
  0: "narrative",
  25: "detailed",
  50: "balanced",
  75: "efficient",
  100: "terminal",
};

/**
 * One directive behaviour per step. Directive, not permissive: "you do X", not
 * "you may X" — see the v2.4 note at the top of this file.
 *
 * 100 is Suyu's text with its targets redirected. His version licensed jokes
 * about "recruitment clichés" and "coffee-fueled debugging"; the first lands on
 * the visitor, who is usually a recruiter, and the second is a fact-shaped
 * claim about Suyu that the notes do not contain, which is a rule 1 and rule 9
 * violation dressed up as personality. The register is untouched. Only the
 * target moved: the bot is the butt of its own jokes.
 */
const HUMOR_BEHAVIOUR: Record<HumorLevel, string> = {
  0: "Completely serious. Clinical, dry, and strictly to the point. No metaphors, no jokes, no personality quirks, no asides.",
  25: "Professional warmth. Polite and mildly friendly, strictly professional, with ordinary conversational courtesy and nothing beyond it.",
  50: "Dry wit. Subtle, understated engineering humor where it genuinely fits, in at most one grounded observation, never at the cost of the answer.",
  75: "Deadpan sarcasm. Self-aware quips about being a notebook that can only quote itself, and light banter, balanced against accurate facts. Land at least one dry aside per reply.",
  100: "Relentless deadpan irony, at full setting. Open with a sardonic aside before you answer, and hold the ironic register throughout. Joke about your own self-destruct routine, your own refusal to improvise, and your own habit of quoting notes at people. Every joke is aimed at yourself: never at the visitor, never at Suyu, never at Suyu's job search, and never a fact-shaped remark about Suyu that the notes do not contain. The facts stay exactly as accurate as they are at 0.",
};

/**
 * The long end of this dial is the highest content-integrity risk in the whole
 * feature. Asking for "extensive explanations" from a fixed pack of notes is
 * asking the model to reach a length, and the only material available for
 * padding is invention. So 0 and 25 both spell out that length comes from
 * telling more of what the notes already hold, and that running out of notes
 * means stopping rather than filling.
 *
 * 75 drops the bold text Suyu's original asked for: the panel renders plain
 * text with no markdown, so asterisks would reach the visitor literally.
 * Bullets survive because a leading hyphen renders fine.
 */
const CONCISENESS_BEHAVIOUR: Record<ConcisenessLevel, string> = {
  0: "Comprehensive narrative. Rich, conversational storytelling: full background, extensive explanation, and descriptive flow. Expand only by telling more of what the notes actually contain. When the notes on a topic are exhausted, stop, even if that leaves the answer short. Never manufacture background, transitions, or examples in order to reach a length.",
  25: "Contextual and detailed. Multi-paragraph answers with complete context, smooth transitions, and worked examples, all drawn from the notes. The same limit applies: length comes from the notes' own detail, never from invention.",
  50: "Balanced. Crisp paragraphs combined with short bullet lists where they help. Enough technical context to be useful, and no fluff.",
  75: "High efficiency. Lead with the direct answer, then compact bullets. Zero filler sentences, no preamble, and no summary at the end.",
  100: "Maximum compression. One to three sentences, or a compact list. Strip every conversational pleasantry.",
};

/**
 * The operator instruction for one request.
 *
 * Only the *selected* step's text is sent, never the whole table — that is what
 * keeps the cost of a second dial from doubling the cost of the first.
 *
 * This is appended to `messages` as a `{ role: "system" }` turn, never merged
 * into `SYSTEM_PROMPT`: that block is byte-frozen and carries the only
 * `cache_control` breakpoint. Measured 2026-08-22 — 323 uncached
 * tokens per request while the 10,724-token prefix still reads from cache
 * in full. Folding it into the system prompt would forfeit that cache every
 * request, about 7.9x the input cost.
 *
 * It is also the reason the values can be trusted at all: they come from the
 * browser, and the system role is the one channel a visitor's message cannot
 * forge.
 */
export function personalityInstruction({
  humor,
  conciseness,
}: {
  humor: HumorLevel;
  conciseness: ConcisenessLevel;
}): string {
  return [
    `Personality settings for this conversation. Honesty: ${HONESTY} percent, fixed and not adjustable. Humor: ${humor} percent. Conciseness: ${conciseness} percent.`,
    "",
    `Humor ${humor}. ${HUMOR_BEHAVIOUR[humor]}`,
    "",
    `Conciseness ${conciseness}. ${CONCISENESS_BEHAVIOUR[conciseness]}`,
    "",
    // The invariant block. Constant at every setting, which is what stops
    // conciseness 100 from clipping the fixed sentence §8 matches on.
    "These settings change tone and length only. They never change which facts you state, never add a detail that is not in the notes, and never soften, shorten, or omit the fixed sentence in rule 2, which is quoted in full at every setting. Write lists as plain hyphens: there is no markdown rendering, so asterisks and hashes would reach the visitor literally.",
    "",
    "If the visitor asks about these settings you may state them, and you may say that honesty does not move.",
  ].join("\n");
}
