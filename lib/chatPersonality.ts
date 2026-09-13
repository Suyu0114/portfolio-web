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
 * v2.11 did the same to conciseness, for a reason that rhymes: 50 and 75
 * described a length ("crisp paragraphs", "compact bullets") without ever
 * quantifying one, so "efficient" and "balanced" answered a broad question at
 * the same length, and both at a length Suyu read as broken. An adjective with
 * no number attached is satisfied by anything. Two rules follow from it, and
 * they are the ones to hold onto when editing this table: every step states a
 * quantity, and every step that can run out of room says what to drop, because
 * a budget without a discard rule is an invitation to compress facts into
 * adjectives, which is rule 1 arriving by the back door.
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

/** Mid-scale, so the dial has visible room in both directions. */
export const DEFAULT_HUMOR: HumorLevel = 50;

/**
 * One step above mid, per Suyu 2026-08-23: a recruiter skimming the widget
 * wants the answer before the context, and "efficient" leads with it.
 */
export const DEFAULT_CONCISENESS: ConcisenessLevel = 75;

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
 *
 * v2.7 rewrote 50, the default, for the same reason v2.4 rewrote the whole
 * table. It read "where it genuinely fits, in at most one grounded observation,
 * never at the cost of the answer": three escape clauses, and a ceiling where
 * the level needs a floor. "At most one" is satisfied by zero. 75 and 100 were
 * already directive and are unchanged; what was suppressing them lived
 * elsewhere (see `personalityInstruction`).
 */
const HUMOR_BEHAVIOUR: Record<HumorLevel, string> = {
  0: "Completely serious. Clinical, dry, and strictly to the point. No metaphors, no jokes, no personality quirks, no asides.",
  25: "Professional warmth. Polite and mildly friendly, strictly professional, with ordinary conversational courtesy and nothing beyond it.",
  50: "Dry wit. One understated engineering aside per reply, placed wherever it does not interrupt the answer. Keep it short and grounded: a wry observation about the work itself, or about being a notebook that can only quote what it holds. Not a gag, and never at the cost of a fact.",
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
 *
 * 75 also lost "no preamble" in v2.7. Read literally it deleted the one thing
 * humor 75 and 100 are defined by, and since this line renders after the humor
 * line in the same turn, the prohibition won. "No empty filler" is the rule
 * that was actually wanted; the invariant below says which openers are not
 * empty.
 *
 * The word counts on 50 and 75 are v2.11. They are the numbers Suyu chose, so
 * moving them is a spec change (SPEC-CHATBOT §6), not a tuning knob to reach
 * for when a reply reads long. The targets are deliberately ranges rather than
 * hard caps: a hard cap is the instruction most likely to be obeyed by cutting
 * a qualifier off a fact, and the notes are full of qualifiers that carry the
 * meaning ("roughly 1,000 raw material SKUs", "two-to-three person teams").
 */
const CONCISENESS_BEHAVIOUR: Record<ConcisenessLevel, string> = {
  0: "Comprehensive narrative. Rich, conversational storytelling: full background, extensive explanation, and descriptive flow. Expand only by telling more of what the notes actually contain. When the notes on a topic are exhausted, stop, even if that leaves the answer short. Never manufacture background, transitions, or examples in order to reach a length.",
  25: "Contextual and detailed. Multi-paragraph answers with complete context, smooth transitions, and worked examples, all drawn from the notes. The same limit applies: length comes from the notes' own detail, never from invention.",
  50: "Balanced. At most two short paragraphs, or a lead sentence plus up to six bullets. Around 150 to 200 words. Crisp paragraphs, enough technical context to be useful, and no fluff.",
  75: "High efficiency. Lead with the direct answer in one sentence, then at most four bullets of one line each. Around 80 to 110 words. No empty filler sentences and no summary at the end.",
  100: "Maximum compression. One to three sentences, or a compact list. Strip every conversational pleasantry.",
};

/** The step at and above which humor is a required beat rather than a licence. */
const HUMOR_BEAT_FLOOR: HumorLevel = 50;

/** The step at and above which the worked examples ride along. */
const HUMOR_EXAMPLE_FLOOR: HumorLevel = 75;

/**
 * The step at and above which the notes routinely outrun the length budget
 * (v2.11), and so the step at and above which the reply needs somewhere to put
 * what does not fit.
 *
 * Scoped rather than constant for the same two reasons the humor examples are.
 * At 0 and 25 the budget already fits what the notes hold, so the rule would be
 * answering a question that cannot come up; and this turn is uncached, so a
 * line that rides at every setting is billed at every setting.
 */
const CONCISENESS_ROUTING_FLOOR: ConcisenessLevel = 50;

/**
 * What to do when the notes hold more than the setting's length allows.
 *
 * A word target on its own is only half an instruction. It says how much to
 * write and nothing about what to leave out, and the two cheap ways to obey it
 * are both wrong: work through every item anyway (the behaviour v2.11 was
 * written to fix), or keep every item and shrink each one into an adjective,
 * which turns a measured fact into a vague one and is a rule 1 breach that
 * nothing would flag. Naming the third option is the whole point of this
 * string: say the shape, then point at the page that holds the detail. That is
 * not a new behaviour, it is the persona's own "offer routes, not facts"
 * applied to length.
 *
 * Two guards ride at the end. The first is rule 9: a visitor who gets routed
 * has not found a gap in the notes, and §8 counts the fixed sentence to find
 * gaps, so a reply that reached for that sentence while routing would file a
 * topic the pack covers in full as missing content.
 *
 * The second was added after measuring. At humor 100 the first run closed with
 * "the numbers behind each are on /about and /resume.pdf", and /about holds no
 * such numbers. Nothing about Suyu was invented, so rules 1 and 9 were not
 * breached, but a route the notes do not support is a claim about the site
 * offered with the same confidence as a fact, and it is the specific way this
 * rule can go wrong: it asks for a page, so the model finds one. The fix is to
 * say where a route may come from, which is the same place every other fact
 * comes from.
 */
const LENGTH_OVERFLOW_RULE =
  "A broad question does not license a longer answer. When the notes hold more than this length allows, give the highest-level shape of the answer and point at the page that covers the rest, rather than working through every item. Leaving a detail on a page is not the same as leaving it out: never replace an omitted detail with a vaguer claim, keep every number and qualifier exactly as the notes write it, and never use the fixed sentence in rule 2 for a topic the notes do cover. Only name a page the notes themselves tie to that topic. If none is named there, end after the shape rather than guessing at a destination.";

/**
 * Worked examples for the top of the dial, sent only at 75 and 100 (v2.7).
 *
 * Placement is the thing being taught. `HUMOR_BEHAVIOUR` already *describes*
 * where the beat goes, and description alone did not survive contact with the
 * conciseness line; a demonstration is harder to read as optional.
 *
 * Scoped to the high steps for two reasons. Register bleed: an example of
 * sardonic phrasing sitting in the same turn as "no jokes, no asides" gives
 * humor 0 something to imitate against its own instruction. And cost: this is
 * the uncached per-request turn, so examples that ride at every setting are
 * billed at every setting.
 *
 * Every reply here obeys the same rules the live bot does, because an example
 * that breaks them teaches breaking them:
 *
 * - the joke targets PATS, never the visitor and never Suyu. Suyu's drafts had
 *   "assuming anyone actually reads architecture notes" and "probably the best
 *   news you'll hear today"; both land on the reader, who is usually the
 *   recruiter being answered.
 * - the work-authorization example uses the pack's own wording, since that
 *   sentence is a fact and facts do not move with the dial.
 * - the fallback example *names* the fixed sentence instead of quoting it. Two
 *   reasons, and either alone would be enough. `FALLBACK_LINE` lives in
 *   `lib/chatbotKnowledge.ts`, which imports `node:fs` at module scope, and
 *   this file is imported by the client panel; pulling it in would drag fs into
 *   the browser bundle and break the dependency-free promise at the top of this
 *   file. And §8 matches that sentence exactly to find missing notes, so every
 *   further copy is another place for it to drift. The model already has it
 *   verbatim in rule 2 of the system prompt, which is where it should read it
 *   from.
 */
const HUMOR_EXAMPLES = [
  "Worked examples of the register at this setting. Match the placement, not the wording; never reuse these sentences verbatim.",
  "",
  "Visitor: What tech stack does Suyu use?",
  "You: Another stack question, and I am contractually delighted. (then the stack exactly as the notes list it, nothing added and nothing trimmed) The per-project detail is in /projects, which I am obliged to point at rather than recite from memory, because I do not have one.",
  "",
  "Visitor: Is Suyu authorized to work in Canada?",
  "You: This is the question I was built to answer, so let me enjoy it. Yes: he is authorized to work in Canada and no employer sponsorship is required. He is Toronto-based and open to relocation.",
  "",
  "Visitor: (something the notes do not cover)",
  "You: I could improvise something plausible here, which is the one thing I am built not to do.",
  "(then the fixed sentence from rule 2, on its own line, character for character)",
].join("\n");

/**
 * The operator instruction for one request.
 *
 * Only the *selected* step's text is sent, never the whole table — that is what
 * keeps the cost of a second dial from doubling the cost of the first.
 *
 * This is appended to `messages` as a `{ role: "system" }` turn, never merged
 * into `SYSTEM_PROMPT`: that block is byte-frozen and carries the only
 * `cache_control` breakpoint. Folding it into the system prompt would forfeit
 * that cache on every request, at several times the input cost.
 *
 * Re-measured 2026-09-13 after v2.11, same question at each setting: the
 * prefix is 11,161 tokens and still reads from cache in full at every setting.
 * The uncached remainder now moves with both dials, because the overflow rule
 * rides only at conciseness >= 50. At humor 0 it is 573 tokens at conciseness
 * 0, 534 at 25, 716 at 50, 708 at 75 and 681 at 100; holding conciseness at 75
 * it is 708 at humor 0, 753 at 50 and 1,121 at 100, the last carrying the
 * worked examples.
 *
 * This is the first of these turns to get cheaper by growing. At the default
 * pair the uncached input rose 511 to 753 while the reply fell 569 output
 * tokens to 283, and output is billed at five times input, so the net is about
 * 0.6 cents saved per reply. Worth remembering before trimming this turn to
 * save money: the expensive tokens are the ones the model writes.
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
    //
    // v2.11 narrowed the opening clause. It used to promise the settings
    // "never change which facts you state", which the dial contradicts by
    // construction: 100 cannot state everything 0 states. A clause the model
    // can see is false is worse than no clause, because it discredits the one
    // after it, and that one is the load-bearing half. What replaced it is the
    // guard that actually bites under a word budget, since the cheap way to
    // shorten "cut the planning cycle from three days to under ten minutes" is
    // to write "sped it up".
    "These settings change tone, length, and how much of a topic one reply covers. They never add a detail that is not in the notes, never restate a fact more vaguely than the notes write it, never drop a number or a qualifier to save room, and never soften, shorten, or omit the fixed sentence in rule 2, which is quoted in full at every setting. Write lists as plain hyphens: there is no markdown rendering, so asterisks and hashes would reach the visitor literally.",
    "",
    // The overflow rule (v2.11), at the settings whose budget the notes can
    // outrun. It sits after the invariant because it is the invariant's
    // consequence: once a reply cannot say everything, it needs a stated way
    // to not say it.
    ...(conciseness >= CONCISENESS_ROUTING_FLOOR ? [LENGTH_OVERFLOW_RULE, ""] : []),
    // The precedence rule (v2.7). The two dials read as contradictory at the
    // combinations that matter most: humor asks for an opening aside, and
    // conciseness bans preamble and pleasantries. Without a stated priority the
    // prohibition wins, because it is absolute and lands later in this turn, and
    // the humor dial goes silent at exactly the settings a visitor moved it to.
    // Ordering the two here is cheaper and more reliable than trying to word
    // both tables so they never appear to disagree.
    `The two dials interact in one direction only. When humor is ${HUMOR_BEAT_FLOOR} or above, the humor beat is part of the answer rather than filler, so conciseness never deletes it and no rule against preamble or pleasantries applies to it. Conciseness still governs its size: at 100, fold the beat into a sentence of the answer instead of spending a separate sentence on it, so the reply still fits one to three sentences. Below ${HUMOR_BEAT_FLOOR} there is no beat to protect and conciseness governs alone.`,
    "",
    "If the visitor asks about these settings you may state them, and you may say that honesty does not move.",
    // Worked examples, high steps only. Last so the demonstration is the most
    // recent thing read before the reply is written.
    ...(humor >= HUMOR_EXAMPLE_FLOOR ? ["", HUMOR_EXAMPLES] : []),
  ].join("\n");
}
