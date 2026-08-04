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
