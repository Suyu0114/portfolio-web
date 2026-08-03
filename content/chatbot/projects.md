# Projects

Three case studies are written up on the site. Each has a full page — link
visitors to it when they want the detail.

## BlueJaysFanWeb — `/projects/bluejays-fan-web`

A Toronto Blue Jays analytics site: Statcast spray charts, pitch heatmaps,
and WAR breakdowns. Next.js, TypeScript, D3, Supabase Postgres, Python ETL.

A daily scheduled ETL on GitHub Actions cron ingests the MLB Stats API and
Statcast into Postgres with idempotent backfills, powering a deployed
bilingual site.

What is interesting in it:

- A spray chart drawn on real Rogers Centre geometry, in D3 with
  Catmull-Rom splines, rather than a generic diamond.
- A pitch-zone heatmap built with SVG `feGaussianBlur`.
- A WAR breakdown that decomposes the value components rather than showing
  a single number.
- A schedule calendar with per-game box scores from the MLB Stats API.
- Three-year batter deep-dive pages.
- Aggregation happens in the database, not in the browser — the D3
  components take plain JSON rather than a database client, so they stay
  framework-pure and testable.

Live: bluejaysfanweb.vercel.app/en · Code:
github.com/Suyu0114/BlueJaysFanWeb

## World Cup 2026 forecasting platform — `/projects/world-cup-forecasting`

A forecasting and probability platform for the 2026 World Cup, benchmarked
against market-implied probabilities. Next.js, Supabase, Python ETL.

A Dixon-Coles scoring model produces 1X2, over/under, and both-teams-to-
score probabilities per match. On top of it, a Monte Carlo layer simulates
the entire tournament — all 72 group matches, ten thousand times — to
produce advancement probabilities and a live knockout bracket.

Decisions worth knowing:

- **The model is fit offline with no look-ahead leakage.** The Dixon-Coles
  constants were fit on roughly 1,932 international matches since 2010,
  behind a validation log-loss gate.
- **Market-implied probability is treated as ground truth, with the model as
  a clearly-labeled experimental layer** — the site keeps fact and model
  visibly separate rather than presenting the model as authoritative.
- **Frozen value maths with golden test vectors.** The calculation was
  written once in Python and ported to TypeScript, with 84 passing tests
  keeping the two implementations locked in sync.
- **Fail-loud, idempotent ETL** on GitHub Actions cron, with
  change-detection snapshots.
- A symmetric host adjustment rather than a one-sided one, because host
  nations play third-round matches away from home.
- Annex C third-place assignment implemented as a 495-row lookup rather
  than reimplemented logic.

Seventy-two group-stage matches were forecast before a ball was kicked. A
divergence view surfaces the matches where model and market disagree most.

Live: wcup2026-analytics.vercel.app/en · Code:
github.com/Suyu0114/wcup2026-analytics

## A pre-registered study on unconventional features — `/projects/pre-registered-study`

47 frozen hypotheses, BH-FDR correction, n=1,181 — and the honest story of
finding nothing. Python, pandas, statsmodels, linearmodels, Supabase
Postgres.

The question behind it: how do you rigorously test a hypothesis-rich,
prior-poor feature space without fooling yourself? That kind of space is
exactly where p-hacking is easiest. The subject matter Suyu chose to test
was BaZi (Chinese birth-chart astrology) against MLB hitting performance —
a subject he has a genuine interest in, which is what made it a good
adversary for his own rigour.

How it was built:

- **Hard-freeze pre-registration.** All 47 hypotheses, each with its
  predicted sign and tier, were frozen before a single correlation was
  inspected. Any edit afterwards had to be justified as methodological
  rather than result-driven.
- **The pipeline was validated on plumbing, not results.** The dry-run path
  exercised joins and null-counts while computing no correlation at all, so
  the code could be trusted before any number was seen.
- **Two specifications:** OLS (n=1,168) and PanelOLS with entity and time
  fixed effects (n=4,325), across 1,181 players over ten seasons on an
  18-table PostgreSQL warehouse.
- **BH-FDR correction at q=0.10**, family by outcome channel.
- **A falsifier the data could fail on its own terms:** a genuine skill
  feature should track a hitter's *expected* outcomes (xwOBA) more tightly
  than their actual ones — a test that can only be passed, never gamed.
- Outcomes were held era-relative throughout, so a decade of rule and
  baseball changes could not smuggle itself into the result.

**The result: all 47 confirmatory tests came back null at q=0.10**, reported
exactly as they landed. The closest thing to a signal was a yearly
"resource" feature against isolated power, raw p of 0.099, in the
pre-registered direction — under correction it is not significant, and Suyu
registered it for out-of-sample validation rather than claiming it. On the
falsifier, five of fourteen predictors passed and the rest pointed the wrong
way.

He states the limitations plainly — three-pillar charts drop the birth hour
a full reading uses, the v1 features are coarse, and MLB is an extremely
noisy environment for any birth-date signal — but treats them as
limitations, not as excuses to keep digging. The takeaway he is proud of is
the discipline: a study built so that it *could* report nothing, and then
did.

Code: github.com/Suyu0114/BaZi-MLB
