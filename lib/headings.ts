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

/**
 * Splits a body at its `## ` headings, skipping fenced code blocks (a `## `
 * line inside a fence is code, not a heading): the text before the first
 * heading, then one section per heading with the heading's text.
 */
export function splitAtH2(body: string): { heading: string | null; text: string }[] {
  const sections: { heading: string | null; lines: string[] }[] = [{ heading: null, lines: [] }];
  let fence: string | null = null;

  for (const line of body.split(/\r?\n/)) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (fence === null) fence = marker[0];
      else if (marker[0] === fence) fence = null;
    }
    const match = fence === null && !marker ? /^## (.+?)\s*$/.exec(line) : null;
    if (match) sections.push({ heading: match[1], lines: [] });
    else sections[sections.length - 1].lines.push(line);
  }

  return sections.map((s) => ({ heading: s.heading, text: s.lines.join("\n") }));
}

// Collects a body's `## ` headings. Fail loud (CLAUDE.md rule 2): a
// duplicate id would leave one contents link pointing at the wrong heading.
export function getH2Headings(body: string): Heading[] {
  const headings: Heading[] = [];
  const seen = new Set<string>();

  for (const { heading: text } of splitAtH2(body)) {
    if (text === null) continue;
    const id = slugify(text);
    if (seen.has(id)) {
      throw new Error(`getH2Headings: two headings share the id "${id}" ("${text}")`);
    }
    seen.add(id);
    headings.push({ id, text });
  }

  return headings;
}

/**
 * A translation's headings, each with the id of the English heading in its
 * place (SPEC.md §6.3, v1.13), so an anchor is the same in both languages.
 * Fail loud if the two bodies have a different number of headings, or if
 * two translated headings read the same (the h2 finds its id by its text).
 */
export function pairH2Headings(enBody: string, translatedBody: string, where: string): Heading[] {
  const en = getH2Headings(enBody);
  const texts = splitAtH2(translatedBody)
    .map((s) => s.heading)
    .filter((text): text is string => text !== null);
  if (texts.length !== en.length) {
    throw new Error(`${where}: ${texts.length} headings, but the English has ${en.length}`);
  }
  if (new Set(texts).size !== texts.length) {
    throw new Error(`${where}: two headings read the same`);
  }
  return texts.map((text, i) => ({ id: en[i].id, text }));
}
