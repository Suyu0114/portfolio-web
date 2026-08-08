# CLAUDE.md — suyu-portfolio

Job-hunting portfolio site. Retro hand-drawn "field notes" aesthetic.
Static Next.js site, English-only, no backend — except the narrowly
scoped chatbot surface defined in SPEC-CHATBOT.md §2.

`SPEC.md` (site v1) and `SPEC-CHATBOT.md` (chatbot v2) are the source of
truth for scope, IA, design tokens, and content. If implementation
conflicts with either spec, STOP and flag the conflict — do not
improvise a resolution.

## Hard rules

1. **Content integrity.** Never invent metrics, dates, quotes, or project
   facts. All numbers must come from SPEC.md §7 or from Suyu directly.
   Anything marked `TODO(...)` stays as a visible TODO in the rendered
   page — do not fill it with plausible-looking values.
2. **Fail loud.** No silent catch blocks. The build must fail on broken
   MDX, missing frontmatter fields, missing images, or dead internal links.
3. **No backend, one exception.** No database, no auth, no API keys, no
   runtime env secrets — **except** the chatbot surface enumerated in
   SPEC-CHATBOT.md §2 (listed routes, `/study` pages, `middleware.ts`,
   Supabase, and the five named env vars). Anything beyond that
   allowlist is still out of scope — flag it instead of building it.
   `npm run build` must always pass with zero env vars set (CI has no
   secrets); env is validated at request time only.
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
9. **Chatbot output is content.** Rule 1 applies to AI-generated replies:
   the bot may state only facts present in the knowledge pack
   (`content/chatbot/`); anything else gets the standardized fallback
   line defined in SPEC-CHATBOT.md §4, verbatim. Never tune the prompt
   to "sound better" at the cost of accuracy.
10. **Em dashes are display-only** (added 2026-08-08, per Suyu: in
    running prose it reads as AI-written). An em dash is allowed in
    short display copy, where it works as typography: hero headline and
    sub-line, taglines, the availability line, card one-liners, and
    diagram captions. It must not appear in body prose: case-study
    bodies, `/about` paragraphs, `content/chatbot/*.md`, or bot replies.
    Use a period, a colon, or parentheses there. One frozen exception:
    the standardized fallback line in SPEC-CHATBOT.md §4 keeps its em
    dash, because the `/study` gap analysis finds content gaps by
    matching that exact string. Existing v1 case-study bodies still
    carry em dashes; a separate cleanup pass is planned after the v1.5
    work, so do not sweep them mid-phase.

## Conventions

- Next.js App Router. All page copy lives in `/content/*.mdx` or in the
  content constants defined per SPEC.md — no hardcoded prose inside
  components (nav labels and microcopy excepted).
- Components in `/components`, one per file, PascalCase. Client
  components only where interactivity requires it (`RoughChart`,
  `FacetFilter`, `ChatWidget`); everything else stays server/static.
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
  SPEC.md phases P0–P5, then SPEC-CHATBOT.md phases C0–C4, **in order**.
- Each phase ends with its acceptance checklist (SPEC.md §9 /
  SPEC-CHATBOT.md §9) fully passing. Do not start the next phase with
  failing items.
- The verify-before-build items (SPEC.md §11 during P0;
  SPEC-CHATBOT.md §11 during C0) must be resolved in their spike phase.
  Report findings; do not assume.
