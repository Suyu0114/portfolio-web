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
v2.4 (2026-08-22, per Suyu): the assistant is renamed **PATS** (§4); the
humor dial is rebuilt around per-level behaviour because the v2.3 wording
gave all four non-zero steps the same instruction and so read as inert;
and a third dial, **conciseness**, joins it (§6). Honesty stays welded at
100. The entry button becomes "ask my AI notes - PATS", which knowingly
reverses the string C5 restored (§6, §9). The cost envelope is re-cut to
pay for the longer settings: `max_tokens` 1024 → 2048, daily cap 500 →
300 (§7). §11.7 is resolved with measured delivery data. The §2
allowlist is untouched — no new route, service, or env var.
v2.5 (2026-08-23, per Suyu): the disclosure line drops its recording
clause (§5), the transcript marks dial changes inline the way Claude
Code marks a model switch (§6), and the empty state introduces PATS by
name (§6). It also corrects a content gap that testing exposed: the pack
described the scout half as *flagging* a conversation and never mentioned
the email, so PATS correctly refused to claim it sent one, contradicting
the very line under the input that promises it will (§4, §7). Rule 9
working as designed, on notes that were simply incomplete. Finally the
conciseness default moves 50 -> 75. No route, service, env var, or schema
change, but `faq.md` is in the cached prefix, so the token figures in §6
were re-measured.
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

**The assistant's name (v2.4).** The notebook is called **PATS**, for
Portfolio Assistant & Talent Scout. It replaces STET (v2.3), which punned
on the proofreader's mark meaning "let it stand". The pun *argued* the
behaviour; PATS states the job instead, and the behaviour is now argued by
the honesty dial that renders at 100 and will not turn (§6). The trade is
deliberate: a control a recruiter can reach for and find welded makes the
point better than a word they have to look up.

Both halves of the acronym are load-bearing. *Portfolio Assistant* is the
guide: it walks a visitor through the notes and points at the page that
answers them. *Talent Scout* runs the other way round — it does not find
talent **for** the visitor, it watches for opportunity **on Suyu's
behalf**, which is precisely what the contact-signal alert in §7 already
does. The four-letter shape keeps the Interstellar echo (TARS, CASE, KIPP,
PLEX) that makes the dials in §6 legible at a glance.

**Tone (v2.4): practical and proactive.** Proactive means volunteering
*routes*, never *facts*: offering `/resume.pdf`, naming the case study
that covers a topic, suggesting the next thing worth asking. It must never
mean volunteering a fact the notes do not contain. That would invert
CLAUDE.md rules 1 and 9 under cover of helpfulness, and it is the failure
mode this persona is most exposed to — "proactive" and "makes things up"
are neighbours.

The name is a fact like any other, so it lives in the pack (`faq.md`,
"About this chatbot") and the bot answers "what is your name?" from there,
not from the persona line. Unchanged by the renaming: the persona still
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
  The widget shows a permanent line under the input. **v2.5:** *"Leave
  your email and PATS will let him know."*

  It names the **trigger**, not a general promise to forward messages:
  leaving a handle is exactly what §7's detector matches, so a visitor
  who does it always gets the alert the line promises, whereas "leave a
  message and PATS will email it" would overpromise on every plain-text
  message that matches nothing.

  **The recording clause was removed in v2.5, deliberately.** Earlier
  versions opened the line with it (v2.0 "Chats are recorded so Suyu can
  improve these notes"; v2.3 "read them and improve these notes"; v2.4
  "Chats are recorded so Suyu can read them."). Suyu was shown that
  removing it leaves the site with no visible notice that transcripts are
  kept for 365 days and read in `/study`, while the same line solicits an
  email address, and chose removal anyway. **Do not restore it as a bug
  fix.** It is a product decision, not drift, and reversing it needs
  Suyu, not a session that noticed the asymmetry. The remaining channel
  is `faq.md`, which still records that conversations are logged, so PATS
  answers honestly when a visitor asks.
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
  "ask my AI notes - PATS" (≥ 20px — CLAUDE.md rule 5), rotation within
  ±1.5deg; resuming a minimized thread reads "back to my AI notes -
  PATS". **v2.4 reverses a v2.3 decision deliberately:** C5's acceptance
  restored "ask my notes" after the shipped string had drifted to "ask my
  AI notes", reasoning that the button should carry the verb and the panel
  header the name. Suyu's call is that it should carry both, so the name
  is discoverable without opening anything. Since the label is Caveat at
  20px and the size cannot be reduced (rule 5), the longer string is a
  layout constraint: verify it neither wraps nor overflows at 360px
  viewport width, trimming horizontal padding rather than type size.
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
- **Personality dials (v2.4).** A `settings` pill in the header bar opens
  a strip holding three rows that are drawn identically — that visual
  parity is the whole point, because one of them does not move:
  - **honesty — 100, and it does not turn.** Five steps with 100
    selected. Marked up as a *readout*, not as five disabled radios: the
    pills are `aria-hidden` and a single `sr-only` sentence states the
    fact, because making a screen-reader user arrow across five inert
    steps to discover inertness is worse than telling them. A lowerable
    honesty setting would contradict CLAUDE.md rules 1 and 9 and §1
    criterion 1, so it is welded rather than omitted: a recruiter can
    reach for it and find it will not turn. This inverts Interstellar,
    where Cooper *lowers* TARS to 90% because absolute honesty is not
    diplomatic, and it states the site's positioning as a control rather
    than a claim.
  - **humor — 0 / 25 / 50 / 75 / 100, default 50** (was 25 in v2.3).
  - **conciseness — 0 / 25 / 50 / 75 / 100, default 75** (new in v2.4;
    default raised from 50 in v2.5, per Suyu). 100 is the *most*
    compressed end, so the scale runs long to short.

  **Why v2.4 rebuilt humor.** The v2.3 instruction was a single hedged
  permission — "above 0 you may use light dry wit in at most one sentence
  per reply" — issued identically to 25, 50, 75 and 100. Only the header
  number differed, so the model had nothing telling it how 100 should
  differ from 25, and the safe reading of "may" is "need not". Three
  further forces pushed the same way: the frozen response-style block
  said "be concise, two or three sentences", which leaves no room for a
  trailing aside; `effort: "low"` biases short and direct; and the
  default sat at 25, the second-lowest step. The dial was therefore
  imperceptible in practice. The fix is not a bigger number but **one
  distinct, directive behaviour per step**, and moving length out of the
  frozen prompt into its own dial so the two stop contradicting each
  other.

  | humor | label | behaviour |
  |---|---|---|
  | 0 | clinical | Completely serious. No metaphors, jokes, or asides. |
  | 25 | polite | Professional warmth, ordinary courtesy, nothing more. |
  | 50 | dry wit | Subtle understated engineering humor where it fits. |
  | 75 | deadpan | Self-aware quips and banter, at least one dry aside. |
  | 100 | max sarcasm | Relentless deadpan irony, sardonic aside first. |

  | conciseness | label | behaviour |
  |---|---|---|
  | 0 | narrative | Storytelling: full background, descriptive flow. |
  | 25 | detailed | Multi-paragraph, complete context, worked examples. |
  | 50 | balanced | Crisp paragraphs plus short lists. No fluff. |
  | 75 | efficient | Direct answer first, compact bullets, no filler. |
  | 100 | terminal | One to three sentences or a list. No pleasantries. |

  - **Three adaptations of Suyu's level text, made to hold rule 1.**
    (a) Humor 100 originally licensed jokes about "recruitment clichés"
    and "coffee-fueled debugging". The second is a fact-shaped claim
    about Suyu that the notes do not contain, and the first lands on the
    visitor, who is usually a recruiter. Retargeted: **every joke is
    aimed at PATS itself** — its self-destruct routine, its refusal to
    improvise, its habit of quoting notes at people. The register is
    unchanged; only the target is. (b) Conciseness 0 and 25 originally
    asked for "extensive explanations" and "comprehensive examples" from
    a fixed 10k-token pack, where the only way to reach length is to
    invent. Both now specify that length comes from telling more of what
    the notes **already contain**, and that running out of notes means
    stopping, not padding. (c) Conciseness 75 originally asked for bold
    text; the panel renders plain text with no markdown, so asterisks
    would reach the visitor literally. Bullets stay (plain hyphens),
    bold is dropped.
  - The **invariant block** is a constant appended at every setting:
    tone and length only, never which facts are stated, never a detail
    absent from the notes, and never a softened, shortened, or omitted
    fixed sentence from §4 — which matters most at conciseness 100,
    where "one to three sentences" would otherwise clip the line that §8
    matches on to find content gaps.
  - The two adjustable rows are `role="radiogroup"` with roving tabindex
    and arrow-key navigation, built from the shared `.sk-pill` class (no
    ad-hoc wobble styles), all under 20px so the handwriting face stays
    out (rule 5). Each row shows the **active step's label** in the slot
    the honesty row uses for "locked", so a visitor can read what a
    setting does without changing it and discovering by accident. Both
    values persist per tab beside the session id and thread, and both are
    deliberately **not** cleared by "end chat" — they are preferences,
    not conversation state.
  - Only the **selected** step's text is sent, never the whole table, and
    it rides in a mid-conversation `{ role: "system" }` message appended
    to `messages[]` rather than in `system`: that block is byte-frozen
    and carries the only `cache_control` breakpoint. Measured
    2026-08-23: 324 uncached tokens per request against a
    10,808-token cached prefix that still reads from cache in full.
    Folding the dials into the system prompt would forfeit that cache on
    every request, taking input cost from about $0.0070 to
    $0.0557 per request, roughly 7.9×. It is also the
    non-spoofable operator channel, which matters because both values
    originate in the browser.
- **Style-change notice (v2.5).** When a dial differs from the one used
  for the previous request, the transcript gets a dim one-line marker
  above the message the new setting first applies to, the way Claude Code
  marks a model switch. Two dials changed at once produce two lines.

  - **It appears on send, not on change.** The marker's position is its
    meaning: everything above it used the old setting, everything below
    uses the new one. Appending on change would put it above a reply that
    is still streaming under the old setting, which states the opposite
    of what happened. Appending on send also keeps the transcript clean
    for a visitor who only spins a dial to see what it does.
  - **It is display-only and never reaches the model.** It is a third
    `role` on the client-side turn, filtered out of the `history` the
    panel posts. `historyEntrySchema` accepts only `user`/`assistant`, so
    a missed filter is a 400 rather than a marker silently entering the
    context and competing with the authoritative `{ role: "system" }`
    dial instruction.
  - **It is not logged.** `chat_messages.role` is checked against
    `user`/`assistant`, and §5 already stores `humor` and `conciseness`
    per assistant row, which is the same fact in the place that can be
    queried. No schema change.
  - Drawn from existing tokens only: `--muted` JetBrains Mono under 20px
    (so the handwriting face stays out, rule 5) between two `--rule`
    hairlines. It rides in the `aria-live="polite"` log, so a screen
    reader hears the change too.
- **Suggested chips** (TagPill style, shown when the thread is empty;
  final list confirmed at C1). **v2.5:** the empty state opens
  *"Hi, I'm PATS."* before the lead line, because that sentence is the
  first thing a visitor actually reads and the name lands better there
  than in the header they scan past:
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
  - Global daily cap: **300** assistant messages/day (constant in code)
    — the spend fuse. Exceeded → same "resting" state. Both checks are
    one indexed count query each. Was 500 through v2.3; cut to 300 in
    v2.4 to pay for the doubled output cap below, which keeps the
    worst-case daily spend flat rather than doubling it.
- **Output cap.** `max_tokens: 2048` bounds the worst-case reply cost
  (1024 through v2.3). Conciseness 0 and 25 ask for multi-paragraph
  answers, and 1024 was measured against the terse style that preceded
  the dial, so the old ceiling would have truncated the long end.
  `stop_reason === "max_tokens"` is handled explicitly: a clipped reply
  says it was clipped instead of ending mid-sentence, the same fail-loud
  reasoning that gives a refusal the fallback line.

  | | daily cap | max_tokens | worst case/day |
  |---|---|---|---|
  | v2.3 | 500 | 1024 | ~$16 |
  | v2.4 | 300 | 2048 | ~$18 |

  Typical spend is far below the ceiling: at the default conciseness of
  50 a reply runs a few hundred output tokens, so 300 replies land nearer
  $4/day.
- **Contact-signal alerts (v2.3).** A deterministic regex over the
  visitor's turn — no second model call, the same reasoning as D3 —
  looks for two narrow signals: a contact handle the visitor volunteered
  (email, phone, LinkedIn, scheduling link) or a first-person hiring
  declaration. Broad phrasing is deliberately excluded, because "What is
  Suyu looking for?" is one of the four suggested chips and a detector
  that fires on its own chips is a detector nobody trusts.
  - **Caps.** One *email* per `chat_sessions` row, claimed by a
    conditional update on `alerted_at` so concurrent turns cannot both
    fire, plus a global daily fuse
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
**Superseded by C8 (v2.4):** the name is PATS and the button string is
deliberately reverted to "ask my AI notes - PATS". This acceptance is
kept as the record of what shipped, not as a live target.

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

**C8 — PATS, and dials that can be felt (v2.4).**
Rename throughout, entry-button string, per-level humor behaviour, the
conciseness dial, active-step labels, the re-cut cost envelope, and the
`claimSessionAlert` gating fix.
✓ when:
- "what is your name?" answers PATS from the pack, and the panel header,
  dialog label, and Resend sender display name all read PATS;
- the entry button neither wraps nor overflows at 360px viewport width,
  with Caveat still ≥ 20px;
- `usage.cache_read_input_tokens > 0` on the second consecutive request
  *at any humor × conciseness combination* — a third dial must not break
  the cache any more than the second did;
- humor 0, 50 and 100 are visibly different in register and identical in
  every fact stated, across a fixed question set; humor 100 aims every
  joke at PATS itself and introduces no fact-shaped claim about Suyu;
- conciseness 0, 50 and 100 differ visibly in length; conciseness 0 adds
  nothing absent from the notes and stops rather than padding when the
  notes on a topic run out;
- the fallback line is byte-identical at conciseness 100;
- a reply that hits `max_tokens` says so rather than ending mid-sentence;
- all three rows are keyboard-only operable and each shows its active
  step's label; both adjustable values survive minimize, reload, and end
  chat;
- `/study/session/<id>` shows `humor` and `conciseness` per assistant
  reply;
- a session flagged while `RESEND_API_KEY` was unset still alerts on a
  later contact turn once the key is present;
- `npm run build` passes with zero env vars; no new colors or fonts; zero
  em dashes in `content/chatbot/*.md`; Lighthouse on `/` still ≥ 95 ×3.

**C9 — transcript style markers and copy (v2.5).**
Third turn role, send-time comparison, the marker's render branch, the
trimmed disclosure line, and the PATS greeting on the empty state.
✓ when:
- sending without touching a dial adds no marker; changing a dial and
  sending adds one above that message; changing both adds two;
- spinning a dial without sending leaves the transcript untouched, and
  moving a dial away and back before sending adds nothing, because the
  value did not actually change;
- markers survive minimize and reload in position, and are cleared by
  end chat along with the rest of the thread, while the dial values
  themselves survive it (they are preferences, §6);
- **no marker reaches the API**: the posted `history` contains only
  `user`/`assistant` entries, and the server's `in=` token count does
  not grow with the number of markers in the transcript;
- the thinking indicator still appears while a reply streams;
- the empty state reads "Hi, I'm PATS." and still offers four chips;
- the line under the input is exactly "Leave your email and PATS will
  let him know.", and leaving an email in the chat still fires one alert;
- `npm run build` passes with zero env vars; no new colors or fonts; the
  marker does not break at 360px.

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
  cap (500 at C3, cut to 300 in v2.4 — see §7).

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
   `suyu-portfolio.vercel.app` (named `protfolio-web-alpha.vercel.app`
   until 2026-08-22), which cannot take DNS records, so no sender domain
   can be verified. Confirm the shared
   `onboarding@resend.dev` sender reaches `suyu0229@gmail.com` (the
   account owner's own address, which is the case the free tier is built
   for) and does not land in spam. If it does not, report before
   building; the fallback is the `/study` badge with no email.

   **RESOLVED 2026-08-22 (v2.4) — measured, not assumed.** The shared
   sender does reach Gmail. Evidence: Resend `GET /emails` reports
   `last_event: delivered` for the alert created at 19:45:13 UTC
   (subject "Chat lead: contact details on /", to `suyu0229@gmail.com`,
   from `STET <onboarding@resend.dev>`), and the matching `chat_sessions`
   row carries `alerted_at`, which is written only after a 2xx. `GET
   /domains` returns an empty list, confirming this is the shared-sender
   path and not a verified domain. **One caveat: delivered is not
   noticed.** That message never reached `opened`, while other mail from
   the same sender to the same inbox shows `opened`/`clicked`, so Gmail
   most likely filed it under Spam or Promotions. The fix belongs on the
   receiving end (a filter on `from:onboarding@resend.dev`, never send to
   spam); the sending end needs no DNS, SPF, or DKIM work, because those
   are only required to reach addresses other than the account owner's.
   The `/study`-badge-only fallback above therefore stays unused.
