/**
 * Case-study heading ids — SPEC.md §6.3 (v1.6 page chrome). The MDX h2
 * mapping and the contents line both derive ids from `slugify`, so a
 * contents link can never point at an id its heading didn't get.
 * No fs import, so any component can use it.
 */

export type Heading = { id: string; text: string };

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) {
    throw new Error(`slugify: "${text}" has no characters usable in an id`);
  }
  return slug;
}

// Collects a body's `## ` headings, skipping fenced code blocks (a `## `
// line inside a fence is code, not a heading). Fail loud (CLAUDE.md
// rule 2): a duplicate id would leave one contents link pointing at the
// wrong heading.
export function getH2Headings(body: string): Heading[] {
  const headings: Heading[] = [];
  const seen = new Set<string>();
  let fence: string | null = null;

  for (const line of body.split(/\r?\n/)) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (fence === null) fence = marker[0];
      else if (marker[0] === fence) fence = null;
      continue;
    }
    if (fence !== null) continue;

    const match = /^## (.+?)\s*$/.exec(line);
    if (!match) continue;

    const text = match[1];
    const id = slugify(text);
    if (seen.has(id)) {
      throw new Error(`getH2Headings: two headings share the id "${id}" ("${text}")`);
    }
    seen.add(id);
    headings.push({ id, text });
  }

  return headings;
}
