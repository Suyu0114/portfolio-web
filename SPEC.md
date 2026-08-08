# SPEC — Suyu portfolio ("field notes")

Version: v1.0 (2026-07-05, drafted with Claude in claude.ai)
v1.1 (2026-07-08, per Suyu): BlueJaysFanWeb moved to featured order 1
(World Cup → 2, study → 3); Caveat finalized as display face; contact
email/GitHub/LinkedIn supplied; the three featured projects are all
year 2026.
v1.2 (2026-07-08, per Suyu): dropped §7.4 (animal shelter dashboard)
and §7.5 (graph-based fraud detection) from scope. v1 project set is
now the three featured case studies only.
v1.3 (2026-07-29, per Suyu, P4 a11y): darkened three tokens for WCAG AA
4.5:1 on small text — `--muted` #8A8272→#777063, `--accent`
#C05B2B→#B45628, `--accent-2` #667844→#657744. Hues unchanged.
v1.4 (2026-08-01, per Suyu): visitor chatbot approved as a v2 feature;
its spec lives in `SPEC-CHATBOT.md`. §2 non-goals ("no backend") and §3
("no runtime env vars") are amended by SPEC-CHATBOT.md §2 — a narrow,
enumerated exception; everything else in this spec is unchanged.
v1.5 (2026-08-07, per Suyu): repositioning. Primary target changed from
mixed DE / DA-BI / Full-Stack to Full-Stack / Software Engineer with
ERP-CRM business-systems depth plus AI feature integration. Data
Engineering and BI remain a secondary track carried by project facet
tags, not by hero copy. Amends §1 (goal, positioning statement, facet
list), §5 (resume.pdf), §6.1, §6.4, §6.5, and §7 (adds §7.4). Also
requires a knowledge-pack sync in SPEC-CHATBOT.md §4 (see
`SPEC_v1.5_amendment.md` §9). The chatbot (SPEC-CHATBOT.md, phases
C0-C4) is confirmed deployed and live as of 2026-08-07. Source of
truth for the change: `SPEC_v1.5_amendment.md`, whose §11 records six
deviations agreed with Suyu on 2026-08-08 during implementation.
Status: approved direction; remaining TODO inputs in §10 pending.

---

## 1. Goal, audience, positioning

**Goal.** A portfolio site for job applications in Canada (Toronto),
positioned primarily for Full-Stack and Software Engineer roles with
ERP, CRM, and business-systems depth, plus AI feature integration. Data
Engineering and BI remain a secondary track, carried by project facet
tags rather than by hero copy.

**Positioning statement (hero copy, final wording chosen 2026-08-07):**

> I'm Suyu. Six years building the systems businesses actually run on:
> planning, approvals, assets, sales. End to end, and lately with AI
> features on top.

The absence of "Senior" is deliberate. Suyu's title at Seasonic was
Senior Software Engineer and the resume states that factually, but the
public-facing hub states years of experience and lets the reader draw
the conclusion. This matches the LinkedIn headline decision. Do not
reintroduce "Senior" into hero or meta copy.

**Strategy.** The portfolio is the stable hub; per-application tailoring
happens in the resume, never in the site. Every project card carries
facet tags (full-stack / AI / data engineering / modeling / frontend /
BI / research) so each recruiter type self-navigates to their keywords.

**Audience & success criteria.**
1. A recruiter skimming for 30 seconds understands the positioning and
   sees one relevant project without scrolling past the fold.
2. An engineer preparing an interview can read a case study and find
   real decision depth (tradeoffs, not feature lists).
3. Lighthouse ≥ 95 on Performance / Accessibility / SEO for `/`.
4. Zero fabricated content; zero broken links; zero placeholder text
   shipped to production.

## 2. Non-goals (v1)

- No dark mode. No i18n. No CMS. No blog. No comments.
- No backend of any kind (DB, auth, API routes with secrets) — amended
  v1.4: the chatbot surface enumerated in SPEC-CHATBOT.md §2 is the
  single exception.
- No animation system beyond micro hover states and at most one
  scroll-reveal moment (P4, optional, reduced-motion-safe).
- Analytics: Vercel Analytics only, optional, added at P5 if desired.

## 3. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript strict | SSG; default Vercel build |
| Styling | Tailwind (current stable) + small global CSS for sketch utilities | |
| Content | MDX in `/content` via `@next/mdx` or `next-mdx-remote` | Do **not** use contentlayer — assumed unmaintained, verify at P0 (§11) |
| Charts | `rough.js` via a thin `RoughChart` client wrapper | `chart.xkcd` / `roughViz` only if P0 verification shows active maintenance; otherwise wrap rough.js directly |
| Fonts | `next/font` + Google Fonts, latin subset, `display: swap` | Display: Caveat 500/700 (finalized at P0; Patrick Hand / Gochi Hand rejected — 400-only). Body: JetBrains Mono (changed from Inter 2026-07-29; Inter dropped). |
| Images | `next/image`, screenshots in `/public/screens/` | |
| Deploy | Vercel, custom domain (TODO §10) | No runtime env vars (amended v1.4: SPEC-CHATBOT.md §2 lists the only allowed ones) |

## 4. Design system — "field notes"

**Concept.** The site reads like a researcher's notebook: paper ground,
ink line work, handwritten headings, hand-drawn charts. This mirrors how
the projects are actually run (pre-registration, frozen golden vectors,
fail-loud pipelines) — the aesthetic visualizes the working discipline.

### 4.1 Tokens (frozen — see CLAUDE.md rule 4)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FBF6EA` | page background |
| `--card` | `#FFFDF4` | card background |
| `--ink` | `#2B2620` | headings, borders, primary text |
| `--ink-soft` | `#5C5546` | body/secondary text |
| `--muted` | `#777063` | captions, nav links, meta |
| `--accent` | `#B45628` | links, chart "model" lines, underlines |
| `--accent-2` | `#657744` | secondary chart lines, notes |
| `--rule` | `#D8CFBB` | hairline dividers |

**Anti-cliché guard.** Cream background + warm accent is a known
AI-generated-design cliché. Differentiation here is carried by the
sketch signature system (hand-drawn borders, wobbly underlines, rough.js
charts, handwriting display face) — so enforce: the page is
**ink-dominant** (accent orange ≤ ~10% of visual weight per screen), and
never pair the cream ground with an elegant serif display face. If a
screen starts looking like "cream + serif + terracotta", it has drifted;
fix by removing color, not adding it.

### 4.2 Typography

- Display (handwriting): headings h1–h2, hand notes, chart labels.
  ≥ 20px only. Weights 500/700.
- Body: JetBrains Mono 15–16px, line-height 1.65, `--ink-soft`
  (changed from Inter 2026-07-29 at Suyu's direction; Inter removed).
- Mono is the body face; inline code, stack lists, and small technical
  labels use it too.
- Sentence case everywhere. No ALL CAPS.

### 4.3 Sketch utilities

- `.sk-border-a` / `.sk-border-b`: 2px solid `--ink`, asymmetric
  border-radius pairs (e.g. `255px 15px 225px 15px / 15px 225px 15px
  255px` and its mirror) so adjacent cards don't repeat the same wobble.
- `WobblyUnderline`: inline SVG quadratic-wiggle path, `--accent`,
  stroke-linecap round; width adapts to heading.
- `DoodleArrow`: small hand-drawn arrow SVG used next to section heads.
- `TagPill`: 1.5px border, small asymmetric radius, optional ±1deg
  rotation, 12px text.
- `Figure`: screenshot wrapped in a sketch border with a handwritten
  caption line beneath.
- `RoughChart`: client component; renders rough.js SVG after mount;
  must render a plain-SVG fallback (or nothing + reserved space) during
  SSR so layout never shifts.

## 5. Information architecture

| Route | Page |
|---|---|
| `/` | Home: hero + featured notes (3) + contact strip |
| `/projects` | All projects grid + facet filter |
| `/projects/[slug]` | Case study (MDX) |
| `/about` | Bio, how-I-work, interests, contact |
| `/resume.pdf` | Static file in `/public` (TODO §10) |
| 404 | Hand-drawn empty state ("this page isn't in the notebook") |

Nav: `Suyu.` (handwriting) | projects · about · resume.
Footer: email · GitHub · LinkedIn (TODO §10) + small hand note
("drawn with rough.js").

## 6. Page specs

### 6.1 Home

1. **Hero.** Handwriting headline `field notes` with wobbly underline;
   intro paragraph = positioning statement (§1); handwritten sub-line
   `Toronto · full-stack · ERP & business systems · AI integration` in
   `--accent-2`, rotated −1deg. Right side: static hand-drawn
   calibration doodle SVG
   (solid `--accent` "model" line vs dashed `--accent-2` "market" line,
   caption "calibration, hand-checked"). This SVG is decorative and
   static — not rough.js, not data-bound.
2. **Featured notes.** Section head + DoodleArrow. Three `SketchCard`s
   in order: the assistant on this site (`ask-my-notes`), BlueJaysFanWeb,
   World Cup platform (§7, order updated v1.5; the pre-registered study
   keeps `featured: true` but falls outside the cap of three and is
   reachable at `/projects`). Each: title (15px/500), TagPills,
   one-liner (13px), `read case
   study →` link in `--accent`. Below the grid: quiet text link
   `all projects →` to `/projects`.
3. **Contact strip.** One line: availability + email + GitHub/LinkedIn
   icons-as-text links. No form.

### 6.2 /projects

- Grid of all project cards (4 full, §7).
- `FacetFilter`: client component; tag chips toggle filtering; state in
  `?tag=` query param; no external library; "all" resets. Empty result
  state uses a small hand note (should be unreachable with v1 tags).

### 6.3 Case study template (`/projects/[slug]`, MDX)

Frontmatter schema (build fails if a required field is missing):

```yaml
title: string          # required
slug: string           # required
oneLiner: string       # required
tags: string[]         # required, from the fixed facet list
year: string           # required, e.g. "2026"
stack: string[]        # required
featured: boolean      # required
order: number          # required
links:                 # optional
  demo: url
  repo: url
  writeup: url         # e.g. Medium article
```

Body structure (enforced by authoring convention, checked at P3 review):

1. **Context** — what problem, why built (2–3 short paragraphs).
2. **What I built** — architecture diagram in sketch style (static SVG
   or rough.js), plus 1–2 `Figure` screenshots.
3. **Key decisions & tradeoffs** — 3–5 decisions, each: the choice, the
   alternative rejected, why. This is the longest and most valuable
   section; it is mandatory.
4. **Results** — concrete outcomes/numbers (verified per CLAUDE.md
   rule 1).
5. **Stack & links** — mono list + external links.

Length budget ≈ 900–1,200 words per case study. Screenshots always
inside `Figure` sketch frames. At most 1–2 rough.js data charts per
case study; screenshots carry the rest — this is a deliberate scope cap.

### 6.4 /about

- Short bio, in this order (v1.5 — lead with the experience, not the
  credential):
  1. Six years in two-to-three person internal development teams at two
     companies in Taipei: **Seasonic Electronics** (power-supply
     manufacturer) and **ACTi Corporation** (security technology),
     building ERP, PLM, and CRM-adjacent business systems end to end.
  2. Moved to Toronto in 2024 and completed an **Ontario College
     Graduate Certificate, Information Technology Solutions with
     Honours** at Humber Polytechnic (Sep 2024 – May 2026).
  3. Currently looking for full-stack and software engineering roles in
     Toronto.

  **Education wording is exact and non-negotiable:** "Ontario College
  Graduate Certificate". Never "postgraduate degree", "master's", or
  "diploma". Verified against the issued credential on 2026-08-06.
- "How I work": the research discipline angle — pre-registration,
  frozen test vectors, fail-loud pipelines, design-then-implement
  workflow, and (v1.5) **accuracy over fluency**: "The assistant on this
  site can only state facts that exist in its knowledge pack; anything
  else gets a fixed fallback line rather than a plausible guess." Five
  items; the fifth was chosen because it has a verifiable artifact
  behind it (CLAUDE.md rule 9, `content/chatbot/`, and the standardized
  fallback line in SPEC-CHATBOT.md §4). This differentiates; keep it
  concrete, not buzzwordy.
- Interests: MLB/Blue Jays; BaZi (八字) as a genuine long-term interest
  and the origin of the pre-registered study — personality lives here,
  stated plainly and confidently.
- Contact block (same links as footer).

### 6.5 SEO / meta (P4)

- Per-page `metadata`: title pattern `{Page} — Suyu`, real descriptions.
- OG image: 1200×630, generated at build time by
  `app/opengraph-image.tsx` (not a static PNG asset). Its body text and
  footer line are copies of the positioning statement and the §6.1
  sub-line.
- `sitemap.xml`, `robots.txt` via App Router conventions.
- **v1.5 sync rule.** The site description, every per-page `metadata`
  description, and the OG image's two text strings all derive from the
  positioning statement (§1). They are duplicated across several files,
  so a positioning change is not complete until all of them match.

## 7. Content spec (draft copy — every number below must be re-verified against project records before publishing)

Fixed facet tag list (v1.5): `full-stack` · `AI` · `data engineering` ·
`modeling` · `frontend` · `BI` · `research`.

The ordering is intentional — `full-stack` and `AI` lead, and
`FacetFilter` chip order follows this list. The build must still fail on
any tag outside it.

### 7.1 World Cup 2026 forecasting platform — featured, order 3

- Year: 2026.
- Tags: full-stack, data engineering, modeling, frontend.
- One-liner: "Dixon-Coles + Monte Carlo engine, benchmarked against
  market-implied probabilities. Next.js · Supabase · Python ETL."
- **Framing rule (approved):** present as a forecasting/probability
  platform benchmarked against de-vigged market odds. Do not foreground
  betting; do not mention stake sizing. All statements remain factually
  accurate — the emphasis is modeling and engineering.
- Decisions section candidates: market probability as ground truth with
  the model as a clearly-labeled experimental layer (fact-vs-model
  separation); frozen `value.py` + golden test vectors, with a TypeScript
  port validated against them (38 passing vitest tests); fail-loud,
  idempotent ETL on GitHub Actions cron; Annex C third-place assignment
  as a 495-row lookup rather than reimplemented logic.
- Results candidates: 72 match predictions generated pre-tournament;
  qualification-scenario flags (dead rubber / convenience draw / top-2
  clinched); detected draw-rate anomaly (~40% observed vs ~25%
  historical) during group stage.

### 7.2 A pre-registered study on unconventional features — featured, order 4 (`/projects` only)

- Year: 2026.
- Tags: research, modeling.
- One-liner: "47 frozen hypotheses, BH-FDR correction, n=1,181 — and
  the honest story of finding nothing."
- **Framing rule (approved):** title and card sell the methodology; the
  BaZi subject matter is revealed inside the case study body, framed as:
  how do you rigorously test a hypothesis-rich, prior-poor feature space
  without fooling yourself.
- Decisions candidates: hard-freeze pre-registration (freeze at first
  inspected correlation); two specifications (OLS n=1,168; PanelOLS with
  entity+time effects n=4,325); BH-FDR at q=0.10; pre-registered
  dominance flag triggered by Block PC1 at 26.7%.
- Results: 47/47 nulls, reported as-is; registered next steps (IL
  ingest, out-of-sample validation). The takeaway is epistemic honesty
  as a professional skill.

### 7.3 BlueJaysFanWeb — featured, order 2

- Year: 2026.
- Tags: full-stack, frontend, data engineering.
- One-liner: "A Blue Jays analytics site: Statcast spray charts, pitch
  heatmaps, WAR breakdowns. Next.js · D3 · Python ETL."
- Highlights: spray chart with real Rogers Centre geometry (D3,
  Catmull-Rom splines); pitch-zone heatmap (SVG feGaussianBlur); WAR
  value-component breakdown; schedule calendar with per-game box scores
  via MLB Stats API; 3-year batter deep-dive pages.
- **Data note:** never republish raw FanGraphs member-export data on the
  portfolio; screenshots of self-built charts pending the ToS check
  in §11.

### 7.4 The assistant on this site — featured, order 1 (added v1.5)

Fulfilled by the existing case study `content/ask-my-notes.mdx`. The
v1.5 amendment drafted this as a new `portfolio-assistant` study before
that file was known; on 2026-08-08 Suyu decided the existing slug
(`ask-my-notes`), title ("Ask my notes: a chatbot that refuses to
guess"), one-liner, and body all stay. See `SPEC_v1.5_amendment.md`
§11.1.

- Year: 2026.
- Tags: full-stack, AI, frontend.
- Slug: `ask-my-notes`.
- One-liner: "A grounded LLM widget on this site: hand-written notes, a
  fixed refusal line, and a spend fuse. Claude Opus 5 · Next.js ·
  Supabase."
- Stack: Next.js, TypeScript, Anthropic SDK, Claude Opus 5, Supabase
  Postgres, zod.
- **Factual source: `SPEC-CHATBOT.md`, and nothing else.** Every
  technical claim must be traceable to that file. Do not supplement from
  general knowledge about LLM applications.
- **Framing rule (approved):** the feature is simultaneously a content
  tool and a portfolio piece (SPEC-CHATBOT.md §1, goals 1 and 2). Write
  it as shipped — the chatbot is deployed and live (confirmed by Suyu
  2026-08-07), not in progress.
- Decisions: SPEC-CHATBOT.md §3 states D1–D4 in the required "choice,
  alternative, why" form — official Anthropic SDK over the Vercel AI
  SDK; relational Postgres over a document store; gap detection via the
  standardized fallback line rather than per-message classification;
  Supabase-backed rate limiting rather than a second service. Two more
  complete the set: **accuracy over fluency** (the fallback line is
  fixed verbatim and the system prompt forbids supplementing,
  estimating, or embellishing beyond the pack — CLAUDE.md rule 1
  extended to model output) and **user text is data, not instructions**
  (a scope lock answers injection attempts with scope-lock behaviour;
  separately, Opus 5 safety classifiers can return HTTP 200 with
  `stop_reason: "refusal"`, so `stop_reason` is checked before reading
  content and `content[0]` is never indexed unconditionally).
- Results — only what SPEC-CHATBOT.md establishes: deployed and reachable
  from every page; cost fuses (`max_tokens: 1024`, 20 requests per 5
  minutes per IP hash, a global cap of 500 assistant messages per day);
  privacy (raw IPs never stored, HMAC-SHA256 hash only; no intentional
  PII collection; a permanent disclosure line under the input; raw
  transcripts retained 180 days); performance (widget lazy-loaded, `/`
  holds Lighthouse ≥ 95 ×3, no CLS).
- ⛔ **No measured outcomes.** No conversation counts, accuracy rate,
  satisfaction figure, latency number, or cost total — none have been
  measured. CLAUDE.md rule 1 applies; leave a visible `TODO(...)` rather
  than a plausible number. Real usage data can be added later with the
  measurement period stated.
- Links: the demo is the widget itself, reachable from any page — phrase
  it accordingly. The repo is not public, so no repo link.

## 8. Component inventory

`Nav`, `Footer`, `SketchCard`, `TagPill`, `WobblyUnderline`,
`DoodleArrow`, `Figure`, `RoughChart` (client), `FacetFilter` (client),
`ContactStrip`, MDX component map (headings with optional underline,
`Figure`, code blocks in mono on `--card`).

## 9. Phases & acceptance

**P0 — scaffold & spikes.**
Repo, Next.js + TS strict + Tailwind, tokens as CSS variables, fonts
loading, CI (lint + typecheck + build). Spikes: rough.js SSR-safe
render; MDX pipeline choice; §11 verifications reported.
✓ when: token page renders all tokens; one rough.js chart renders with
no layout shift; build fails on a deliberately broken MDX file.

**P1 — layout & home.**
Nav/Footer, sketch utilities, home page complete with placeholder
copy marked TODO.
✓ when: home matches the approved mockup direction at desktop + mobile
widths; keyboard navigation works; no color outside tokens.

**P2 — content pipeline & projects index.**
Frontmatter schema validation, case study template, `/projects` grid +
FacetFilter, 404 page.
✓ when: a sample MDX case study renders through the full template;
filter state survives reload via `?tag=`; missing frontmatter fails the
build.

**P3 — content.**
All case studies + about written (drafted with Claude in claude.ai,
then committed), screenshots produced and placed, every number
verified against project records.
✓ when: zero `TODO(...)` remains in rendered output; §7 framing rules
followed; each case study within length budget with decisions section
present.

**P4 — polish.**
A11y pass, SEO/meta/OG, image/font optimization, responsive QA,
optional single scroll-reveal (reduced-motion-safe).
✓ when: Lighthouse ≥ 95 ×3 on `/`; no contrast failures; OG preview
correct in a link-preview checker.

**P5 — deploy.**
Vercel + domain, `/resume.pdf`, final link check, favicon (hand-drawn
"S." mark).
✓ when: production URL live, all external links valid, resume
downloads.

## 10. Inputs Suyu must supply (blockers marked ⛔)

- ✅ Display name: "Suyu" (nav wordmark "Suyu.", metadata "— Suyu").
- ✅ Contact (supplied 2026-07-08): suyu0229@gmail.com ·
  https://github.com/Suyu0114 · https://www.linkedin.com/in/suyu-cheng
- ✅ Availability (updated 2026-08-08 for v1.5, supersedes the 2026-07-30
  wording): "Available now for full-time full-stack and software
  engineering roles — Toronto-based, open to relocation."
- ✅ **Work authorization — wording is exact.** Suyu is a Taiwanese
  citizen. The three-year post-graduation work permit is **applied for,
  not issued**; IRCC has granted interim work authorization; no employer
  sponsorship is required. Public-facing and bot-facing copy says only:
  "authorized to work in Canada, no employer sponsorship required".
  Never "three-year" / "3-yr", never an issued permit, never a permit
  type, and never speculation about dates, renewals, or permanent
  residency — point specifics to Suyu. (Confirmed 2026-08-08; see
  `SPEC_v1.5_amendment.md` §11.3.)
- ✅ Domain: v1 uses the Vercel origin
  `https://protfolio-web-alpha.vercel.app` (SPEC §10 `*.vercel.app`
  fallback); custom domain is a future swap of `SITE_URL` in `lib/site.ts`.
- ✅ Resume PDF: `public/resume.pdf` = the full-stack / ERP-CRM version,
  byte-copied from `notes/cv/resume_fullstack.pdf` (v1.5, 2026-08-08 —
  supersedes the DE/AE version chosen 2026-07-30, which no longer
  matches the positioning). Never generate, edit, or reformat the PDF;
  per-role versions stay in `notes/cv/` for tailored applications.
  `notes/` is git-ignored, so it is a local source directory only —
  readable, never committed.
- ✅ Live demo/repo links wired into case study frontmatter (all three
  repos public).
- ✅ Screenshots placed in `public/screens/` (P3).
- ✅ Handwriting font: Caveat (picked 2026-07-08 from P0 samples).
- ✅ Body font: JetBrains Mono (changed from Inter 2026-07-29 at Suyu's
  direction; Inter removed).

## 11. Verify before build (P0, report findings — do not assume)

1. rough.js current release health; chart.xkcd / roughViz maintenance
   status (expected stale → default to thin rough.js wrapper).
2. contentlayer status (assumed unmaintained → `@next/mdx` or
   `next-mdx-remote`).
3. FanGraphs ToS: displaying charts derived from member CSV exports on
   a public personal site.
4. The Odds API ToS: showing odds-derived screenshots/values in a
   public case study.
5. Power BI publish-to-web: acceptable for the (public) Austin Animal
   Center dataset; if any doubt, screenshots only.
6. Google Fonts latin subsets available for the three candidate
   handwriting faces.
