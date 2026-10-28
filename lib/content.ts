import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { FALLBACK_LINE } from "@/lib/chatbotKnowledge";
import { FACET_TAGS } from "@/lib/facets";
import { getH2Headings, pairH2Headings, splitAtH2, type Heading } from "@/lib/headings";
import type { Locale } from "@/lib/i18n";
import { assertNoEmDash, assertSameNumbers } from "@/lib/translationChecks";

export { FACET_TAGS };

/** Frontmatter schema — SPEC.md §6.3. Unknown keys are rejected. */
const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    oneLiner: z.string().min(1),
    tags: z.array(z.enum(FACET_TAGS)).min(1),
    year: z.string().regex(/^\d{4}$/),
    stack: z.array(z.string().min(1)).min(1),
    featured: z.boolean(),
    order: z.number().int(),
    links: z
      .object({
        demo: z.url().optional(),
        repo: z.url().optional(),
        writeup: z.url().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type ProjectFrontmatter = z.infer<typeof frontmatterSchema>;

export type ProjectEntry = {
  frontmatter: ProjectFrontmatter;
  /** Raw MDX body (without frontmatter). */
  body: string;
  file: string;
  /** The body's `## ` headings, with the ids the contents line links to. */
  headings: Heading[];
};

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Reads and validates every case study. Fail loud (CLAUDE.md rule 2):
 * any missing/invalid frontmatter throws, which fails the build.
 */
export function getAllProjects(): ProjectEntry[] {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort();

  if (files.length === 0) {
    throw new Error(`No .mdx case studies found in ${CONTENT_DIR}`);
  }

  const entries = files.map((file): ProjectEntry => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid frontmatter in content/${file}:\n${z.prettifyError(parsed.error)}`,
      );
    }

    const expectedSlug = file.replace(/\.mdx$/, "");
    if (parsed.data.slug !== expectedSlug) {
      throw new Error(
        `Slug/filename mismatch in content/${file}: slug is "${parsed.data.slug}", expected "${expectedSlug}"`,
      );
    }

    return { frontmatter: parsed.data, body: content, file, headings: getH2Headings(content) };
  });

  return entries.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

/**
 * A translated case study's frontmatter — SPEC.md §6.3 (v1.13): the title
 * and one-liner only. Everything else is the English file's, so a
 * translation can never restate a fact differently. `extraNumbers` names
 * the English word behind each number only the translation writes in
 * digits (lib/translationChecks.ts).
 */
const translatedFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    oneLiner: z.string().min(1),
    extraNumbers: z.record(z.string().regex(/^\d/), z.string().min(1)).optional(),
  })
  .strict();

/** The JSX components a body uses, in order: figures, diagrams, charts. */
function componentSequence(body: string): string[] {
  return [...body.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)].map((m) => m[1]);
}

function figureSources(body: string): string[] {
  return [...body.matchAll(/<Figure\b[^>]*?\bsrc="([^"]+)"/g)].map((m) => m[1]);
}

function count(text: string, phrase: string): number {
  return text.split(phrase).length - 1;
}

/**
 * Reads the case studies translated into `locale`, from content/<locale>/,
 * and checks each against its English source (SPEC.md §7.5). Fail loud:
 * a case study missing on either side, a section, figure or visual that
 * doesn't line up, a number the English states that the translation lost
 * (section by section), or an em dash outside the quoted refusal line all
 * throw, which fails the build.
 */
function getTranslatedProjects(locale: Exclude<Locale, "en">): ProjectEntry[] {
  const dir = path.join(CONTENT_DIR, locale);
  const english = getAllProjects();
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).sort()
    : [];
  const expected = english.map((e) => e.file).sort();
  if (files.join("\0") !== expected.join("\0")) {
    throw new Error(
      `content/${locale}/ must translate exactly the English case studies: has ${files.join(", ") || "none"}, expected ${expected.join(", ")}`,
    );
  }

  return english.map((en): ProjectEntry => {
    const where = `content/${locale}/${en.file}`;
    const raw = fs.readFileSync(path.join(dir, en.file), "utf8");
    const { data, content } = matter(raw);

    const parsed = translatedFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter in ${where}:\n${z.prettifyError(parsed.error)}`);
    }
    const { title, oneLiner, extraNumbers = {} } = parsed.data;

    assertSameNumbers(en.frontmatter.title, title, `${where} title`);
    assertSameNumbers(en.frontmatter.oneLiner, oneLiner, `${where} oneLiner`);
    assertNoEmDash(`${title}\n${oneLiner}`, `${where} frontmatter`);

    const headings = pairH2Headings(en.body, content, where);
    const enSections = splitAtH2(en.body);
    const sections = splitAtH2(content);
    sections.forEach((section, i) => {
      const name = section.heading ?? "(before the first heading)";
      assertSameNumbers(enSections[i].text, section.text, `${where} § ${name}`, extraNumbers);
    });

    if (componentSequence(content).join(",") !== componentSequence(en.body).join(",")) {
      throw new Error(`${where}: its figures, diagrams and charts differ from the English, or are in another order`);
    }
    if (figureSources(content).join(",") !== figureSources(en.body).join(",")) {
      throw new Error(`${where}: its screenshots differ from the English`);
    }
    // The refusal line is quoted as PATS says it, in English (SPEC-CHATBOT
    // §4), and is the one em dash a translation may carry.
    if (count(content, FALLBACK_LINE) !== count(en.body, FALLBACK_LINE)) {
      throw new Error(`${where}: the refusal line must be quoted exactly as the English quotes it`);
    }
    assertNoEmDash(content, where, [FALLBACK_LINE]);

    return {
      frontmatter: { ...en.frontmatter, title, oneLiner },
      body: content,
      file: en.file,
      headings,
    };
  });
}

/** The case studies as `locale` shows them, sorted by order (SPEC v1.13). */
export function getProjects(locale: Locale): ProjectEntry[] {
  switch (locale) {
    case "en":
      return getAllProjects();
    default:
      return getTranslatedProjects(locale);
  }
}

export function getProject(locale: Locale, slug: string): ProjectEntry {
  const entry = getProjects(locale).find((e) => e.frontmatter.slug === slug);
  if (!entry) {
    throw new Error(`No ${locale} case study found for slug "${slug}"`);
  }
  return entry;
}
