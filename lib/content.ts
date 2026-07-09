import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { FACET_TAGS } from "@/lib/facets";

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

    return { frontmatter: parsed.data, body: content, file };
  });

  return entries.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getProjectBySlug(slug: string): ProjectEntry {
  const entry = getAllProjects().find((e) => e.frontmatter.slug === slug);
  if (!entry) {
    throw new Error(`No case study found for slug "${slug}"`);
  }
  return entry;
}
