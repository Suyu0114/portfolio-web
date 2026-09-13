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
v2.6 (2026-08-27, per Suyu): a validation fix, written back because the
implementation was stricter than this file said. §7's "Message ≤ 1,000
chars" was applied to `history` entries too, so any turn following a
reply longer than 1,000 chars was rejected with a 400 — on the measured
reply lengths that is every conciseness setting except 100, which made
multi-turn chat unusable on the live site. History entries get their own
10,000-char limit, the real cost fuse becomes an 18,000-char budget
across the whole transcript enforced by trimming rather than rejection,
and the §6 page-context prefix moves out of `message` into its own field
so server-added text stops consuming the visitor's typing budget. §3
also records two truncation rules the implementation needed and this
file never stated: the budget, and dropping a leading `assistant` turn.
No route, service, env var, or schema change.
v2.7 (2026-08-27, per Suyu): the humor dial is made perceptible again.
Suyu reported 0 and 100 reading alike on the live site, which is the §9
C7 criterion failing. The cause was not the dial's own wording: 75 and
100 already carried directive structure. Two higher-priority
instructions were deleting it. §4's response-style block said "do not
open with filler... answer directly", and conciseness 75, the default,
said "zero filler sentences, no preamble" — both absolute, both ahead of
or after the humor line in a way that wins. This is the same failure
v2.4 diagnosed and only half fixed: v2.4 moved *length* out of the
frozen block but left an *opener* rule there, and the new conciseness
dial then reintroduced the conflict from the other side. Fixed by
scoping §4's ban to empty openers, dropping "no preamble" from
conciseness 75, and adding a precedence rule to the invariant so the two
dials have a stated order. Humor 50, the default, also moves from a
ceiling ("at most one", satisfied by zero) to a floor. Worked examples
now ride along at humor ≥ 75 only. Token figures re-measured: prefix
10,808 → 10,870, uncached remainder 324 → 460/505/873 by setting. No
route, service, env var, or schema change.
v2.8 (2026-09-09, per Suyu): a fallback provider. Claude Opus 5 stays the
primary voice; when the Anthropic call fails *before* the reply starts
streaming, the same request is retried against the Gemini API
(`gemini-3.5-flash-lite`) and the visitor is told which model answered
and why (§6). Prompted by a live outage: the Anthropic credit balance
reached zero, the API returned HTTP 400 `invalid_request_error`, and the
route forwarded that status verbatim, so every visitor saw "the notebook
hit a snag. Try again in a minute." — a sentence that cannot come true
until the balance is topped up. This is the **second** amendment to
widen the §2 allowlist: one env var (`GEMINI_API_KEY`, optional at
runtime) and one external service (the Gemini API). It also stops the
route forwarding upstream status codes and messages (§3, §7), which
fixes a second wrong-copy bug of the same family: an Anthropic 429 was
rendering as "the notebook is resting, back tomorrow", asserting Suyu's
daily cap was spent when the real cause was a short upstream throttle.
Measured before the change, so the tradeoff is on the record: the
chatbot's entire logged spend since launch was 16 assistant replies and
roughly $0.19. This amendment buys resilience, not savings. C10 testing
then found the thing the phase existed to look for: the fallback model
paraphrased the frozen §4 sentence, which would have deleted those
replies from §8's gap list rather than degrading it. Fixed by
canonicalizing the stored copy (§4), not by re-tuning the prompt.
v2.9 (2026-09-09, per Suyu): a development-only provider override,
`CHAT_FORCE_PROVIDER` (§2, §3). Testing the fallback previously meant
handing Anthropic a deliberately invalid key, which works but is a poor
thing to have to explain. The override names the provider directly.
It widens the §2 env var allowlist by one and is the first entry there
that is **ignored in production**: the route reads it only when
`NODE_ENV` is not production, so a stray value in Vercel cannot demote
the live site. Suyu considered a visitor-facing model row in the §6
settings strip and chose against it, so v2.8's "primary is never
bypassed" stands for every real visitor and this amendment does not
reverse it. Verified three ways on 2026-09-09: `gemini` answers from
`gemini-3.5-flash-lite` under its own notice; a misspelled value
("gemni") warns and is ignored, with Claude answering; and a production
build started with `CHAT_FORCE_PROVIDER=gemini` answered from
`claude-opus-5` with no notice, which is the guard that matters.
v2.10 (2026-09-11, per Suyu): a keep-alive for the database. Nothing
about the chat itself changes; this amendment exists because the backend
keeps going away. Supabase pauses a Free-plan project when its user
database sees too little activity over a week, and `suyu-protfolio` was
paused twice on that rule — 2026-08-15 and 2026-09-07 — each time taking
PATS offline until Suyu restored it by hand from the dashboard. The
warning email arrives roughly a day before the pause, so it is not
something that can be reacted to. Fixed by a daily GitHub Actions job
calling a new RPC, `keepalive_ping()`, which updates the single row of a
new `keepalive` table (§5). A write rather than a read, because a write
is unambiguously activity and leaves `last_ping` / `ping_count` behind as
evidence that a run reported successful actually reached Postgres,
whereas a read that RLS blocks returns zero rows and may or may not
count. This widens the §2 allowlist again, and for the first time
outside the runtime: no new route, service, or env var, but the first
workflow permitted to hold repository secrets. That forced §2's CI
constraint to be scoped to the build workflow it was always about.
Frequency is one run per day, chosen by Suyu against a recommendation of
every eight hours. Supabase documents "a few requests per day" as
usually sufficient but publishes no threshold, so the margin is untested
either way, and at one run per day a dropped scheduled run leaves a
two-day gap rather than an eight-hour one.
v2.11 (2026-09-13, per Suyu): the conciseness dial gets a ceiling. Suyu
reported that conciseness 50 answered a broad question at a length that
read as broken, and that 75, the default, was no shorter. The cause is
the dial's own wording, and it is the same shape of defect v2.4 found in
humor: only some of the five steps carried a quantity. 0 and 25 were
given a floor in v2.4 (stop when the notes run out rather than pad) and
100 has always carried a ceiling (one to three sentences), but 50 ("crisp
paragraphs plus short lists") and 75 ("compact bullets") carried neither,
and an adjective with no quantity is satisfied by any length at all. Two
further forces pushed the same way. §4's response-style block still held
a third instruction a dial can ask the opposite of — "prefer the specific
detail from the notes over a general summary" — present on every request
and rendering ahead of the dial turn, which is exactly the failure §4's
own test was written to catch and which v2.4 and v2.7 each removed one
instance of. And nothing anywhere said what to do when the notes hold
more than the setting's length allows: the long end was told to stop
rather than pad, the short end had no matching instruction and so worked
through everything it found. Fixed by giving 50 and 75 explicit word
targets (§6), scoping §4's specificity rule so it stops implying length,
and adding an overflow rule at conciseness ≥ 50 that gives the shape of
the answer and points at the page holding the rest. §6's invariant is
narrowed in the same pass: "never change which facts you state" was
already false at 100, where one to three sentences cannot state them all,
so it now protects what it was written to protect, which is that no fact
is invented, none is restated more vaguely than the notes have it, and
the §4 sentence is never touched. §9's C7 length criterion gains
conciseness 75, which was never on it despite being the default. No
route, service, env var, or schema change, and the §2 allowlist is
untouched. Token and reply-length figures in §6 and §7 are re-measured,
since both the cached prefix and the uncached dial turn change.
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
only, outbound only, one hardcoded recipient — see §7), Gemini API
(v2.8, server-side only, fallback replies only — see §3).

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
- `CHAT_FORCE_PROVIDER` (v2.9 — development only, §3). Optional, and
  unlike every other var here it is **read only when `NODE_ENV` is not
  `production`**, so setting it on a deploy does nothing. Accepts
  `anthropic` or `gemini`; any other value is ignored with a loud warning
  rather than silently treated as one of them.
- `GEMINI_API_KEY` (v2.8 — fallback replies, §3). **Optional at
  runtime**, on the same terms as `RESEND_API_KEY` and for the same
  reason: it is never read by `requireChatEnv`, so when it is absent the
  primary path is byte-for-byte what it is today and only the fallback
  is unavailable. A fallback that could 500 the conversation it exists
  to rescue would be worse than no fallback.

**Allowed scheduled job (exhaustive, v2.10):**
`.github/workflows/supabase-keepalive.yml` — one `POST` per day to
`/rest/v1/rpc/keepalive_ping`, which updates the single row of
`public.keepalive` (§5). It exists because Supabase pauses an inactive
Free-plan project, which happened twice and took the chatbot backend down
with it. This is the **only** workflow permitted to hold repository
secrets, and it holds two: `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`, the same values the runtime already uses,
adding no new credential to the project. Because the service key bypasses
RLS, two properties of that workflow are part of this allowance rather
than incidental: it must not check out the repository, and `permissions`
must stay `{}`. The runtime env var allowlist above is untouched — a
GitHub Actions secret is not a runtime env var, and no code reads these.

**CI constraint.** The **build** workflow (`.github/workflows/ci.yml`)
has no secrets and must stay that way: `npm run build` must succeed with
**zero** env vars set. Env vars are read and validated at request time
only; a missing var returns an explicit 500 with a clear message (fail
loud). Pages prerender exactly as today.

Through v2.9 this read "The GitHub Actions workflow", written when there
was only one. The keep-alive workflow does hold secrets, so the rule is
now scoped to the workflow it was always about. It binds `ci.yml` exactly
as strictly as before: a secret available there is what would let a build
quietly start depending on one, which is the failure this prevents.

**Still out of scope:** user accounts, comments, forms, any third-party
analytics of chat content, any additional API route or env var not
listed above, and any further workflow holding secrets.

## 3. Architecture & tech stack

| Layer | Choice | Notes |
|---|---|---|
| LLM SDK | `@anthropic-ai/sdk` (official TypeScript SDK) | See decision D1 below |
| Model | `claude-opus-5` ($5 / $25 per MTok) | Highest answer quality; at portfolio traffic the monthly cost is single-digit USD with caching |
| Fallback model (v2.8) | `gemini-3.5-flash-lite` via `@google/genai` | Used **only** when the Anthropic call fails before the reply starts streaming (see "Provider fallback" below). Never used while Anthropic is healthy, so it changes nothing about the normal answer. Model id confirmed Stable 2026-09-09; its free-tier quota is not publicly documented and must be read in AI Studio. |
| Request params | `max_tokens: 2048`, `output_config: { effort: "low" }` | Opus 5 thinking is on by default (adaptive); `low` effort keeps chat latency snappy. **Was `1024` through v2.3**; doubled in v2.4 because the conciseness dial's long settings were being truncated at 1024, and the daily cap was cut 500 → 300 to pay for it (§6, §7). |
| Prompt caching | `cache_control: {type: "ephemeral"}` on the system prompt (knowledge pack) | Opus 5 minimum cacheable prefix is 512 tokens; the pack is ~6–10k tokens, so it caches reliably. The system prompt is byte-frozen at runtime — dynamic context (current page) goes in the user turn, never into `system`. |
| Transport | Route handler returns a chunked plain-text stream of deltas (`client.messages.stream()` → `ReadableStream`); widget renders progressively via `fetch` + reader | SSE upgrade only if structured events become necessary — not v1 |
| DB client | `@supabase/supabase-js` v2, server-side only | Schema in §5 |
| Validation | `zod` (already a dependency) on every API request body | Limits in §7 |
| Session identity | Client generates `crypto.randomUUID()`, stored in `sessionStorage`, sent with each request | No cookies for visitors, no accounts. The transcript (last 20 turns) is stored beside the id, so a minimize or a reload keeps the same visible conversation the server is logging; "end chat" (§6) drops both, so the next message mints a new id and opens a new session row. Both keys live in `lib/chatSession.ts` — one owner, no drift. |

**Statelessness.** The chat API is stateless: the client sends the
conversation history each time; the server truncates to the most recent
20 messages before calling the API, and independently logs each
exchange (§5). Truncation is three rules in order, because a message
count alone bounds neither cost nor validity: the character budget in §7
first (dropping oldest entries until the window fits), then the 20
message limit, then a leading `assistant` turn is dropped, since the
Messages API requires the window to open on a `user` turn and trimming
an alternating transcript lands on an assistant one half the time. The
visitor's current turn is never a trim candidate.

**Refusal handling.** Opus 5 safety classifiers can return a 200 with
`stop_reason: "refusal"`. Check `stop_reason` before reading content;
on refusal, stream the standardized fallback line instead. Never index
`content[0]` unconditionally.

**Provider fallback (v2.8).** The route pulls the first stream event
before it commits a status, which is exactly the point where a failure
is still recoverable. If that pull throws, the failure is classified
(§7) and, when `GEMINI_API_KEY` is set, the identical request is retried
against the fallback model. Rules:

- **Primary is never bypassed.** Anthropic is always tried first. There
  is no "cheaper by default" mode; the fallback is a rescue, not a
  router. The one exception is `CHAT_FORCE_PROVIDER` (v2.9), which exists
  so the fallback can be exercised without sabotaging a key, and which
  the route ignores entirely outside development. When it names `gemini`,
  Gemini becomes the primary **and there is no fallback back to Claude**:
  a run that silently reverted to the model you were trying to test would
  be worse than no override at all. A forced reply carries its own notice
  string, because the two real ones name causes that would be untrue.
- **Once the body is streaming, there is no fallback.** The status is
  already committed and the visitor has already read tokens, so a
  mid-stream failure still aborts the stream (fail loud). Restarting the
  answer from another model halfway through would rewrite text the
  visitor watched appear.
- **The visitor is told.** A reply that did not come from Claude Opus 5
  carries a transcript notice naming the model that answered and the
  reason (§6). Silence here would be a rule 9 breach by omission: the
  site's own case study says Opus 5 wrote these answers.
- **Rule 9 is not relaxed for the fallback.** The fallback receives the
  same system prompt, the same knowledge pack, and the same personality
  dials, and must produce the standardized §4 line byte-identically. The
  §9 C10 checklist re-runs the C1, C6 and C8 criteria against it, since
  instruction-following does not transfer between models by assumption.
- **The dials move.** Anthropic carries them as a mid-conversation
  `system` turn to protect the cached prefix. Gemini has no cached
  prefix here to protect, so they are concatenated into
  `systemInstruction`. That is a prompt-shape change, which is why C10
  re-measures rather than assumes.
- **`generateContentStream`, not the Interactions API.** Google's
  Interactions API keeps conversation state on its servers via
  `previous_interaction_id`. This chat is stateless by design (above)
  and §5 says the transcript lives in Supabase; handing history to a
  third party to hold would be a storage decision, not a transport one.
  `contents` carries the same replayed window, with `assistant` mapped
  to Gemini's `model` role.

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
- **D5 (v2.8) — a second provider as a rescue, not a second SDK
  abstraction.** D1 rejected the Vercel AI SDK partly to keep the API
  surface visible; adding a provider is not a reason to reverse that, so
  each provider keeps its own adapter behind one small internal type and
  no wrapper library is introduced. Rejected: `ai` + `@ai-sdk/google`,
  for the same reasons as D1. Also rejected: making Gemini the primary
  to cut cost. The measurement that prompted this amendment showed the
  chatbot had spent roughly $0.19 in its whole life across 16 replies,
  so there is no cost to cut here, and demoting Opus 5 would trade the
  answer quality this feature exists to demonstrate for nothing.

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

**Canonicalization (v2.8).** The instruction alone is not enough once a
second model is in play. Measured on the fallback provider 2026-09-09:
Gemini 3.5 Flash Lite returned "That **is** not in my notes — ..." at the
default dials and "That is not in my notes **-** ..." at conciseness 100,
reproducing the line exactly only at humor 100. The prompt already states
the rule and already carries an explicit exception to its own em-dash ban
for it, so this is instruction-following failing to transfer between
models, not a prompt that needs more adjectives. Per CLAUDE.md rule 9 the
answer is not to tune the prompt until the symptom goes away.

So the *logged* copy of a reply is canonicalized before it is stored: a
near miss of the fixed sentence, differing only in the contraction or the
dash, is rewritten to the exact string, and the server warns whenever
that fires so the drift stays visible. This matters more than it looks.
§8 finds gaps with an exact match, so a paraphrase does not degrade the
gap list, it **vanishes** from it, which is the silent-failure class
rules 1 and 9 exist to prevent. The server already writes this constant
itself when a provider refuses (§3), so guaranteeing the invariant
server-side is the established pattern rather than a new one.

Two limits, both deliberate. The pattern requires the whole sentence and
allows only those two variations, because anything looser could rewrite
an ordinary answer into a content-gap report and invent a gap the model
never flagged. And it applies to the stored copy only: the reply has
already streamed by then, and the difference a visitor sees is a
contraction and a dash in a fixed sentence that still says exactly what
it should.

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
the five pack files → response style (sentence case, plain text, may
link site pages and `/resume.pdf`). The whole block carries the
`cache_control` marker.

**The response-style block never sets tone or length.** Both belong to
the §6 dials, and anything here that overlaps them wins by default,
because this block is present on every request and renders ahead of the
dial turn. v2.4 already removed a length rule for that reason ("be
concise, two or three sentences", which flattened the humor dial). v2.7
removed the second half of the same problem: "do not open with filler
like 'Great question'. Answer directly" read as a blanket ban on
openers, and humor 75 and 100 are *defined* by an opening aside. It now
bans **empty** openers only and says explicitly that whether a reply
opens with anything is the settings' call. Any future rule added here
must pass the same test: if a dial could reasonably ask for the opposite,
it belongs in §6, not in §4.

v2.11 is the third instance, and the test caught nothing on its own for
two versions: the rule was here through v2.4 and v2.7, and both passes
walked past it. "Prefer the specific detail from the notes over a general
summary. A recruiter asking what Suyu built wants the actual systems, not
adjectives" never mentions length, which is how it survived two audits
*for* length rules. It sets one anyway. Asked something broad, a model
reads "every specific detail, never a summary" as a floor on how much to
cover, and conciseness 75 and 100 ask for precisely the summary it
forbids. The specificity half is worth keeping, so it is scoped rather
than deleted, in the shape v2.7 used on the opener ban: use the specific
fact rather than an adjective, and leave how much of a topic a reply
covers to the settings. The lesson for future audits of this block is
that a rule sets length whenever it sets *how much*, whether or not it
says so in words.

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

keepalive      (id smallint primary key check (id = 1),  -- v2.10: exactly one row, ever
                last_ping timestamptz,
                ping_count bigint)
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
  always left the period to him); manual cleanup is acceptable for v1,
  documented in `supabase/cleanup-chat-data.sql` alongside the schema
  file. Every delete in that file ships commented out, because
  `schema.sql` trains the habit of pasting a whole file into the SQL
  editor and this is the one file where that would be a disaster.
  Insights are kept indefinitely and do not cascade from sessions, so
  clearing transcripts leaves reports about conversations that no longer
  exist unless they are cleared too.
- **Why two alert columns, not one (v2.3).** `signal_kind` is claimed
  when detection fires and drives the `/study` badge; `alerted_at` is
  written only after the send succeeds. A flagged-but-not-emailed session
  is therefore visible *and* distinguishable, instead of silently looking
  delivered. Fail loud applies to the admin view too.
- **Keep-alive (v2.10).** `keepalive` is not chat data and nothing reads
  it at runtime. It exists so the daily workflow in §2 has something
  unambiguous to write: Supabase pauses a Free-plan project whose user
  database is too quiet, and this one was paused on 2026-08-15 and
  2026-09-07. `check (id = 1)` is what keeps the table from growing —
  a second row has nowhere to go however often the job runs. The two
  counters are the audit trail: a run that reports success but leaves
  `last_ping` stale never reached Postgres. The RPC is `security invoker`
  with execute revoked from `public`, `anon` and `authenticated` and
  granted only to `service_role`, so the publishable key cannot drive
  writes into it.
- **What the keep-alive is verified to do, and what it is not (v2.10).**
  Confirmed 2026-09-11 against the live project. The table holds its one
  row. The publishable key gets `42501 permission denied` on both the
  function and the table, which is a denial rather than the `404` that
  would only mean the function was never found, so the revokes are doing
  the work and not merely appearing to. The first dispatched run left
  `ping_count` at 2 with `last_ping` equal to the run's own timestamp,
  which is the check that separates a job that reached Postgres from one
  that only exited zero. The log shows `***` for both env values and
  prints nothing but the returned timestamp.

  None of that answers the question the feature exists for. Supabase
  documents "a few requests per day" as usually sufficient and publishes
  no threshold, so whether one call a day is *enough* cannot be verified
  by anyone outside Supabase. The only available evidence is negative: no
  pause warning arriving. If one does, raise the frequency before
  changing anything else.

  Of the three risks this shipped with, two are smaller than they looked
  and one is not. GitHub's rule that disables scheduled workflows after
  60 days of repository inactivity applies to **public** repositories;
  this one is private, so it does not apply. Private repositories instead
  draw on the account's included Actions minutes, roughly 30 a month here
  because each job bills at a one-minute minimum. That is negligible
  against the Free plan's 2,000 but it is not zero, and an account that
  exhausts them loses the keep-alive without being told. The risk that
  stands: GitHub delays and occasionally drops scheduled runs, and at one
  run per day a dropped run is a two-day gap rather than an eight-hour
  one.
- Schema ships as checked-in SQL files (`supabase/schema.sql`, and
  `supabase/keepalive.sql` since v2.10) applied manually via the Supabase
  SQL editor — no migration tooling dependency for two files.

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
  | 50 | dry wit | One short grounded aside per reply (floor, v2.7). |
  | 75 | deadpan | Self-aware quips and banter, at least one dry aside. |
  | 100 | max sarcasm | Relentless deadpan irony, sardonic aside first. |

  | conciseness | label | behaviour |
  |---|---|---|
  | 0 | narrative | Storytelling: full background, descriptive flow. |
  | 25 | detailed | Multi-paragraph, complete context, worked examples. |
  | 50 | balanced | Two short paragraphs, or a lead plus six bullets. 150-200 words (v2.11). |
  | 75 | efficient | One-sentence answer plus at most four one-line bullets. 80-110 words (v2.11). |
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
    tone, length, and how much of a topic one reply covers, never a
    detail absent from the notes, never a fact restated more vaguely
    than the notes have it, and never a softened, shortened, or omitted
    fixed sentence from §4 — which matters most at conciseness 100,
    where "one to three sentences" would otherwise clip the line that §8
    matches on to find content gaps. Through v2.10 the first clause read
    "never change which facts you state", which the dial contradicts by
    construction: 100 cannot state everything 0 states. Left as written
    it taught the model to disbelieve the clause that follows it, which
    is the one doing real work. The vagueness ban is its replacement and
    is the guard that actually matters under a word budget, since the
    cheap way to shorten "cut the planning cycle from three days to
    under ten minutes" is to write "sped it up".
  - The **precedence rule** (v2.7) lives in that same invariant, because
    the invariant is the one block present at every setting and so cannot
    go missing at the combination that needs it. At humor ≥ 50 the humor
    beat counts as part of the answer rather than filler, so no
    conciseness rule against preamble or pleasantries deletes it;
    conciseness still governs its **size**, and at 100 the beat is folded
    into a sentence of the answer rather than spending a sentence of its
    own, so the reply still fits one to three sentences. Below 50 there
    is no beat and conciseness governs alone. Stating an order was
    necessary because the two dials genuinely conflict at the settings a
    visitor is most likely to reach for, and without one the prohibition
    wins: it is absolute and it renders later in the same turn.
  - **The overflow rule at conciseness ≥ 50** (v2.11). A word target
    alone does not say what to drop. Asked what Suyu's responsibilities
    were, the notes offer two companies and seven systems, and a model
    told only to be brief either works through all of them anyway, which
    is what was reported, or compresses each into an adjective, which
    rule 1 forbids. So the rule names the third option: give the
    highest-level shape and point at the page that holds the rest, which
    is the persona's own proactive behaviour (§4) applied to length.
    Scoped to 50 and above because 0 and 25 have budget enough for what
    the notes hold, and this turn is uncached, so a rule that rides at
    every setting is billed at every setting. It ends by forbidding the
    §4 fallback sentence for anything the notes do cover: routing is not
    a content gap, and §8 counts that sentence to find gaps.
  - **Worked examples at humor ≥ 75** (v2.7): three short exchanges
    appended to the dial turn, demonstrating placement rather than
    describing it. Scoped to the top two steps for two reasons. Register
    bleed, since an example of sardonic phrasing sitting beside "no
    jokes, no asides" gives humor 0 something to imitate against its own
    instruction; and cost, since this turn is uncached. Their replies
    obey every rule the live bot does: each joke targets PATS, the
    work-authorization example quotes the pack's own wording, and the
    fallback example **names** the §4 sentence instead of quoting it, so
    the string §8 matches on gains no third copy.
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
    and carries the only `cache_control` breakpoint. Re-measured
    2026-09-13 after v2.11, same question at each setting, on
    `claude-opus-5`: the prefix is **11,161 tokens** and still reads from
    cache in full at every setting, including on the first request of a
    run against a prefix cached earlier. It was 11,133 immediately before
    v2.11, which §4's scoped specificity rule moved; the 10,870 recorded
    at v2.7 had already gone stale on its own, because the pack itself
    has grown since.

    The uncached remainder now varies with **both** dials, since v2.11's
    overflow rule rides only at conciseness ≥ 50. At humor 0 it is
    **573 tokens at conciseness 0, 534 at 25, 716 at 50, 708 at 75, and
    681 at 100**; holding conciseness at 75 it is **708 at humor 0, 753
    at 50, and 1,121 at 100**, the last carrying the worked examples.
    Before v2.11 the same grid read 536 / 497 / 471 / 466 / 460 and
    466 / 511 / 879, so the overflow rule costs roughly 220 tokens where
    it applies and the narrowed invariant about 40 everywhere.

    **v2.11 pays for itself at the input/output ratio in §3.** At the
    default pair (humor 50, conciseness 75) the uncached input rose 511 →
    753 while the output fell 569 → 283, and at $5 and $25 per MTok that
    is 242 × $5 against 286 × $25, about 0.6 cents cheaper per reply, or
    roughly $1.80 a day against the 300-reply cap. A dial that stops
    over-answering is the rare change that improves the answer and the
    bill at once. Folding the dials into the system prompt would still
    forfeit the cache on every request, at several times the input
    cost. It is also the
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
  v2.8 adds a third, for when the balance is spent and no reply could be
  produced at all → "the notebook is out of credit. Suyu will top it up
  as soon as he can. Email works: suyu0229@gmail.com". Three states, not
  two, because the first string promises that waiting a minute fixes it,
  and for an exhausted balance that promise is simply false. It says
  nothing about a second provider, deliberately: this string is also
  what a deploy with no `GEMINI_API_KEY` shows, where there is no second
  notebook to be out. Which string appears is chosen from a `code` field
  in the error body, never from the HTTP status alone: 503 already means
  two unrelated things on this route.
- **Provider notice (v2.8).** When a reply comes from the fallback model,
  the transcript carries a marker saying so, using the same `notice`
  turn kind the dial markers use (below), so it renders as a boundary
  rather than as something someone said, and is filtered out of the
  replayed history before it can reach either model. Two strings, chosen
  by the classified reason, because naming the wrong cause is a rule 1
  breach in its own right:
  "PATS is out of Claude credit, so this reply comes from Gemini." and
  "Claude is unavailable, so this reply comes from Gemini."
  The reason travels on a response header, not in the streamed body,
  which keeps it out of the logged reply and therefore out of §8's gap
  count.
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
- **Request validation (zod).** Message ≤ 1,000 chars; a history entry ≤
  10,000 chars; history ≤ 30 entries; the optional page-context title ≤
  120 chars; roles restricted to `user`/`assistant`; session id must be
  a UUID. Invalid → 400 with a clear error. **The message limit and the
  history-entry limit are separate numbers on purpose** (v2.6): the
  first bounds what a visitor typed, the second bounds what this bot
  wrote on an earlier turn and the client is echoing back, which may run
  the whole 2,048-token output cap. One shared 1,000-char constant
  covered both through v2.5, which made every second turn a 400 as soon
  as a reply ran long — measured on prod 2026-08-27 at 1,486 chars on
  conciseness 75 and 4,527 on conciseness 0, so only conciseness 100
  survived a second turn. Those two figures are the v2.6 rationale and
  stand as history; v2.11 re-measured the same question at 784 chars on
  conciseness 75 and 4,337 on conciseness 0. Both limits stay where they
  are: shorter replies only widen the margin, and the 10,000-char entry
  limit is sized against the 2,048-token output cap rather than against
  any one setting's typical length. For the same reason the page-context prefix
  (§6) is composed server-side from its own field rather than prepended
  to `message` by the panel: charging server-added text to the visitor's
  budget made a question over roughly 945 chars on a case-study page a
  400 that the textarea had already accepted.
- **History character budget.** 18,000 chars across the whole replayed
  transcript. This, not the entry count, is what bounds the input tokens
  billed: `history` is client-supplied on a public route, so the entry
  limit bounds how many entries arrive, never how large they are.
  Exceeding it **trims oldest-first rather than returning a 400** —
  history is context, not intent, and a visitor cannot repair an
  oversized transcript, so rejecting it would wedge their thread until
  they cleared session storage. Worst case is ~4,500 input tokens per
  request, holding the §7 daily ceiling roughly where the 300-message
  cap put it. At conciseness 0 a conversation begins losing its oldest
  turns after roughly four exchanges; that is the budget working, and
  raising it costs about $0.01 per request per 8,000 chars.
- **Server-side truncation.** Regardless of what the client sends, the
  API call uses at most the last 20 messages, subject to the budget and
  the opening-turn rule in §3.
- **Upstream failure classification (v2.8).** The route never forwards a
  provider's status code or message. Two reasons, and either alone would
  be enough. A 400 from Anthropic means *this server* sent something the
  API disliked, so repeating it to the browser blames the visitor for a
  request they cannot fix, and it collides with the route's own two real
  400s (bad JSON, failed zod). And the SDK builds its `Error.message`
  from the whole upstream body when that body has no top-level
  `message`, which Anthropic's envelope does not, so echoing it publishes
  the raw provider response the moment the client reads the body. The
  route logs the full cause and returns a curated message plus a `code`,
  exactly as `/api/admin/analyze` already does.

  | Upstream condition | Detection | Returned | Fallback tried |
  |---|---|---|---|
  | Credit exhausted | `billing_error`, or a 400 naming the credit balance | 503 `upstream_credit` | yes |
  | Key rejected | 401 / 403 | 500 `upstream_auth` | yes |
  | Throttled / overloaded | 429, 529, `overloaded_error` | 503 `upstream_busy` | yes |
  | Provider 5xx | status ≥ 500 | 502 `upstream_error` | yes |
  | Connection / timeout | no status | 504 `upstream_error` | yes |
  | Anything else | default | 502 `upstream_error` | yes |

  The credit test checks both the typed `billing_error` and the message,
  because the live API returns `invalid_request_error` with the balance
  stated only in prose (probed 2026-09-09). It must also decline to
  match when the outgoing conversation itself contains the credit
  wording, or a visitor could type that phrase and make PATS announce
  that Suyu is out of money: a rule 1 breach anyone could trigger on
  demand. A missed match degrades to `upstream_error`, which is vaguer
  and still true. That is the only direction it is allowed to fail in.

  Note what this fixes beyond the outage: an upstream 429 used to be
  forwarded as the route's own 429 and rendered as "the notebook is
  resting, back tomorrow", which told the visitor Suyu's daily cap was
  spent when a short provider throttle was the real cause. After this
  change the route's 429 means the site's own fuse and nothing else.
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
- conciseness 0, 50, 75 and 100 differ visibly in length on one broad
  question, and 75 lands near its §6 target (v2.11: 75 is the default
  and was absent from this criterion through v2.10, which is how it came
  to read as long as 50 without failing anything); conciseness 0 adds
  nothing absent from the notes and stops rather than padding when the
  notes on a topic run out; at 75 a question whose notes overrun the
  budget is answered in shape and routed to the page holding the rest,
  rather than worked through in full, compressed into adjectives, or
  given the §4 fallback sentence;
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

**C10 — provider fallback (v2.8).**
Upstream failure classification, the Gemini adapter behind a shared
chunk type, the provider notice, the third error state, and the
knowledge-pack and case-study corrections that keep the site's own
description of its stack true.
✓ when:
- with `GEMINI_API_KEY` unset, every primary-path behaviour is unchanged
  and `npm run build` still passes with zero env vars;
- with the Anthropic balance at zero, a question streams a Gemini reply
  under the notice "PATS is out of Claude credit, so this reply comes
  from Gemini.", and `/study` records that assistant row with the Gemini
  model id, not `claude-opus-5`;
- with `ANTHROPIC_API_KEY` set to a garbage value, the same fallback
  runs under the "Claude is unavailable" notice, proving the notice
  names the cause rather than assuming the last one seen;
- with Anthropic broken and `GEMINI_API_KEY` unset, the visitor gets the
  out-of-credit copy for a spent balance and the generic note for every
  other cause, and the server log names the cause either way;
- **no notice reaches either model**: the posted `history` still contains
  only `user`/`assistant` entries, and a fallback reply logged in
  `chat_messages` contains no notice text;
- **rule 9 holds on the fallback path**, re-running the criteria that
  C1, C6 and C8 applied to Opus 5: the §4 line is byte-identical **in the
  stored row**, which is what §8 reads, at the default dials and at humor
  100 and conciseness 100; humor 0/50/100 differ in register and agree on
  every fact; a reply that hits the output cap says so rather than ending
  mid-sentence. Byte-identity is asserted against `chat_messages`, not
  against the streamed text, because canonicalization (§4) is what makes
  it hold and it runs at log time;
- **the canonicalizer cannot invent a gap**: an ordinary reply that
  mentions the notes, or that contains a *different* claim, is left
  untouched and does not gain the §4 line;
- with Anthropic healthy, no notice appears and
  `usage.cache_read_input_tokens > 0` on a second consecutive request,
  proving the adapter split did not disturb the cached prefix;
- `/study` insights still lists a seeded fallback-line exchange as a gap,
  proving §8's count was not polluted;
- no new colors or fonts; zero em dashes in the new visitor copy.

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
- C10: `GEMINI_API_KEY` (aistudio.google.com). Not a blocker for the
  build — without it the fallback is simply unavailable and the visitor
  gets the both-down copy. Suyu should also read the free-tier quota for
  `gemini-3.5-flash-lite` in AI Studio and record it here: it is not
  documented publicly, and free quota was the stated reason for choosing
  this model over a larger one.
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
   path and not a verified domain. The sending end needs no DNS, SPF, or
   DKIM work, because those are only required to reach addresses other
   than the account owner's.

   Delivery initially stopped at `delivered` without reaching `opened`,
   while other mail from the same sender to the same inbox showed
   `opened`/`clicked`, which pointed at Gmail filing it under Spam or
   Promotions. Suyu added a receiving-end filter on
   `from:onboarding@resend.dev` and **confirmed receipt 2026-08-23**, so
   the path is verified end to end: detector to Resend to inbox. The
   `/study`-badge-only fallback stays unused.

8. **(v2.8) The Gemini API surface and the model id.** The fallback
   adapter must not be written against a recalled SDK shape. Confirm the
   package, the streaming call, how stateless multi-turn history is
   expressed, the output-token field, and the finish-reason values that
   have to map onto the §4 fallback line and the truncation note. Also
   confirm `gemini-3.5-flash-lite` is still served and what its free-tier
   quota actually is, since free quota is the reason it was chosen.

   **RESOLVED 2026-09-09 — read from the published docs and from the
   installed type definitions, not assumed.** Package `@google/genai`
   v2.21.0, client `new GoogleGenAI({ apiKey })`, env var
   `GEMINI_API_KEY`. The call is
   `ai.models.generateContentStream({ model, contents, config })`,
   returning `Promise<AsyncGenerator<GenerateContentResponse>>`. History
   is stateless: `contents` is a `Content[]` of `{ role, parts: [{ text }] }`
   where `role` is `"user"` or `"model"`, so the existing replayed window
   maps across with `assistant` renamed. `config` carries
   `systemInstruction`, `maxOutputTokens` and `abortSignal`, which covers
   the system prompt, the 2048 output cap, and the existing cancel path.
   Each chunk exposes `.text`, `.candidates?.[0]?.finishReason` and
   `.usageMetadata` (`promptTokenCount`, `candidatesTokenCount`), so §5
   token logging survives. `FinishReason` is a real enum:
   `SAFETY`, `PROHIBITED_CONTENT`, `BLOCKLIST`, `SPII` and `RECITATION`
   map to the §4 fallback line, matching §3's existing refusal rule;
   `MAX_TOKENS` maps to the truncation note; `STOP` is a normal end. The
   leftovers (`LANGUAGE`, `OTHER`, `FINISH_REASON_UNSPECIFIED`) map to
   the truncation note, **not** to the fallback line. An unexplained stop
   is still not a licence to present partial text as a finished answer,
   but the §4 line is the string §8 counts to find content gaps, and a
   provider-side stop is not a gap in the notes. Sending it there would
   file an infrastructure event as a missing-content report, which is the
   same reasoning that gave truncation its own note in v2.4.

   Two findings that changed the design rather than confirming it. First,
   Google now documents an Interactions API (`ai.interactions.create`)
   and calls `generateContent` legacy, but its multi-turn model is
   server-side state via `previous_interaction_id`. That is rejected here
   on §3 and §5 grounds, not on style: this chat is stateless by design
   and its transcript lives in Supabase, so handing history to a third
   party to retain would be a storage decision this amendment does not
   make. `generateContentStream` remains documented and takes the
   stateless `contents` array. Second, `gemini-3.5-flash-lite` is
   confirmed **Stable**, but its free-tier quota is **not** documented
   publicly; Google directs you to AI Studio. Recorded as an open input
   in §10 rather than assumed.

9. **(v2.8) Where the spend actually went.** Before treating a second
   provider as a cost measure, measure the current one.

   **RESOLVED 2026-09-09 — queried, not assumed.** Across the whole life
   of the feature, `chat_messages` holds 16 assistant replies totalling
   9,815 input and 5,698 output tokens, and `chat_insights` holds zero
   analyzer runs. At Opus 5 rates that is roughly **$0.19**. The $20 that
   emptied the Anthropic balance was therefore not spent by this chatbot,
   and moving it to Gemini saves nothing measurable. The fallback is kept
   for resilience, which the outage proved is a real need, and D5 records
   the rejection of the cost argument so it is not re-litigated later.
