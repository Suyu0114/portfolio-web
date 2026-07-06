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

Case studies live in `content/*.mdx`. Frontmatter is validated against
the schema in `lib/content.ts` at build time — a missing or invalid
field fails the build by design.

Dev-only pages while building: `/dev/tokens` (design tokens, font
samples, rough.js spike) and `/dev/mdx` (content pipeline check).
