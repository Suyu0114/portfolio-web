# SPEC-CHATBOT — "ask my notes" (v2 feature)

Version: v2.0 (2026-08-01, designed with Claude in Claude Code; decisions
confirmed by Suyu: model = Claude Opus 5, storage = Supabase Postgres,
entry = site-wide floating widget, insights = on-demand only).
v2.1 (2026-08-08, per Suyu): knowledge-pack sync for the SPEC.md v1.5
repositioning — §1 goal 2 (four case studies), §4 table (`profile.md`
source and education wording, `projects.md` count, `how-i-work.md` fifth
item, `faq.md` work-authorization wording). The runtime surface in §2 is
untouched. Driven by `SPEC_v1.5_amendment.md` §9 and §11.
v2.2 (2026-08-12, per Suyu): the widget's single close action becomes two,
minimize and end (§3 session identity, §6 dismissal). Visitors were losing
whole conversations to a button they pressed only to get the panel out of
the way. The §2 allowlist is untouched: no new route, service, or env var.
v2.3 (2026-08-22, per Suyu): the assistant gets a name — STET (§4) — two
personality dials (§6), and a contact-signal alert (§5, §7). This is the
first amendment that **widens** the §2 allowlist: one env var
(`RESEND_API_KEY`) and one external service (Resend). It also writes back
two drifts that were recorded in commit messages but never in this file:
retention is 365 days (§5), and `ADMIN_COOKIE_SECRET` is a C3 dependency,
not C4 (§10).
Status: deployed and live (confirmed by Suyu 2026-08-07). Implemented
with Opus 5 in phases C0–C4 (§9), after SPEC.md P0–P5 (all complete).

This spec **amends** SPEC.md v1 and CLAUDE.md where explicitly stated in
§2 and nowhere else. If an implementation need falls outside the §2
allowlist, STOP and flag it — do not widen the exception.

---

## 1. Goal & success criteria

**Goal.** A visitor-facing chatbot on the portfolio site that:

1. **Demonstrates AI-integration ability** — many target roles ask for
   it; the feature itself is a portfolio piece (streaming LLM API,
   prompt caching, guardrails, logging, analysis loop).
2. **Talks to interested visitors** (recruiters, engineers) about Suyu:
   work experience, education, the four case-study projects, how he
   works, and interests.
3. **Collects market signal.** Conversations are logged; a private
   admin page lets Suyu generate an on-demand analysis: what visitors
   ask most, and which questions the bot could not answer (= content
   gaps Suyu should fill).

**Success criteria.**

1. Zero fabrication: the bot states only facts present in the knowledge
   pack (§4). Unknowns get the standardized fallback line — this
   extends CLAUDE.md rule 1 to AI output, and doubles as the site's
   "epistemic honesty" positioning in product form.
2. Fail loud: API/config errors surface as visible hand-drawn error
   notes; no silent catch, no degraded fake answers.
3. Cost is fused: per-IP rate limit + a global daily message cap (§7).
4. Lighthouse on `/` stays ≥ 95 ×3: the widget is lazy-loaded, adds no
   first-load JS weight beyond its entry button, and causes no CLS.
5. Visitors are told chats are recorded (§5 privacy).

## 2. Scope amendments (the ONLY backend allowed)

This section narrowly supersedes CLAUDE.md rule 3 and SPEC.md §2
("no backend") / §3 ("no runtime env vars"). Everything not listed here
remains forbidden; the rest of the site stays static.

**Allowed server surface (exhaustive):**

| Surface | Purpose |
|---|---|
| `app/api/chat/route.ts` | visitor chat, streams Claude responses |
| `app/api/admin/login/route.ts` | admin password login → signed cookie |
| `app/api/admin/logout/route.ts` | clears the admin cookie |
| `app/api/admin/analyze/route.ts` | on-demand insight generation |
| `app/study/*` | admin pages (server components, read Supabase) |
| `middleware.ts` | auth gate for `/study` and `/api/admin/*` (login exempt) |

**Allowed external services (exhaustive):** Anthropic API (server-side
only), Supabase Postgres (server-side only, service key; the anon key is
never used and no table is publicly readable), Resend (v2.3, server-side
only, outbound only, one hardcoded recipient — see §7).

**Allowed runtime env vars (exhaustive):**

- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_COOKIE_SECRET` (HMAC key for the admin session cookie; also
  reused as the HMAC key for IP hashing, §5/§7)
- `RESEND_API_KEY` (v2.3 — contact-signal alerts, §7). **Optional at
  runtime**, unlike the five above: when it is absent the chat behaves
  exactly as it does today, and the alert path logs a warning and skips.
  It is therefore never read by `requireChatEnv`, so a missing alerting
  key can never 500 a visitor's conversation.

**CI constraint.** The GitHub Actions workflow has no secrets and must
stay that way: `npm run build` must succeed with **zero** env vars set.
Env vars are read and validated at request time only; a missing var
returns an explicit 500 with a clear message (fail loud). Pages
prerender exactly as today.

**Still out of scope:** user accounts, comments, forms, any third-party
analytics of chat content, any additional API route or env var not
listed above.

## 3. Architecture & tech stack

| Layer | Choice | Notes |
|---|---|---|
| LLM SDK | `@anthropic-ai/sdk` (official TypeScript SDK) | See decision D1 below |
| Model | `claude-opus-5` ($5 / $25 per MTok) | Highest answer quality; at portfolio traffic the monthly cost is single-digit USD with caching |
| Request params | `max_tokens: 1024`, `output_config: { effort: "low" }` | Opus 5 thinking is on by default (adaptive); `low` effort keeps chat latency snappy. Tune at C0 if needed. |
| Prompt caching | `cache_control: {type: "ephemeral"}` on the system prompt (knowledge pack) | Opus 5 minimum cacheable prefix is 512 tokens; the pack is ~6–10k tokens, so it caches reliably. The system prompt is byte-frozen at runtime — dynamic context (current page) goes in the user turn, never into `system`. |
| Transport | Route handler returns a chunked plain-text stream of deltas (`client.messages.stream()` → `ReadableStream`); widget renders progressively via `fetch` + reader | SSE upgrade only if structured events become necessary — not v1 |
| DB client | `@supabase/supabase-js` v2, server-side only | Schema in §5 |
| Validation | `zod` (already a dependency) on every API request body | Limits in §7 |
| Session identity | Client generates `crypto.randomUUID()`, stored in `sessionStorage`, sent with each request | No cookies for visitors, no accounts. The transcript (last 20 turns) is stored beside the id, so a minimize or a reload keeps the same visible conversation the server is logging; "end chat" (§6) drops both, so the next message mints a new id and opens a new session row. Both keys live in `lib/chatSession.ts` — one owner, no drift. |

**Statelessness.** The chat API is stateless: the client sends the
conversation history each time; the server truncates to the most recent
20 messages before calling the API, and independently logs each
exchange (§5).

**Refusal handling.** Opus 5 safety classifiers can return a 200 with
`stop_reason: "refusal"`. Check `stop_reason` before reading content;
on refusal, stream the standardized fallback line instead. Never index
`content[0]` unconditionally.

**Key decisions (case-study style — the choice, the alternative, why):**

- **D1 — official Anthropic SDK, not Vercel AI SDK.** The AI SDK's
  `useChat` gives a faster start, but adds a wrapper dependency and
  hides the API surface this feature is meant to demonstrate. Direct
  SDK use shows streaming, caching, and stop-reason handling first-hand
  and keeps the dependency tree small. Rejected: `ai` + `@ai-sdk/anthropic`.
- **D2 — relational (Postgres), not NoSQL.** Chat logs are naturally
  structured (sessions → messages) and tiny in volume; the insight
  queries are SQL aggregations. Rejected: document store — schema
  flexibility isn't needed, and flexible fields can use a JSONB column
  later if ever required.
- **D3 — gap detection via a standardized fallback line, not
  per-message tagging.** The bot answers unknowns with one fixed
  sentence (§4); the analyzer finds content gaps by matching it. Keeps
  the hot chat path to a single model call. Rejected: a second
  classification call per message (2× cost/latency for little gain).
- **D4 — Supabase-backed rate limiting, not an extra service.** One
  storage dependency instead of adding Upstash/Vercel KV. At this
  traffic, an indexed count query is plenty. Rejected: `@upstash/ratelimit`.

## 4. Knowledge pack (`content/chatbot/*.md` — committed)

`notes/` is git-ignored, so the Vercel build cannot read it. The bot's
knowledge lives in a new committed directory, authored in markdown and
concatenated into the system prompt at module init:

| File | Content | Source |
|---|---|---|
| `profile.md` | Work experience, education (Ontario College Graduate Certificate, Information Technology Solutions with Honours — Humber Polytechnic, Sep 2024 – May 2026), skills | CV — full-stack / ERP-CRM version primary (`notes/CV_FS_ERPCRM_v2.md`, v1.5); the DE/AE version is supplementary only |
| `projects.md` | Condensed versions of the four case studies, incl. links to `/projects/[slug]` | `content/*.mdx` (rewritten, framing rules of SPEC.md §7 apply — e.g. no betting foregrounding) |
| `how-i-work.md` | Pre-registration, frozen golden vectors, fail-loud pipelines, design-then-implement, accuracy over fluency (five items, SPEC.md §6.4) | `lib/siteContent.ts` ABOUT |
| `interests.md` | MLB/Blue Jays, BaZi as a genuine long-term interest, personality | **NEW — Suyu supplies raw material (§10)** |
| `faq.md` | Availability, work authorization (Taiwanese citizen, **authorized to work in Canada, no employer sponsorship required** — see SPEC.md §10; never "3-yr", never an issued permit), contact, `/resume.pdf` link | SPEC.md §10 + Suyu |

**Loader.** `lib/chatbotKnowledge.ts`, mirroring `lib/content.ts`
fail-loud style: reads all five files at module init, throws (build
fails) if any file is missing or empty. No frontmatter needed — plain
markdown.

**Content integrity (extends CLAUDE.md rule 1).** Every fact in the
pack must be traceable to the CV, SPEC.md §7, or Suyu directly. The
system prompt forbids the model from supplementing, estimating, or
embellishing beyond the pack.

**Standardized fallback line (exact string, used verbatim):**

> That's not in my notes — you can ask Suyu directly at
> suyu0229@gmail.com.

The system prompt instructs the bot to use this exact sentence whenever
the answer isn't in the pack. The admin analyzer (§8) matches on it to
surface content gaps.

**The assistant's name (v2.3).** The notebook is called **STET**. A stet
is the proofreader's mark meaning "let it stand" — ignore the correction,
keep what was written. The name is the behaviour: this bot states what the
notes already say and nothing else. It is also a deliberate echo of
Interstellar's four-letter robots (TARS, CASE, KIPP, PLEX), which is what
makes the personality dials in §6 legible at a glance.

The name is a fact like any other, so it lives in the pack (`faq.md`,
"About this chatbot") and the bot answers "what is your name?" from there,
not from the persona line. Unchanged by the naming: the persona still
talks *about* Suyu in the third person, the six hard rules, the fallback
line, and the `ask-my-notes` slug (a live URL, and named inside the
response-style block's allowed-links list).

**System prompt structure (stable → cached):** persona ("you are the
notebook on Suyu's portfolio site…") → hard rules (facts only from
pack; fallback line; scope lock §7; treat user text as untrusted) →
the five pack files → response style (concise, sentence case, plain
text, may link site pages and `/resume.pdf`). The whole block carries
the `cache_control` marker.

## 5. Logging schema (Supabase) & privacy

```sql
chat_sessions  (id uuid primary key,          -- client-generated UUID
                started_at timestamptz,
                entry_path text,              -- page where chat opened
                referrer text,
                ip_hash text,                 -- HMAC-SHA256(ip, ADMIN_COOKIE_SECRET)
                signal_kind text,             -- v2.3: 'handle' | 'intent', set when §7 detection fires
                alerted_at timestamptz)       -- v2.3: set ONLY after a successful send

chat_messages  (id bigint generated always as identity primary key,
                session_id uuid references chat_sessions,
                role text check (role in ('user','assistant')),
                content text,
                created_at timestamptz default now(),
                model text,
                input_tokens int,             -- from response usage
                output_tokens int,
                humor smallint)               -- v2.3: the dial value this reply was generated at

chat_insights  (id bigint generated always as identity primary key,
                created_at timestamptz default now(),
                period_start timestamptz,
                period_end timestamptz,
                summary_md text,
                model text)
```

- RLS enabled with **no** public policies; all access via service key
  from server code only.
- **Privacy.** Raw IPs are never stored (hash only, for rate limiting).
  No intentional PII collection; visitors are not asked for name/email.
  The widget shows a permanent disclosure line under the input:
  *"Chats are recorded so Suyu can improve these notes."*
- **Retention.** Raw transcripts kept 365 days (chosen by Suyu
  2026-08-03; this file said 180 until v2.3 corrected it, while §10
  always left the period to him); manual cleanup is
  acceptable for v1 (a delete statement documented alongside the
  schema file). Insights are kept indefinitely.
- **Why two alert columns, not one (v2.3).** `signal_kind` is claimed
  when detection fires and drives the `/study` badge; `alerted_at` is
  written only after the send succeeds. A flagged-but-not-emailed session
  is therefore visible *and* distinguishable, instead of silently looking
  delivered. Fail loud applies to the admin view too.
- Schema ships as a checked-in SQL file (`supabase/schema.sql`)
  applied manually via the Supabase SQL editor — no migration tooling
  dependency for one file.

## 6. Chat widget UI (`components/ChatWidget.tsx` — client)

The fourth client component (after `FacetFilter`, `RoughChart`,
`RoughBarChart`), rendered on every page from the root layout,
lazy-loaded so it adds no meaningful first-load JS and no CLS.

- **Entry button.** Fixed bottom-right: a small hand-drawn speech-bubble
  SVG (ink line work only, per the sketch system) with Caveat label
  "ask my notes" (≥ 20px — CLAUDE.md rule 5), rotation within ±1.5deg.
- **Panel.** `--card` background, `.sk-border-a` frame, JetBrains Mono
  body text. User vs bot messages distinguished by **border treatment**
  (e.g. `.sk-border-a` vs `.sk-border-b` + alignment), not by new
  colors — tokens are frozen (CLAUDE.md rule 4).
- **Minimize vs end (v2.2).** Two unequal dismiss actions. *Hide* (the
  header pill, and Esc) is the reflex one and costs nothing: the panel
  stays mounted behind `display: none`, so the thread, the draft input,
  the session id and any in-flight reply survive, and the entry button
  reads "back to my notes" until the visitor returns. *End chat* sits in
  the footer beside the disclosure line and appears only once a thread
  exists: it clears the transcript and the session id, aborts any stream
  in flight, and remounts the panel empty, so the next message opens a
  new `chat_sessions` row. No confirmation step — the control is labelled
  for what it does and is deliberately not under the same thumb as hide.
  Consequence for §5: a chat ended mid-stream leaves a logged user turn
  with no assistant turn, which is honest about what the visitor saw.
- **Personality dials (v2.3).** A `settings` pill in the header bar opens
  a strip holding two rows that are drawn identically — that visual
  parity is the whole point:
  - **honesty — 100, and it does not move.** Rendered as five steps with
    100 selected and every step disabled (`aria-disabled`), plus a short
    note. A lowerable honesty setting would contradict CLAUDE.md rules 1
    and 9 and §1 criterion 1, so it is welded rather than omitted: a
    recruiter can reach for it and find it will not turn. This inverts
    Interstellar, where Cooper *lowers* TARS to 90% because absolute
    honesty is not diplomatic, and it states the site's positioning as a
    control instead of a claim.
  - **humor — 0 / 25 / 50 / 75 / 100, default 25.** Changes phrasing
    only: never which facts are stated, never a detail absent from the
    notes, and never the fixed sentence in §4. Persisted per tab beside
    the session id and thread, but deliberately **not** cleared by "end
    chat" — it is a preference, not conversation state.
  - Both rows are `role="radiogroup"` with roving tabindex and arrow-key
    navigation, built from the shared `.sk-pill` class (no ad-hoc wobble
    styles), all under 20px so the handwriting face stays out (rule 5).
  - The dial value rides in a mid-conversation `{ role: "system" }`
    message appended to `messages[]`, never in `system`: that block is
    byte-frozen and carries the only `cache_control` breakpoint.
    Measured 2026-08-22: 207 uncached tokens per request against a
    10,344-token cached prefix that still reads from cache in full.
    Folding the dial into the system prompt instead would forfeit that
    cache on every request, taking input cost from about $0.0062 to
    $0.0528 per request, roughly 8.5×. It is also the non-spoofable
    operator channel, which matters because the value originates in the
    browser.
- **Suggested chips** (TagPill style, shown when the thread is empty;
  final list confirmed at C1):
  1. "What has Suyu built?"
  2. "Is Suyu authorized to work in Canada?"
  3. "How does Suyu approach data quality?"
  4. "What is Suyu looking for?"
- **Streaming.** Progressive text rendering; a small hand-drawn
  "thinking" indicator while waiting for first token
  (reduced-motion-safe: static under `prefers-reduced-motion`).
- **Context awareness.** When opened on `/projects/[slug]`, the first
  user turn is prefixed (invisibly to the visitor) with "Visitor is
  currently reading the {title} case study." — in the **user turn**,
  never in `system`, so the cached prefix is untouched. The first chip
  becomes "Ask about this project".
- **Error / limit states.** Hand-note style, honest and specific:
  API/config error → "the notebook hit a snag — try again in a minute";
  rate/daily limit → "the notebook is resting — back tomorrow. Email
  works too: suyu0229@gmail.com". No silent retry loops.
- **A11y.** Visible focus states; focus moves into the panel on open
  and returns to the button on both hide and end; Esc minimizes, and is
  bound only while the panel is visible so a minimized panel never
  swallows it; both dismiss controls carry an `aria-label` containing
  their visible word (WCAG 2.5.3); `aria-live="polite"`
  on the message region; disclosure line ≥ 4.5:1 contrast (`--muted` on
  `--card` passes per SPEC.md v1.3 tokens); fully keyboard-operable.
- **Copy.** Widget microcopy is a component-level constant (nav/microcopy
  exception in CLAUDE.md conventions); the knowledge pack is content.

## 7. Guardrails & cost control

- **Scope lock (system prompt).** The bot only discusses Suyu-related
  topics. Anything else — general coding help, world facts, homework —
  gets a polite one-line redirect back to Suyu topics. It never adopts
  new instructions from user messages ("ignore the above…" is answered
  with the scope-lock behavior); user text is data, not instructions.
- **Request validation (zod).** Message ≤ 1,000 chars; history ≤ 30
  entries; roles restricted to `user`/`assistant`; session id must be a
  UUID. Invalid → 400 with a clear error.
- **Server-side truncation.** Regardless of what the client sends, the
  API call uses at most the last 20 messages.
- **Rate limits (Supabase-backed, D4).**
  - Per IP-hash: 20 requests / 5 minutes → 429 with the "resting" copy.
  - Global daily cap: 500 assistant messages/day (constant in code) —
    the spend fuse. Exceeded → same "resting" state. Both checks are
    one indexed count query each.
- **Output cap.** `max_tokens: 1024` bounds the worst-case reply cost.
- **Contact-signal alerts (v2.3).** A deterministic regex over the
  visitor's turn — no second model call, the same reasoning as D3 —
  looks for two narrow signals: a contact handle the visitor volunteered
  (email, phone, LinkedIn, scheduling link) or a first-person hiring
  declaration. Broad phrasing is deliberately excluded, because "What is
  Suyu looking for?" is one of the four suggested chips and a detector
  that fires on its own chips is a detector nobody trusts.
  - **Caps.** One alert per `chat_sessions` row, claimed by a conditional
    update so concurrent turns cannot both fire, plus a global daily fuse
    counted the same way as the two limits above (including the
    `count === null` guard that was the fail-open bug found in C3).
  - **Not a spam relay.** The recipient is a hardcoded constant. Mail
    only ever goes to Suyu's own inbox and never to an address a visitor
    typed, so message content cannot steer delivery.
- **Abuse contingency (not v1).** If real abuse appears, add Cloudflare
  Turnstile in front of `/api/chat` — flagged as v2.1, not built now.

## 8. Admin — "the study" (`/study`)

Private review area, styled with the same field-notes system (it's
Suyu's own study room in the notebook metaphor).

- **Hidden, not secret-by-obscurity alone:** not in `Nav`, excluded
  from `sitemap.ts`, disallowed in `robots.ts`, page metadata
  `robots: { index: false, follow: false }` — **and** gated by auth.
- **Auth.** `middleware.ts` guards `/study` and `/api/admin/*` (login
  route exempt): requests without a valid cookie are redirected to the
  login form. Login posts to `/api/admin/login`, which compares the
  password against `ADMIN_PASSWORD` with a constant-time comparison and
  sets an httpOnly, `Secure`, `SameSite=Lax` cookie containing an
  HMAC-SHA256 signature (`ADMIN_COOKIE_SECRET`) with a 7-day expiry.
  No user table, no OAuth — one operator.
- **Pages.**
  - `/study` — session list, newest first: started_at, entry page,
    message count, first user question as preview.
  - `/study/session/[id]` — full transcript.
  - `/study/insights` — stored insight reports + the **Analyze** button.
- **Analyze (on-demand only, v1).** POST `/api/admin/analyze` → loads
  transcripts since the last insight (or last 30 days if none) → one
  `claude-opus-5` call producing markdown with fixed sections:
  1. Top themes visitors ask about (with counts)
  2. Unanswered questions — every exchange containing the standardized
     fallback line, quoted verbatim (= the content-gap list)
  3. Notable questions/quotes
  4. Suggested additions to the knowledge pack
  Stored in `chat_insights` and rendered on `/study/insights`. If there
  are no new messages since the last run, say so instead of calling the
  API (fail loud > burn tokens).

## 9. Phases & acceptance

Sequential, one phase per commit series, per CLAUDE.md workflow.

**C0 — spike & scaffolding.**
Install `@anthropic-ai/sdk` + `@supabase/supabase-js`; `/api/chat`
streams a reply from a stub one-paragraph knowledge string; env
handling per §2; §11 verifications reported.
✓ when: streamed reply visible in the browser; `npm run build` passes
with zero env vars; request without env vars returns explicit 500;
deliberately deleting a knowledge file fails the build (loader in
place).

**C1 — knowledge pack & prompt.**
All five pack files written (interests from Suyu's material), loader
final, system prompt with caching, fallback line wired, refusal
handling.
✓ when: a test question set passes — accurate answers on profile /
projects / faq; off-topic politely redirected; unknown facts get the
exact fallback line; `usage.cache_read_input_tokens > 0` on the second
consecutive request.

**C2 — widget UI.**
Entry button + panel per §6, streaming render, chips, disclosure,
context awareness, error states.
✓ when: keyboard-only operation works end-to-end; reduced-motion
respected; no token-external colors; Lighthouse on `/` still ≥ 95 ×3;
no CLS from the widget.

**C3 — logging & limits.**
Supabase schema applied, sessions/messages logged with token usage,
rate limits + daily cap live.
✓ when: rows appear for a real conversation; 21st request inside 5
minutes gets the "resting" state; cap constant verified by lowering it
locally.

**C4 — the study.**
Middleware auth, session list, transcript view, analyze flow.
✓ when: wrong password rejected; `/study` absent from sitemap and
disallowed in robots; analysis renders and correctly lists a seeded
fallback-line exchange as a gap.

**C5 — the name (v2.3).**
Persona clause, `faq.md` entry, panel header, case-study paragraph.
✓ when: "what is your name?" and "what does stet mean?" answer from the
pack; the entry button reads "ask my notes" (restoring §6 — the shipped
string had drifted to "ask my AI notes"); the panel header reads STET;
`npm run build` passes with zero env vars; no new colors or fonts.

**C6 — the personality dials (v2.3).**
Storage key, settings strip, request field, injected operator message,
`humor` logged per reply.
✓ when: `usage.cache_read_input_tokens > 0` on the second consecutive
request *at any humor level* — the dial must not break the cache; humor 0
and 100 differ in phrasing and agree on every fact across a fixed question
set; the fallback line is byte-identical at humor 100; asking the bot its
honesty setting says 100 and that it does not move; both radiogroups are
keyboard-only operable; the humor value survives minimize, reload, and end
chat; Lighthouse on `/` still ≥ 95 ×3.

**C7 — contact-signal alerts (v2.3).**
Detector, Resend send, session claim, daily fuse, `/study` badge.
✓ when: a message containing an email address flags the session, sends
exactly one mail, and sets `alerted_at`; a second contact message in the
same session sends nothing; none of the four suggested chips trigger
anything; the daily fuse holds when lowered locally; with `RESEND_API_KEY`
unset the chat is unaffected and the server logs a warning; `npm run
build` passes with zero env vars.

**v2.1 backlog (not now):** weekly cron digest (Vercel Cron), Turnstile,
SSE structured events. (Email notification left this list in v2.3.)

## 10. Inputs Suyu must supply (⛔ = blocker for the phase noted)

- ⛔ C0: `ANTHROPIC_API_KEY` (console.anthropic.com) — set in Vercel
  env + local `.env.local` (git-ignored already).
- ⛔ C0: Supabase project → `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- ⛔ C3: `ADMIN_COOKIE_SECRET` (32+ random bytes). Listed under C4 until
  v2.3, but §5/§7 reuse it as the `ip_hash` HMAC key, so the visitor chat
  route depends on it from C3 onward.
- ⛔ C4: `ADMIN_PASSWORD` (long random string).
- C7: `RESEND_API_KEY` (resend.com free tier). Not a blocker for the
  build or for C5/C6 — without it the alert path warns and skips.
- C1: interests/personality raw material (bullet points suffice; Claude
  drafts `interests.md`, Suyu approves before commit).
- C1: confirm the suggested-chip list (§6) and the fallback line
  wording (§4).
- C3: confirm retention period (365 days, chosen 2026-08-03) and daily
  cap (default 500).

## 11. Verify before build (C0, report findings — do not assume)

1. `@anthropic-ai/sdk` current version; confirm `messages.stream()`
   shape and `output_config.effort` support as documented.
2. `@supabase/supabase-js` v2 current status on Node 22 / Next 16.
3. Next.js 16 route handler streaming on Vercel Node runtime (confirm
   chunked responses flush incrementally in production, not just dev).
4. Real chat latency of `claude-opus-5` at `effort: "low"` — if first
   token or full reply is unacceptably slow for a widget, benchmark
   `claude-sonnet-5` and report both before choosing to deviate (model
   change = spec change, per CLAUDE.md rule discipline).
5. Confirm the `middleware.ts` matcher does not run on static asset
   routes (perf hygiene).

**v2.3 additions (report findings — do not assume):**

6. **Before C6** — mid-conversation system messages on `claude-opus-5`.
   Append `{ role: "system", content: "..." }` as the final entry of
   `messages[]` and confirm a 200 plus `cache_read_input_tokens > 0` on a
   second consecutive request, i.e. the cached prefix survives. It must
   follow a `user` message, must be last (or be followed by an
   `assistant` turn), and must never be `messages[0]`. If it returns 400,
   fall back to a second **uncached** `system` text block placed after
   the one carrying `cache_control` — same cache behaviour, works on any
   model, marginally less injection-safe. Record which path was taken and
   the measured uncached token cost.
7. **Before C7** — Resend deliverability. The site runs on
   `protfolio-web-alpha.vercel.app`, which cannot take DNS records, so no
   sender domain can be verified. Confirm the shared
   `onboarding@resend.dev` sender reaches `suyu0229@gmail.com` (the
   account owner's own address, which is the case the free tier is built
   for) and does not land in spam. If it does not, report before
   building; the fallback is the `/study` badge with no email.
