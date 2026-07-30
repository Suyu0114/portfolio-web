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
Status: approved direction; remaining TODO inputs in §10 pending.

---

## 1. Goal, audience, positioning

**Goal.** A portfolio site for job applications in Canada (Toronto),
supporting mixed targeting across Data Engineer / Data Analyst-BI /
Full-Stack Developer roles.

**Positioning statement (hero copy, final wording tweakable at P3):**

> I'm Suyu — I build data products end-to-end, from raw pipelines to
> statistical models to the interfaces people actually use.

**Strategy.** The portfolio is the stable hub; per-application tailoring
happens in the resume, never in the site. Every project card carries
facet tags (data engineering / modeling / frontend / BI / research) so
each recruiter type self-navigates to their keywords.

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
- No backend of any kind (DB, auth, API routes with secrets).
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
| Deploy | Vercel, custom domain (TODO §10) | No runtime env vars |

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
   `Toronto · data engineering / analytics / full-stack` in `--accent-2`,
   rotated −1deg. Right side: static hand-drawn calibration doodle SVG
   (solid `--accent` "model" line vs dashed `--accent-2` "market" line,
   caption "calibration, hand-checked"). This SVG is decorative and
   static — not rough.js, not data-bound.
2. **Featured notes.** Section head + DoodleArrow. Three `SketchCard`s
   in order: BlueJaysFanWeb, World Cup platform, pre-registered study
   (§7, order updated v1.1). Each: title (15px/500), TagPills, one-liner (13px), `read case
   study →` link in `--accent`. Below the grid: quiet text link
   `all projects →` to `/projects`.
3. **Contact strip.** One line: availability + email + GitHub/LinkedIn
   icons-as-text links. No form.

### 6.2 /projects

- Grid of all project cards (3 full, §7).
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

- Short bio: recent Humber Polytechnic graduate certificate, Toronto,
  what he's looking for.
- "How I work": the research discipline angle — pre-registration,
  frozen test vectors, fail-loud pipelines, design-then-implement
  workflow. This differentiates; keep it concrete, not buzzwordy.
- Interests: MLB/Blue Jays; BaZi (八字) as a genuine long-term interest
  and the origin of the pre-registered study — personality lives here,
  stated plainly and confidently.
- Contact block (same links as footer).

### 6.5 SEO / meta (P4)

- Per-page `metadata`: title pattern `{Page} — Suyu`, real descriptions.
- OG image: one static hand-drawn-style PNG for v1 (1200×630);
  `@vercel/og` per-page generation is a later nice-to-have, not v1.
- `sitemap.xml`, `robots.txt` via App Router conventions.

## 7. Content spec (draft copy — every number below must be re-verified against project records before publishing)

Fixed facet tag list: `data engineering` · `modeling` · `frontend` ·
`BI` · `research`.

### 7.1 World Cup 2026 forecasting platform — featured, order 2

- Year: 2026.
- Tags: data engineering, modeling, frontend.
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

### 7.2 A pre-registered study on unconventional features — featured, order 3

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

### 7.3 BlueJaysFanWeb — featured, order 1

- Year: 2026.
- Tags: frontend, data engineering.
- One-liner: "A Blue Jays analytics site: Statcast spray charts, pitch
  heatmaps, WAR breakdowns. Next.js · D3 · Python ETL."
- Highlights: spray chart with real Rogers Centre geometry (D3,
  Catmull-Rom splines); pitch-zone heatmap (SVG feGaussianBlur); WAR
  value-component breakdown; schedule calendar with per-game box scores
  via MLB Stats API; 3-year batter deep-dive pages.
- **Data note:** never republish raw FanGraphs member-export data on the
  portfolio; screenshots of self-built charts pending the ToS check
  in §11.

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
- ✅ Availability (supplied 2026-07-30): "Available now for full-time
  data engineering, analytics, and full-stack roles — Toronto-based,
  open to relocation." (Suyu: Taiwanese citizen, 3-yr Canadian work
  permit, open to relocation beyond Toronto.)
- ✅ Domain: v1 uses the Vercel origin
  `https://protfolio-web-alpha.vercel.app` (SPEC §10 `*.vercel.app`
  fallback); custom domain is a future swap of `SITE_URL` in `lib/site.ts`.
- ✅ Resume PDF: `public/resume.pdf` = the DE/AE version (chosen 2026-07-30
  as the best match to the site's end-to-end positioning; per-role
  versions stay in `notes/cv/` for tailored applications).
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
