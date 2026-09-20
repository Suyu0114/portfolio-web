# suyu-portfolio

A job-hunting portfolio site with a retro hand-drawn "field notes"
aesthetic, and a chatbot that is not allowed to guess.

**Live:** https://suyu-portfolio.vercel.app
**Writing about it:** https://medium.com/@suyu0229

The visible half is a static Next.js site: four case studies in MDX,
rendered through hand-drawn sketch components. The interesting half is
the assistant behind the "ask my notes" button. It answers questions
about my work from a 4,300-word pack of notes I wrote by hand, and when
a question falls outside that pack it says so in one fixed sentence
rather than improvising something plausible. Most of the engineering
here went into making that refusal reliable.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS v4, frozen design tokens, no dark mode by design |
| Content | MDX with Zod-validated frontmatter |
| Assistant | Claude Opus 5 (`@anthropic-ai/sdk`), Gemini 3.5 Flash Lite as fallback |
| Storage | Supabase Postgres |
| Alerts | Resend |
| Hosting | Vercel |

## Architecture decisions worth defending

**No RAG, no vector database.** The entire knowledge pack is read from
`content/chatbot/*.md` and concatenated into the system prompt
(`lib/chatbotKnowledge.ts`, `lib/chatbotPrompt.ts`). At 4,300 words the
whole corpus fits in the context window many times over, so retrieval
would add an embedding store, a chunking strategy and a similarity
threshold in exchange for a strictly worse guarantee: retrieval can miss
a relevant chunk, and the model then answers from its own priors. Giving
it everything removes that failure mode entirely. The architecture is
sized to the corpus, not to the trend.

**Prompt caching is what makes that affordable.** The system prompt is
the expensive part of every request and it never changes, so it is sent
with `cache_control: { type: "ephemeral" }` (`lib/providers/anthropic.ts`)
and the cached prefix is reused across turns and across visitors. This
is the single decision that makes running Opus 5 on a personal site
reasonable instead of reckless.

**Deterministic refusal handling.** Anything outside the notes gets one
frozen string, `FALLBACK_LINE`, byte for byte. Not a paraphrase: the
`/study` gap analysis finds holes in my notes by matching that exact
sentence, so a model that politely reworded the refusal would make the
gap disappear from the report rather than show up in it. The server
restores the canonical sentence when a provider paraphrases it. A
failure that is silent is worse than one that is loud, and this is the
place where it would have been silent.

**Honesty is a constant, not a dial.** The assistant exposes humor and
conciseness as adjustable settings. Honesty is rendered into the prompt
the same way they are, but it is `export const HONESTY = 100`
(`lib/chatPersonality.ts`) and there is no code path that lowers it.
A tunable honesty setting would imply a setting at which the thing lies
about me, which is not a product I want to ship.

**Cost control fails closed.** Rate limiting is 20 messages per IP per 5
minutes with a 300-reply daily cap, counted in Postgres. If Supabase
cannot be reached, the check throws rather than waving the request
through, because "we could not verify the limit" must never resolve to
"go ahead" on a path that spends money. Provider failure is handled the
other way around: the Gemini fallback exists so a conversation degrades
instead of 500ing.

## Spec-driven development

`SPEC.md` and `SPEC-CHATBOT.md` are the source of truth, not the code.
Every feature was specified, numbered and approved before it was built,
and every reversal is written into a versioned amendment with the
reasoning that caused it. `CLAUDE.md` holds the hard rules that outlive
any single change: design tokens are frozen, the build fails loud, and
the assistant may state only facts present in the knowledge pack.

That discipline is the most transferable thing in this repository. It is
the habit from six years of building internal ERP and CRM systems, where
a requirement nobody wrote down is a requirement somebody will dispute
later.

## Fail-loud content gates

The build is the test suite.

- `lib/content.ts` validates MDX frontmatter against a Zod schema. Bad or
  missing fields fail the build.
- `components/Figure.tsx` verifies that every referenced screenshot
  exists on disk. A broken image fails the build.
- `scripts/check-links.mjs` catches dead internal links and missing
  `public/` assets.
- `scripts/check-tokens.mjs` enforces the frozen colour and font tokens
  against `app/globals.css`, so a stray hex value cannot slip in.

CI runs `lint`, `typecheck`, `check` and `build` on every pull request,
and holds no secrets.

## Running it

```bash
npm install
npm run dev        # dev server
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run check      # frozen tokens + dead links
npm run build      # production build
```

`npm run build` passes with **zero environment variables set**. Every
variable is read at request time, never at module scope, so CI can build
the site without holding a single secret. The chatbot surface needs
these at runtime, all server-side and none prefixed `NEXT_PUBLIC_`:

`ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`ADMIN_PASSWORD`, `ADMIN_COOKIE_SECRET`, and optionally `GEMINI_API_KEY`
and `RESEND_API_KEY`. See `lib/env.ts`, which is the exhaustive list.

Database schema is in `supabase/schema.sql`.

## Layout

```
app/          routes; everything is static except /api/* and /study/*
components/   one component per file, sketch primitives shared not re-rolled
content/      case studies (*.mdx) and the assistant knowledge pack (chatbot/)
lib/          content loading, env validation, providers, prompt assembly
scripts/      the two build-time checkers
supabase/     schema and maintenance SQL
```

## Licence

Source code is MIT, see [`LICENSE`](LICENSE). The writing, photographs,
résumé and visual design are not covered by it. See
[`NOTICE.md`](NOTICE.md) for what you may reuse and what you should ask
about first.
