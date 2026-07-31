# suyu-portfolio

Job-hunting portfolio site with a retro hand-drawn "field notes"
aesthetic. Static Next.js (App Router), TypeScript strict, Tailwind,
English-only, no backend.

- `SPEC.md` — source of truth for scope, IA, design tokens, and content.
- `CLAUDE.md` — hard rules and conventions for implementation.

## Commands

```bash
npm run dev        # dev server
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run build      # static production build (fails loud on bad content)
```

## Content

Case studies live in `content/*.mdx`, rendered through the component map
in `lib/mdxComponents.tsx` (`Figure` screenshots, per-project architecture
flows, rough.js data charts). Frontmatter is validated against the schema
in `lib/content.ts` at build time, and `Figure` verifies each screenshot
exists under `public/` — a missing or invalid field, or a missing image,
fails the build by design.

Screenshots live in `public/screens/`, named `<slug>-<view>.png`.

The dev-only `/dev/tokens` page (design tokens, font samples, rough.js
spike) was removed at the end of P4. `app/robots.ts` still disallows
`/dev/` per SPEC §6.5.
