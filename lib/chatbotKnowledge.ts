import fs from "node:fs";
import path from "node:path";

/**
 * Knowledge pack loader — SPEC-CHATBOT §4.
 *
 * `notes/` is git-ignored, so the Vercel build cannot read it. The bot's
 * knowledge lives in `content/chatbot/`, committed as plain markdown with no
 * frontmatter. Mirrors the fail-loud style of `lib/content.ts`: the five files
 * are read at module init and a missing or empty one throws, which fails the
 * build rather than shipping a bot with a hole in its notes (CLAUDE.md rule 2).
 */

const KNOWLEDGE_DIR = path.join(process.cwd(), "content", "chatbot");

/** The five files of SPEC-CHATBOT §4, in system-prompt order. */
const KNOWLEDGE_FILES = [
  "profile.md",
  "projects.md",
  "how-i-work.md",
  "interests.md",
  "faq.md",
] as const;

export type KnowledgeFile = (typeof KNOWLEDGE_FILES)[number];

export type KnowledgeSection = {
  file: KnowledgeFile;
  body: string;
};

/**
 * Standardized fallback line — SPEC-CHATBOT §4, used verbatim.
 *
 * The system prompt instructs the bot to answer with this exact sentence
 * whenever something is not in the pack, and the admin analyzer (§8) matches on
 * it to surface content gaps. Changing this string breaks gap detection, so it
 * is a spec change, not a copy edit.
 */
export const FALLBACK_LINE =
  "That's not in my notes — you can ask Suyu directly at suyu0229@gmail.com.";

/**
 * The near misses that mean the same sentence — SPEC-CHATBOT §4, §8 (v2.8).
 *
 * Deliberately narrow: the whole sentence must be present, and only the
 * contraction and the dash may vary. Measured on the fallback provider
 * 2026-09-09, which returned "That is not in my notes — ..." at the default
 * dials and "That is not in my notes - ..." at conciseness 100, while
 * reproducing the line exactly at humor 100. The system prompt already states
 * the rule and carries an explicit exception to the em-dash ban for it
 * (`lib/chatbotPrompt.ts`); Opus 5 honours that and Gemini 3.5 Flash Lite does
 * not reliably, which is instruction-following failing to transfer between
 * models rather than a prompt that needs more adjectives.
 *
 * Anything looser would be worse than the bug. A pattern that matched a
 * roughly similar sentence could convert an ordinary answer into a content-gap
 * report, inventing a gap that the model never flagged.
 */
const FALLBACK_LINE_VARIANT =
  /That(?:'s|’s| is) not in my notes\s*[—–-]\s*you can ask Suyu directly at suyu0229@gmail\.com\.?/g;

/**
 * Restores byte-identity of the fixed sentence in a logged reply.
 *
 * §8 finds content gaps with an exact `includes(FALLBACK_LINE)`, so a
 * paraphrase does not degrade the gap list, it disappears from it: the failure
 * is silent, which is the class CLAUDE.md rules 1 and 9 call out. The route
 * already writes this constant itself when a provider *refuses*, so the server
 * guaranteeing the invariant is the established pattern here, not a new one.
 *
 * Applied to the logged copy only. The reply has already streamed to the
 * visitor by the time this runs, and the differences are a contraction and a
 * dash in a fixed operator sentence, so what they read still says exactly what
 * it should. The caller logs loudly whenever this fires, so the drift stays
 * observable instead of being quietly absorbed.
 */
export function canonicalizeFallbackLine(reply: string): {
  content: string;
  normalized: boolean;
} {
  if (reply.includes(FALLBACK_LINE)) {
    return { content: reply, normalized: false };
  }
  const content = reply.replace(FALLBACK_LINE_VARIANT, FALLBACK_LINE);
  return { content, normalized: content !== reply };
}

function loadSections(): KnowledgeSection[] {
  return KNOWLEDGE_FILES.map((file): KnowledgeSection => {
    const filePath = path.join(KNOWLEDGE_DIR, file);

    let raw: string;
    try {
      raw = fs.readFileSync(filePath, "utf8");
    } catch {
      throw new Error(
        `Missing chatbot knowledge file: content/chatbot/${file}. ` +
          `All five files in SPEC-CHATBOT §4 are required.`,
      );
    }

    const body = raw.trim();
    if (body.length === 0) {
      throw new Error(
        `Empty chatbot knowledge file: content/chatbot/${file}. ` +
          `Every file in SPEC-CHATBOT §4 must have content.`,
      );
    }

    return { file, body };
  });
}

/** All five sections, read once at module init. */
export const KNOWLEDGE_SECTIONS: readonly KnowledgeSection[] =
  Object.freeze(loadSections());

/**
 * The five files concatenated, in §4 order. This is the block that carries the
 * `cache_control` marker in the system prompt — it must stay byte-stable across
 * requests, so nothing dynamic (dates, visitor context) may be appended here.
 */
export const KNOWLEDGE_PACK: string = KNOWLEDGE_SECTIONS.map(
  (section) => section.body,
).join("\n\n---\n\n");
