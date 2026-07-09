/**
 * Site copy — SPEC.md §1, §5, §6.1. Content constants per CLAUDE.md
 * conventions; no prose hardcoded inside components. Featured cards
 * come from content/*.mdx frontmatter, not from here.
 */
export const HERO = {
  headline: "field notes",
  // Positioning statement (SPEC §1); final wording tweakable at P3.
  intro:
    "I'm Suyu — I build data products end-to-end, from raw pipelines to statistical models to the interfaces people actually use.",
  subline: "Toronto · data engineering / analytics / full-stack",
  doodleCaption: "calibration, hand-checked",
} as const;

/** Contact details — supplied by Suyu 2026-07-08 (SPEC §10). */
export const CONTACT = {
  // TODO(§10): availability line for the contact strip.
  availabilityTodo: "TODO(§10): availability",
  email: "suyu0229@gmail.com",
  github: "https://github.com/Suyu0114",
  linkedin: "https://www.linkedin.com/in/suyu-cheng",
} as const;

export const FOOTER = {
  handNote: "drawn with rough.js",
} as const;
