# SPEC v1.5 amendment — repositioning

Date: 2026-08-07
Author: Suyu, with Claude in claude.ai (per CLAUDE.md Workflow: design
decisions are made in claude.ai, this repo implements them).
Status: **approved**. This file is the source of truth for the change.

**How to use this file.** Apply every section below to `SPEC.md` (and,
where noted, to `SPEC-CHATBOT.md`). Then implement. Do not improvise
beyond what is written here. If anything below conflicts with `SPEC.md`,
`SPEC-CHATBOT.md`, or `CLAUDE.md`, STOP and flag it.

**Read §11 first.** This file was drafted in claude.ai against stale repo
knowledge. §11 "Implementation notes" records seven deviations agreed with
Suyu on 2026-08-08 during implementation planning. Where §11 conflicts
with an earlier section, **§11 wins**; §§1–10 are otherwise unchanged and
still binding. Affected sections carry an inline pointer.

---

## 0. Version block entry

Add to the version list at the top of `SPEC.md`:

```
v1.5 (2026-08-07, per Suyu): repositioning. Primary target changed from
mixed DE / DA-BI / Full-Stack to Full-Stack / Software Engineer with
ERP-CRM business-systems depth plus AI feature integration. Data
Engineering and BI remain a secondary track carried by project facet
tags, not by hero copy. Amends §1 (goal, positioning statement, facet
list), §5 (resume.pdf), §6.1, §6.4, §6.5, and §7 (adds §7.4). Also
requires a knowledge-pack sync in SPEC-CHATBOT.md §4 (see §9 below).
The chatbot (SPEC-CHATBOT.md, phases C0-C4) is confirmed deployed and
live as of 2026-08-07.
```

---

## 1. §1 Goal (replace)

**Remove:**

> A portfolio site for job applications in Canada (Toronto), supporting
> mixed targeting across Data Engineer / Data Analyst-BI / Full-Stack
> Developer roles.

**Replace with:**

> A portfolio site for job applications in Canada (Toronto), positioned
> primarily for Full-Stack and Software Engineer roles with ERP, CRM,
> and business-systems depth, plus AI feature integration. Data
> Engineering and BI remain a secondary track, carried by project facet
> tags rather than by hero copy.

---

## 2. §1 Positioning statement (replace)

**Remove:**

> I'm Suyu — I build data products end-to-end, from raw pipelines to
> statistical models to the interfaces people actually use.

**Replace with (final wording, chosen by Suyu 2026-08-07):**

> I'm Suyu. Six years building the systems businesses actually run on:
> planning, approvals, assets, sales. End to end, and lately with AI
> features on top.

Note: the phrase "Senior" is deliberately absent. Suyu's title at
Seasonic was Senior Software Engineer and the resume states that
factually, but the public-facing hub states years of experience and lets
the reader draw the conclusion. This matches the LinkedIn headline
decision. Do not reintroduce "Senior" into hero or meta copy.

---

## 3. §1 Fixed facet list (replace)

**Remove:** `data engineering / modeling / frontend / BI / research`

**Replace with:** `full-stack / AI / data engineering / modeling / frontend / BI / research`

Ordering is intentional: `full-stack` and `AI` lead. `FacetFilter` chip
order follows this list. The build must still fail on any tag outside
the list.

Existing case studies keep all their current tags and gain one each:

| Case study | Add |
|---|---|
| BlueJaysFanWeb | `full-stack` |
| World Cup 2026 platform | `full-stack` |
| Pre-registered study | (no change) |

---

## 4. §5 Information architecture — `/resume.pdf`

> ⚠ Path corrected — see §11.2. The source file is
> `notes/cv/resume_fullstack.pdf`.

`/public/resume.pdf` currently holds the Data Engineering / Analytics
Engineering resume variant, which no longer matches the positioning.
Replace it with the full-stack / ERP-CRM variant, which Suyu has placed
at `notes/resume_fullstack.pdf`.

Copy the file. Do not generate, edit, or reformat the PDF. If
`notes/resume_fullstack.pdf` is absent, STOP and say so rather than
leaving the stale file in place silently.

**On `notes/`.** As stated in SPEC-CHATBOT.md §4, `notes/` is
git-ignored: the Vercel build cannot read it. That constraint is
unchanged and correct. It is a local source directory only. You may read
from it, and you must not commit it or move source material out of it
into a tracked path. The only tracked outputs of this amendment are
`SPEC.md`, `SPEC-CHATBOT.md`, `content/chatbot/*.md`, the new case-study
MDX, `public/resume.pdf`, and the component/metadata changes.

## 5. §6.1 Home — hero sub-line (replace)

**Remove:** `Toronto · data engineering / analytics / full-stack`

**Replace with:** `Toronto · full-stack · ERP & business systems · AI integration`

Everything else in §6.1 is unchanged: the handwriting `field notes`
headline with wobbly underline, the static hand-drawn calibration doodle
SVG and its caption ("calibration, hand-checked"), the three featured
`SketchCard`s, the `all projects →` link, and the contact strip.

The home page still shows exactly three featured cards. See §8 for the
resulting order change.

---

## 6. §6.4 /about (revise)

### 6.1 Bio paragraph — rewrite

The current bio leads with "recent Humber Polytechnic graduate
certificate", which understates six years of professional work. Lead
with the experience instead. Required content, in this order:

1. Six years in two-to-three person internal development teams at two
   companies in Taipei: **Seasonic Electronics** (power-supply
   manufacturer) and **ACTi Corporation** (security technology), building
   ERP, PLM, and CRM-adjacent business systems end to end.
2. Moved to Toronto in 2024 and completed an **Ontario College Graduate
   Certificate, Information Technology Solutions with Honours** at
   Humber Polytechnic (Sep 2024 – May 2026).
3. Currently looking for full-stack and software engineering roles in
   Toronto.

**Education wording is exact and non-negotiable:** "Ontario College
Graduate Certificate". Do not write "postgraduate degree", "master's",
or "diploma". Verified against the issued credential on 2026-08-06.

### 6.2 "How I work" — extend, do not rewrite

Keep the existing four items (pre-registration, frozen test vectors,
fail-loud pipelines, design-then-implement). Add a fifth:

> **Accuracy over fluency.** The assistant on this site can only state
> facts that exist in its knowledge pack; anything else gets a fixed
> fallback line rather than a plausible guess.

This item is chosen because it has a verifiable artifact behind it
(CLAUDE.md rule 9, `content/chatbot/`, and the standardized fallback
line in SPEC-CHATBOT.md §4), unlike a general claim about process.

### 6.3 Interests — unchanged

MLB / Blue Jays and BaZi stay exactly as they are.

---

## 7. §6.5 SEO / meta (sync)

> ⚠ The OG-image carve-out below is moot — see §11.5. The OG image is
> generated by code, not a PNG asset.

The site description, per-page `metadata` descriptions, and the OG
description currently derive from the old positioning statement. Update
all of them to match §2 above. This is easy to miss because the copy is
duplicated across `metadata` exports and the OG image asset text.

The OG image PNG itself is out of scope for this amendment unless it
contains the old positioning sentence as rendered text. If it does,
flag it; do not regenerate the image without a decision from Suyu.

---

## 8. §7 — add §7.4 "The assistant on this site"

> ⛔ **Superseded in part — see §11.1.** The case study already exists as
> `content/ask-my-notes.mdx`. Do **not** create a new
> `portfolio-assistant` slug, title, one-liner, or body. §8.1's `tags`,
> `year`, `stack`, `featured`, `order`, §8.2's featured order, and the
> two missing decisions in §8.3 still apply — to the existing file.

The site currently has no case study about AI work. Three case studies
cover data engineering, modeling, and research. Since AI integration is
now part of the positioning, it needs a case study of its own.

**Status: the chatbot is deployed and live (confirmed by Suyu
2026-08-07).** Write it as shipped, not as in progress.

**Factual source: `SPEC-CHATBOT.md`, and nothing else.** Every technical
claim in this case study must be traceable to that file. Do not
supplement from general knowledge about LLM applications.

### 8.1 Frontmatter

```yaml
title: The assistant on this site
slug: portfolio-assistant
oneLiner: A visitor chatbot that can only tell you things it can prove.
tags: [full-stack, AI, frontend]
year: "2026"
stack: [Next.js, TypeScript, Anthropic SDK, Claude Opus 5, Supabase Postgres, zod]
featured: true
order: 1
```

### 8.2 Resulting featured order

| Order | Case study | Home page |
|---|---|---|
| 1 | The assistant on this site | yes |
| 2 | BlueJaysFanWeb | yes |
| 3 | World Cup 2026 platform | yes |
| 4 | Pre-registered study | no (moves to `/projects` only) |

This is the accepted tradeoff: the home page cap of three cards (§6.1)
is unchanged, so the pre-registered study drops off the home page and
remains reachable at `/projects`.

### 8.3 Body (follows the §6.3 template, 900–1,200 words)

**1. Context.** Visitors (recruiters, engineers) ask things a resume
does not answer. The bot needs to answer them without inventing
anything. The feature is simultaneously a content tool and a portfolio
piece (SPEC-CHATBOT.md §1, goals 1 and 2).

**2. What I built.** Claude Opus 5 through the official
`@anthropic-ai/sdk`; `cache_control: {type: "ephemeral"}` on a
byte-frozen system prompt for prompt caching, with dynamic per-page
context placed in the user turn so the cached prefix is never disturbed;
a route handler returning a chunked plain-text stream of deltas, rendered
progressively in the widget; a knowledge pack of five committed markdown
files (`profile`, `projects`, `how-i-work`, `interests`, `faq`) loaded by
`lib/chatbotKnowledge.ts` at module init, which throws and fails the
build if any file is missing or empty; Supabase Postgres with three
tables (`chat_sessions`, `chat_messages`, `chat_insights`), RLS enabled
with no public policies and all access through the service key from
server code; and a private `/study` admin area gated by `middleware.ts`.

Include one sketch-style architecture diagram per §6.3 item 2.

**3. Key decisions & tradeoffs.** Mandatory and the longest section.
SPEC-CHATBOT.md §3 already states D1–D4 in the required "choice,
alternative, why" form; carry them over and add context. Two further
decisions from §4 and §7 complete the set.

- **D1 — official Anthropic SDK, not the Vercel AI SDK.** `useChat`
  starts faster but adds a wrapper dependency and hides the API surface
  this feature exists to demonstrate. Rejected: `ai` +
  `@ai-sdk/anthropic`.
- **D2 — relational Postgres, not NoSQL.** Chat logs are naturally
  sessions-to-messages and tiny in volume; the insight queries are SQL
  aggregations. Rejected: a document store.
- **D3 — gap detection via a standardized fallback line, not per-message
  classification.** The bot answers unknowns with one fixed sentence and
  the analyzer finds content gaps by matching it, keeping the hot path
  to a single model call. Rejected: a second classification call per
  message, at double cost and latency.
- **D4 — Supabase-backed rate limiting, not another service.** One
  storage dependency rather than two; at this traffic an indexed count
  query is enough. Rejected: `@upstash/ratelimit`.
- **D5 — accuracy over fluency.** The fallback line is fixed verbatim
  and the system prompt forbids supplementing, estimating, or
  embellishing beyond the pack. This extends CLAUDE.md rule 1 to model
  output, and is the site's honesty position expressed as a product
  constraint rather than a claim.
- **D6 — user text is data, not instructions.** A scope lock keeps the
  bot on Suyu-related topics and injection attempts are answered with
  scope-lock behavior rather than compliance. Separately, Opus 5 safety
  classifiers can return HTTP 200 with `stop_reason: "refusal"`, so
  `stop_reason` is checked before reading content and `content[0]` is
  never indexed unconditionally.

**4. Results.** State only what SPEC-CHATBOT.md establishes:

- Deployed and publicly reachable from every page.
- Cost fuses: `max_tokens: 1024`; 20 requests per 5 minutes per IP hash;
  a global cap of 500 assistant messages per day.
- Privacy: raw IPs are never stored (HMAC-SHA256 hash only); no
  intentional PII collection; a permanent disclosure line sits under the
  input; raw transcripts are retained 180 days.
- Performance: the widget is lazy-loaded, `/` holds Lighthouse ≥ 95
  across Performance, Accessibility, and SEO, and the widget introduces
  no CLS.

⛔ **Write no measured outcomes.** No conversation counts, no accuracy
rate, no satisfaction figure, no latency number, no cost total. None of
these have been measured. CLAUDE.md rule 1 applies. If a number would
make the section stronger, leave a visible `TODO(...)` instead. Real
usage data can be added later, with the measurement period stated.

**5. Stack & links.** Mono list per §6.3. The demo link is the widget
itself, reachable from any page; phrase it accordingly. The repo is not
public, so no repo link.

---

## 9. SPEC-CHATBOT.md §4 — knowledge pack sync (required)

The repositioning is incomplete without this. The knowledge pack is what
the bot says out loud; if it is not updated, a visitor asking "what does
Suyu do?" receives the old data-engineering framing while the hero above
says something else.

| File | Current | Change to |
|---|---|---|
| `profile.md` | §4 table lists the source as "CV (DE/AE version primary)" | Full-stack / ERP-CRM CV becomes the primary source (`notes/CV_FS_ERPCRM_v2.md`); the DE/AE variant is supplementary only. Update the §4 source column accordingly. |
| `profile.md` | education wording | "Ontario College Graduate Certificate, Information Technology Solutions with Honours", Sep 2024 – May 2026 |
| `faq.md` | §4 table says "3-yr Canadian work permit" | ⛔ **Resolved with Suyu 2026-08-08 — see §11.3.** Never state a permit status, a permit type, or a term of years. Exact wording, verbatim: **"authorized to work in Canada, no employer sponsorship required"**. |
| `projects.md` | "the three case studies" | Four case studies, including the assistant (`ask-my-notes`, not `portfolio-assistant` — see §11.1), with its `/projects/[slug]` link |
| `how-i-work.md` | four items | Add the accuracy-over-fluency item from §6.2 above |

The loader is fail-loud, so editing these files is safe at build time.
The risk is editing content without changing framing: the build passes
while the public message stays inconsistent.

---

## 10. Explicitly out of scope for v1.5

Do not change any of the following as part of this amendment. Each would
be a separate spec decision.

- Design tokens, fonts, and the sketch utility system (CLAUDE.md rule 4).
  No new color, no new font, no gradients, drop shadows, or textures.
- Dark mode (rule 6) and i18n (rule 7) remain out of scope.
- The chatbot runtime surface: the route, page, and env-var allowlist in
  SPEC-CHATBOT.md §2 is untouched. Documenting the chatbot in a case
  study does not license changing it.
- The home page card count stays at three (§6.1).
- The `calibration, hand-checked` doodle and its caption stay.
- The three existing case-study bodies. Only their frontmatter `tags`
  and `order` change.
- SPEC.md §2 non-goals, §3 tech stack, §6.2 `/projects`, §6.3 template,
  and §8 component inventory.

---

## 11. Implementation notes

Date: 2026-08-08
Author: Suyu, with Claude in this repo during implementation planning.
Status: **approved**. Where these notes conflict with §§0–10, these notes
win. Everything §§0–10 says that is not contradicted here still stands.

Reason for this section: §§0–10 were drafted in claude.ai against stale
repo knowledge, and two items (§9 `faq.md`, plus an availability sentence
nobody had looked at) were deliberately left open for Suyu. Seven items
were resolved on 2026-08-08 and are recorded here rather than silently
absorbed into the implementation.

### 11.1 The AI case study already exists — §8 is superseded in part

`content/ask-my-notes.mdx` is already live and featured (currently
`order: 4`). §8 was written as if no such study existed.

**Keep** its slug (`ask-my-notes`), title ("Ask my notes: a chatbot that
refuses to guess"), one-liner, and body. **Do not** create a
`portfolio-assistant` slug or rewrite the body against §8.3's outline.

**Apply** §8's intent to that existing file:

- frontmatter → `tags: [full-stack, AI, frontend]`, `order: 1`,
  `stack: [Next.js, TypeScript, Anthropic SDK, Claude Opus 5, Supabase Postgres, zod]`
- §8.2's featured order is unchanged in effect: assistant 1,
  BlueJaysFanWeb 2, World Cup 3, pre-registered study 4 (off the home
  page, still at `/projects`)
- add the sketch architecture diagram §8.3 item 2 calls for
- add the two decisions the existing body is missing: **D2** relational
  Postgres over a document store, and **D5** accuracy over fluency

`SPEC.md` §7.4 records `ask-my-notes` as fulfilling this section, with a
note that the slug and title were kept by decision on 2026-08-08.

### 11.2 Resume source path — §4 correction

The file is at **`notes/cv/resume_fullstack.pdf`**, not
`notes/resume_fullstack.pdf`. Verified present 2026-08-08. Everything
else in §4 holds: byte-copy to `public/resume.pdf`, never generate or
edit the PDF, and STOP rather than leave the stale file in place.

### 11.3 Work-authorization wording — §9 `faq.md` resolved

Suyu, 2026-08-08: Suyu is a Taiwanese citizen, authorized to work in
Canada, and no employer sponsorship is required. The status detail
behind this ruling is deliberately not recorded in this repository,
which is public.

Public-facing and bot-facing wording, everywhere, verbatim:

> authorized to work in Canada, no employer sponsorship required

⛔ Never write a term of years such as "three-year" / "3-yr", never
describe the permit's status, never name a permit type, and never
speculate about dates, renewals, or permanent residency — point
specifics to Suyu. This applies
to `content/chatbot/faq.md`, `content/chatbot/interests.md` (the
immigration decline bullet), `lib/siteContent.ts` (`ABOUT.bio`), and
`SPEC.md` §10.

### 11.4 Availability sentence — new, not in §§0–10

The existing availability line predates the repositioning and contradicts
the new hero. Approved replacement, verbatim:

> Available now for full-time full-stack and software engineering roles — Toronto-based, open to relocation.

Applies to the contact strip, `/about`, and the knowledge pack's
availability answer.

### 11.5 The OG image is code — §7 carve-out is moot

§7 defers the OG image on the assumption it is a PNG asset. It is not: it
is generated at build time by `app/opengraph-image.tsx`. Its two text
strings are therefore part of the ordinary metadata sync — the
positioning sentence (without the "I'm Suyu." lead, matching its current
style) and the new sub-line. No other visual change; the carve-out needs
no decision from Suyu.

### 11.6 SPEC.md §6.2 card count — one word, despite §10

§10 puts SPEC.md §6.2 out of scope, but §6.2 says the `/projects` grid
holds "3 full" project cards and §7 now lists four — the spec would
contradict itself. Suyu decided 2026-08-08: **change the numeral only**
(`3 full` → `4 full`). Everything else in §6.2 — the `FacetFilter`
behaviour, the `?tag=` state, the empty-result hand note — is untouched.
This is a fact sync with §7, not a design decision about `/projects`.

### 11.7 SPEC.md §6.3 budget raised, and a house style rule

Two decisions taken 2026-08-08 while adding D2 and D5 to the assistant
case study.

**Length and decision count.** The body was already at 1,180 words, the
old ceiling being 1,200, and the amendment requires two more decisions.
Rather than cut verified content to fit, Suyu raised §6.3's budget to
**≈ 900–1,400 words** and its decision count to **3–6**. §10 lists §6.3
as out of scope; this supersedes that for these two numbers only. The
template itself (the five-part body structure) is unchanged.

Applied to `ask-my-notes.mdx`: "Raw IPs are never stored" is folded into
the rate-limiting decision, since the HMAC is part of the same choice.
That lands the study at six decisions.

**Em dashes are display-only.** Suyu, 2026-08-08: in running prose the
em dash reads as AI-written. Now CLAUDE.md rule 10 — allowed in short
display copy (hero headline and sub-line, taglines, the availability
line, card one-liners, diagram captions), forbidden in body prose
(case-study bodies, `/about` paragraphs, `content/chatbot/*.md`, bot
replies). Consequences here:

- The §11.4 availability sentence **keeps its em dash**. It is a
  tagline, not prose.
- ⛔ The standardized fallback line (SPEC-CHATBOT.md §4) keeps its em
  dash and stays **frozen**. The `/study` gap analysis finds content
  gaps by matching that exact string, so rewording it orphans every gap
  already logged.
- Code comments and the spec files are not visitor-facing; left alone.
- The three v1 case-study bodies still carry ~35 em dashes. Out of scope
  per §10, and Suyu deferred the sweep (2026-08-08) to a separate plan
  after this amendment's six work groups are done. Do not sweep them
  mid-phase.

**Later that day, the rule was narrowed.** Once the sweep was scoped,
Suyu chose consistency over the display-copy carve-out: figure captions,
chart titles, diagram rails, and card one-liners are swept too, and the
system prompt with them. CLAUDE.md rule 10 now allows the em dash only
as a name or title separator, plus the availability line. This paragraph
records the change; the decision above is left as it was written.
