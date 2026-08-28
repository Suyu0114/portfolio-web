# CLAUDE.md — suyu-portfolio

Job-hunting portfolio site. Retro hand-drawn "field notes" aesthetic.
Static Next.js site, English-only, no backend — except the narrowly
scoped chatbot surface defined in SPEC-CHATBOT.md §2.

`SPEC.md` (site, currently v1.5) and `SPEC-CHATBOT.md` (chatbot,
currently v2.7) are the source of truth for scope, IA, design tokens,
and content. `SPEC_v1.5_amendment.md` is the source of truth for the
v1.5 repositioning specifically; its outcome is already folded into
SPEC.md's v1.5 version block, so read it only for the rationale or for
the seven implementation deviations in its §11. If implementation
conflicts with any of the three, STOP and flag the conflict — do not
improvise a resolution.

## Hard rules

1. **Content integrity. IMPORTANT: this rule and rule 9 are the only two
   whose breach is silent** — nothing errors, nothing goes red, the site
   just states something untrue about a real person's work. Never invent
   metrics, dates, quotes, or project facts. All numbers must come from
   SPEC.md §7 or from Suyu directly. Anything marked `TODO(...)` stays as
   a visible TODO in the rendered page — do not fill it with
   plausible-looking values.
2. **Fail loud.** No silent catch blocks. The build fails on broken MDX
   and missing or invalid frontmatter (`lib/content.ts`), and on an image
   missing from a `Figure` (`components/Figure.tsx`). Dead internal links
   and other missing `public/` assets are caught by `npm run check`
   (`scripts/check-links.mjs`), which CI runs before the build. Keep
   those gates passing rather than loosening them.
3. **No backend, one exception.** No database, no auth, no API keys, no
   runtime env secrets — **except** the chatbot surface enumerated in
   SPEC-CHATBOT.md §2 (listed routes, `/study` pages, `middleware.ts`,
   Supabase, and the env vars enumerated there — that list has grown
   since, so read it rather than trusting a count here). Anything beyond that
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
9. **Chatbot output is content. IMPORTANT: silent when broken, like
   rule 1.** Rule 1 applies to AI-generated replies:
   the bot may state only facts present in the knowledge pack
   (`content/chatbot/`); anything else gets the standardized fallback
   line defined in SPEC-CHATBOT.md §4, verbatim. Never tune the prompt
   to "sound better" at the cost of accuracy.
10. **Em dashes separate names, not clauses** (added and narrowed
    2026-08-08, per Suyu: in running prose the em dash reads as
    AI-written). Allowed only as a name or title separator: the
    `{Page} — Suyu` metadata pattern, `SITE_NAME`, the OG label and
    `alt`, and a `Name — descriptor` metadata description such as the
    one in `app/about/page.tsx`. Plus the availability line, which Suyu
    approved with its em dash. Everywhere else a visitor can read, use a
    period, colon,
    semicolon, or parentheses instead: case-study bodies, `/about`
    paragraphs, figure captions, chart titles, diagram rails, card
    one-liners, `content/chatbot/*.md`, bot replies, and the system
    prompt in `lib/chatbotPrompt.ts`. Two frozen exceptions: the
    standardized fallback line (SPEC-CHATBOT.md §4) in **both** of its
    copies, `content/ask-my-notes.mdx` and `lib/chatbotKnowledge.ts`,
    because the `/study` gap analysis matches that exact string; and the
    `Avoid the em dash (—)` instruction in `lib/chatbotPrompt.ts`, where
    the glyph is the subject of the sentence. Code comments are not
    visitor-facing and are out of scope.

## Conventions

- Next.js App Router. All page copy lives in `/content/*.mdx` or in the
  content constants defined per SPEC.md — no hardcoded prose inside
  components (nav labels and microcopy excepted).
- Components in `/components`, one per file, PascalCase. Client
  components only where interactivity requires it; everything else stays
  server/static. Grep `"use client"` for the current set rather than
  trusting a list here. One thing that grep will not tell you:
  `RoughChart` has had no consumer since `/dev/tokens` was deleted, but
  SPEC §3, §4.3 and §8 still inventory it, so removing it is a spec
  change, not cleanup — leave it in place.
- Sketch utilities are shared, never ad-hoc: use `.sk-border-a` /
  `.sk-border-b` classes and the `WobblyUnderline` / `DoodleArrow`
  components. Do not hand-roll new wobble styles per page.
- Rotation accents stay within ±1.5deg. No gradients, no drop shadows,
  no texture images — the hand-drawn feel comes from line work only.
- Accessibility baseline: visible focus states everywhere, alt text on
  every image, body-text contrast ≥ 4.5:1, `prefers-reduced-motion`
  respected for any animation.
- Images: `next/image` only; screenshots live in `/public/screens/`.
- Never name a file under `notes/` `CLAUDE.md`. That directory holds
  verbatim copies of three other repos' instruction files as P3 source
  material, and the filename alone makes Claude Code load them as live
  rules that contradict this one. They were renamed to
  `PROJECT-CONTEXT.md` on 2026-08-24; rename any new material the same
  way as it is copied in.
- Commits: one phase concern per commit, imperative subject line.

## Workflow

- Design decisions happen with Suyu in claude.ai; this repo implements
  SPEC.md phases P0–P5, then SPEC-CHATBOT.md phases C0–C9, **in order**.
- Each phase ends with its acceptance checklist (SPEC.md §9 /
  SPEC-CHATBOT.md §9) fully passing. Do not start the next phase with
  failing items.
- The verify-before-build items (SPEC.md §11 during P0;
  SPEC-CHATBOT.md §11 during C0) must be resolved in their spike phase.
  Report findings; do not assume.
