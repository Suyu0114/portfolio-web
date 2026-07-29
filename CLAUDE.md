# CLAUDE.md — suyu-portfolio

Job-hunting portfolio site. Retro hand-drawn "field notes" aesthetic.
Static Next.js site, English-only, no backend.

`SPEC.md` is the source of truth for scope, IA, design tokens, and content.
If implementation conflicts with SPEC.md, STOP and flag the conflict —
do not improvise a resolution.

## Hard rules

1. **Content integrity.** Never invent metrics, dates, quotes, or project
   facts. All numbers must come from SPEC.md §7 or from Suyu directly.
   Anything marked `TODO(...)` stays as a visible TODO in the rendered
   page — do not fill it with plausible-looking values.
2. **Fail loud.** No silent catch blocks. The build must fail on broken
   MDX, missing frontmatter fields, missing images, or dead internal links.
3. **No backend.** No database, no auth, no API keys, no runtime env
   secrets. If a feature seems to need one, the feature is out of scope —
   flag it instead of building it.
4. **Design tokens are frozen.** Only the colors and fonts in SPEC.md §4
   may appear. A new color or font is a spec change, not a code change.
5. **Handwriting font is display-only.** The handwriting face (Caveat)
   appears only at ≥ 20px, and never in body copy, tags, or long
   passages. Body, tags, labels, and code are all JetBrains Mono — there
   is no sans/Inter face (removed 2026-07-29); don't reintroduce one
   without a spec change.
6. **No dark mode.** Do not add `prefers-color-scheme` styling. The paper
   aesthetic is light-only by design.
7. **English only.** No i18n scaffolding, no locale routing.
8. **TypeScript strict.** No `any` without a one-line justification comment.

## Conventions

- Next.js App Router. All page copy lives in `/content/*.mdx` or in the
  content constants defined per SPEC.md — no hardcoded prose inside
  components (nav labels and microcopy excepted).
- Components in `/components`, one per file, PascalCase. Client
  components only where interactivity requires it (`RoughChart`,
  `FacetFilter`); everything else stays server/static.
- Sketch utilities are shared, never ad-hoc: use `.sk-border-a` /
  `.sk-border-b` classes and the `WobblyUnderline` / `DoodleArrow`
  components. Do not hand-roll new wobble styles per page.
- Rotation accents stay within ±1.5deg. No gradients, no drop shadows,
  no texture images — the hand-drawn feel comes from line work only.
- Accessibility baseline: visible focus states everywhere, alt text on
  every image, body-text contrast ≥ 4.5:1, `prefers-reduced-motion`
  respected for any animation.
- Images: `next/image` only; screenshots live in `/public/screens/`.
- Commits: one phase concern per commit, imperative subject line.

## Workflow

- Design decisions happen with Suyu in claude.ai; this repo implements
  SPEC.md phases P0–P5 **in order**.
- Each phase ends with its acceptance checklist in SPEC.md §9 fully
  passing. Do not start the next phase with failing items.
- The verify-before-build items in SPEC.md §11 must be resolved during
  P0. Report findings; do not assume.
