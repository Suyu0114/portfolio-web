# Projects

Four case studies are written up on the site. Each has a full page, so link
visitors to it when they want the detail.

## BlueJaysFanWeb · `/projects/bluejays-fan-web`

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
- Aggregation happens in the database, not in the browser. The D3
  components take plain JSON rather than a database client, so they stay
  framework-pure and testable.

Live: bluejaysfanweb.vercel.app/en · Code:
github.com/Suyu0114/BlueJaysFanWeb

## World Cup 2026 forecasting platform · `/projects/world-cup-forecasting`

A forecasting and probability platform for the 2026 World Cup, benchmarked
against market-implied probabilities. Next.js, Supabase, Python ETL.

A Dixon-Coles scoring model produces 1X2, over/under, and both-teams-to-
score probabilities per match. On top of it, a Monte Carlo layer simulates
the entire tournament (all 72 group matches, ten thousand times) to
produce advancement probabilities and a live knockout bracket.

Decisions worth knowing:

- **The model is fit offline with no look-ahead leakage.** The Dixon-Coles
  constants were fit on roughly 1,932 international matches since 2010,
  behind a validation log-loss gate.
- **Market-implied probability is treated as ground truth, with the model as
  a clearly-labeled experimental layer**. The site keeps fact and model
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

## A pre-registered study on unconventional features · `/projects/pre-registered-study`

47 frozen hypotheses, BH-FDR correction, n=1,181, and the honest story of
finding nothing. Python, pandas, statsmodels, linearmodels, Supabase
Postgres.

The question behind it: how do you rigorously test a hypothesis-rich,
prior-poor feature space without fooling yourself? That kind of space is
exactly where p-hacking is easiest. The subject matter Suyu chose to test
was BaZi (Chinese birth-chart astrology) against MLB hitting performance,
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
  than their actual ones, a test that can only be passed, never gamed.
- Outcomes were held era-relative throughout, so a decade of rule and
  baseball changes could not smuggle itself into the result.

**The result: all 47 confirmatory tests came back null at q=0.10**, reported
exactly as they landed. The closest thing to a signal was a yearly
"resource" feature against isolated power, raw p of 0.099, in the
pre-registered direction. Under correction it is not significant, and Suyu
registered it for out-of-sample validation rather than claiming it. On the
falsifier, five of fourteen predictors passed and the rest pointed the wrong
way.

He states the limitations plainly (three-pillar charts drop the birth hour
a full reading uses, the v1 features are coarse, and MLB is an extremely
noisy environment for any birth-date signal) but treats them as
limitations, not as excuses to keep digging. The takeaway he is proud of is
the discipline: a study built so that it *could* report nothing, and then
did.

Code: github.com/Suyu0114/BaZi-MLB

## Ask my notes · `/projects/ask-my-notes`

This chatbot itself. It is written up as a case study because building it was
real engineering work, and because several roles Suyu is targeting ask for
LLM-integration experience.

How it works, in case a visitor asks: five hand-written markdown files are
concatenated into a single system prompt. It is byte-frozen so it stays
cacheable, which means on a repeat request the whole prompt is read from
cache rather than reprocessed. (No token count is quoted here on purpose:
these notes are part of that prompt, so any figure would go stale the moment
Suyu adds a note. The case-study page has the measured number.) Replies
stream token by token. Everything the bot can say comes from those files, and
if one is missing or empty the site fails to build rather than deploying with
a hole in it.

The design point worth explaining: the fixed "not in my notes" sentence is
instrumentation, not just manners. Conversations are logged, and an admin
page finds content gaps by matching that exact string, so every question
the bot cannot answer becomes a concrete note for Suyu to write. Its
ignorance is the feature.

Other decisions: the official Anthropic SDK rather than a wrapper, so the
streaming and caching are visible rather than hidden; rate limiting as two
indexed Postgres queries rather than a second service; and raw IP addresses
are never stored, only an HMAC used for rate limiting.

Claude Opus 5 writes the answers. If the Anthropic call fails before the
reply starts streaming, the same request is retried against Gemini
3.5 Flash Lite and the transcript says so, naming the model that answered
and why. Both providers get the same notes and the same refusal line. The
fallback is a rescue rather than a cost measure: the chatbot had spent
about 19 cents in its whole life when it was added, so there was nothing
to save. What prompted it was the Anthropic balance reaching zero, which
turned every reply into an error note telling visitors to try again in a
minute, which was not going to work.

If asked what went wrong: the rate limiter first shipped fail-*open*.
PostgREST answers a count against a missing table with no error and a null
count, so `count ?? 0` read as "no requests yet" and let everything through.
The spend limit was silently disabled in exactly the situation it exists for.
It surfaced only because the acceptance tests ran before the schema was
applied. A missing count is now an error.

Built with Claude Opus 5 (Gemini 3.5 Flash Lite as fallback), Next.js,
TypeScript, and Supabase Postgres.
