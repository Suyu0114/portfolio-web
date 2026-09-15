# SPEC v1.8 amendment — hero actions and note-card hover

Date: 2026-09-14, revised and applied 2026-09-15
Author: Claude in Claude Code, for Suyu. Suyu decided what changes: the
hero's chat button; the about and interests links beside it, as buttons;
filling all three under white labels, `chat with PATS` with `--accent` and
the links with `--accent-2`; a slower note-card hover whose corner curls
with a real shadow and gradient; one amendment for all of it; and
numbering in approval order (v1.8 here, v2.12 in `SPEC-CHATBOT.md`).
Everything in §11 was decided while building it.
Status: **approved** by Suyu: the hero chat button with §11 items 1–7 on
2026-09-14, then the revision (the links and the card hover) with items
8–15 on 2026-09-15, when Suyu also asked for the filled buttons. Items
16–18 record how that last request was built and were reported to Suyu
with the commit that applied this file. Drafted as v1.7 and renumbered
once: the new positioning statement and larger home portrait were
approved first and took v1.7.

**Built before it was written down.** Suyu asked for each change directly
in Claude Code on 2026-09-14 and 2026-09-15, and each was implemented and
verified before this file described it. That reverses the usual order
(CLAUDE.md workflow), so this file does two jobs: it writes the decisions
into the specs, and it puts the choices made along the way in front of
Suyu (§11).

**How it was applied.** On 2026-09-15, on the P8 branch
(`feat/hero-chat-button`), in the same commit as this file:

1. §§0–6 went into `SPEC.md`, §§7–9 into `SPEC-CHATBOT.md`, and §10 into
   `CLAUDE.md`.
2. The two proposals in `SPEC-CHATBOT_v2.11_amendment_draft.md` had
   already been renumbered to v2.13 and v2.14 on 2026-09-14.
3. P8 was run on the code this file describes (§13).

**Numbers checked** on 2026-09-15 against `origin/main` at `8ef51c6`
(v1.7 merged), with no branch but this one ahead of it: `SPEC.md` ends at
v1.7 with P7 as its last phase, and `SPEC-CHATBOT.md` ends at v2.11.

If anything below conflicts with `SPEC.md`, `SPEC-CHATBOT.md`,
`CLAUDE.md` or `SPEC_v1.6_amendment.md`, stop and flag it.

---

## 0. Version block entry

Add to the version list at the top of `SPEC.md`, after v1.7:

```
v1.8 (2026-09-15, per Suyu): hero actions and a note-card hover. Under the
sub-line, three filled hand-drawn buttons: `chat with PATS`, in `--accent`,
opens the site-wide chat widget, and `about` and `interests`, in
`--accent-2`, link to /about and to its interests section. The note cards
tilt more slowly on hover, and their blank bottom-right corner curls up
like a sticky note being peeled. The curl is the site's only gradient and
shadow, an exception to CLAUDE.md's line-work-only convention that Suyu
chose over an ink-only fold. Suyu asked for each change directly, and each
was built before this entry was written; the choices made while building
them are in `SPEC_v1.8_amendment.md` §11. Amends §2, §4.1, §4.3, §6.1,
§6.4, §8, and §9 (adds P8). The widget side is SPEC-CHATBOT.md v2.12. No
new route, service, env var, color token, or font. Source of truth for the
change: `SPEC_v1.8_amendment.md`.
```

Update the status line beneath the version list to the date this
amendment is applied.

---

## Part A — `SPEC.md`

## 1. §2 Non-goals: hover motion (amend)

In the bullet on motion in hover states, **replace** "(such as the
`SketchCard` tilt)" with "(such as the `SketchCard` tilt and corner
curl)".

## 2. §4.3 Sketch utilities: `SketchCard` hover (replace)

**Remove:**

> - On hover the card tilts 0.5deg: variant a clockwise, variant b
>   counter-clockwise.
> - Tilt only under `motion-safe`. No shadow, no lift, no color change.

**Replace with:**

> - On hover the card tilts 0.5deg (variant a clockwise, variant b
>   counter-clockwise) over 400ms with an ease-out (v1.8; v1.6 shipped
>   Tailwind's 150ms default, which Suyu found too quick).
> - On the same ease, its bottom-right corner curls up like a sticky note
>   being peeled (v1.8). Where the corner lifted, the page shows through,
>   shaded along the crease. The flap is the note's back: shaded with a
>   gradient, outlined in ink, and casting a soft shadow on the card. It is
>   about 48px, over the corner that holds no text.
> - The curl is the site's only gradient and shadow (CLAUDE.md
>   conventions). Every color in it is one of the frozen tokens `--ink`,
>   `--rule`, `--card` and `--paper`, or a `color-mix()` of them, so
>   nothing outside §4.1 appears. The card itself gains no shadow, no lift
>   and no color change.
> - Tilt and curl run only under `motion-safe`, and only on devices that
>   hover. The curl ignores pointer events, so the whole card stays the
>   click target.

## 3. §4.1 Tokens and §6.1 Home: hero actions (add)

Add to §4.1, after the **Photos (v1.6)** block:

> **Hero buttons (v1.8).** The home hero's three actions (§6.1) are filled
> buttons: `chat with PATS` in `--accent`, like the chat widget's corner
> button (SPEC-CHATBOT.md §6), and `about` and `interests` in `--accent-2`.
> - Labels are `--card`, the near-white the corner button already uses:
>   4.79:1 on `--accent` and 4.82:1 on `--accent-2`. 20px Caveat is
>   normal-size text under WCAG, so it needs 4.5:1.
> - On hover the fill turns `--ink` (14.71:1), since `--card` on `--rule`
>   would be only 1.52:1.
> - The chat button's solid `--accent` counts toward the accent budget
>   above, and P8 measures it. No new token.

Add to §6.1 item 1 (Hero), after the **Portrait (v1.6, P7; resized v1.7)**
paragraph:

> **Actions (v1.8, P8).** On their own line under the sub-line, three
> hand-drawn buttons in this order: `chat with PATS`, which opens the
> site-wide chat widget, the same panel as the corner button
> (SPEC-CHATBOT.md §6); `about`, a link to `/about`; and `interests`, a
> link to the interests section of `/about` (§6.4). They share one frame:
> an `--ink` outline, alternating `.sk-border-b` and `.sk-border-a`, a
> Caveat label at 20px in `--card`, and a ±1deg tilt that alternates too.
> The chat button is filled with `--accent`, like the corner button, and
> the two links with `--accent-2` (§4.1). Only the chat button carries an
> icon, the widget's speech-bubble mark in the label's color, so the one
> action that opens something instead of changing page is the one that
> looks different. On hover each fills with `--ink`, and nothing moves. On
> narrow screens the row wraps rather than shrinking its labels.

## 4. §6.4 /about: interests anchor (add)

Add to the interests bullet:

> The interests section carries `id="interests"` (v1.8), the target of the
> hero's `interests` link. The jump is instant (§2: no smooth scrolling).

## 5. §8 Component inventory (amend)

Add `SketchButtonLink` (v1.8), `OpenChatButton` (v1.8) and `SpeechBubble`
(v1.8) after `NextNote` (v1.6). None is a client component.

## 6. §9 Phases: add P8

Add after P7:

> **P8 — hero actions and note-card hover (v1.8).**
> Work:
> - The hero's action row: `OpenChatButton` and two `SketchButtonLink`s,
>   sharing one filled frame, with `SpeechBubble` shared with the corner
>   button.
> - `ChatWidget`: the document-level open listener, and focus return to
>   whichever control opened the panel. `ChatPanel`: refocus on every open
>   request.
> - The id on `/about`'s interests section.
> - `SketchCard`: the 400ms tilt and the corner curl.
>
> ✓ when:
> - **Build gates:** lint, typecheck, `npm run check` and build all pass
>   with zero env vars.
> - **Placement:** the row sits on its own line under the sub-line,
>   left-aligned with it, in the order chat, about, interests; every label
>   is Caveat ≥ 20px.
> - **Colors:** the chat button is filled with `--accent` and the links
>   with `--accent-2`; labels and the speech bubble are `--card`; outlines
>   are `--ink`. Hovered, each fills with `--ink`. Label contrast is
>   ≥ 4.5:1 at rest and hovered.
> - **Links:** `about` opens `/about`; `interests` lands on the top of the
>   interests section; Tab reaches chat, then about, then interests.
> - **Opening:** a click, Enter and Space each open the panel with focus
>   in the input. Pressed while the panel is open, the chat button moves
>   focus back into the input, and there is still exactly one panel.
> - **Focus return:** hide and end chat both return focus to the chat
>   button without changing the scroll position. After a client-side
>   navigation away from `/`, they return it to the corner button. The
>   corner button's own open and return behaviour is unchanged.
> - **No client JS:** the production client chunks contain the
>   `[data-open-chat]` selector and none of the action row's markup.
> - **Cards:** at rest, no tilt and no curl; hovered, the mirrored 0.5deg
>   tilt and the full curl, both over 400ms; a click inside the curl still
>   opens the case study; the same holds on `/projects`.
> - **Reduced motion emulated:** hovering a card neither tilts nor curls.
> - **Fold:** at 1366×768 the first featured card still starts inside the
>   viewport.
> - **Accent budget:** accent orange covers at most ~10% of the first
>   screen at 1366×768 and at 360×740, photos excluded (§4.1).
> - **Mobile:** at 360px the row wraps, no label wraps, and nothing scrolls
>   horizontally.
> - **Performance:** Lighthouse ≥ 95 ×3 on `/` (production build; the
>   median of three runs after a warm-up), and no CLS.
> - **Console:** no errors or warnings while doing all of the above.

---

## Part B — `SPEC-CHATBOT.md`

## 7. Version block entry

Add to the version list at the top of `SPEC-CHATBOT.md`, after v2.11:

```
v2.12 (2026-09-14, per Suyu): a second way into the widget. The home
hero's `chat with PATS` button (SPEC.md v1.8) opens the same panel as the
corner button, so there is still one panel, one thread and one session.
Three things in §6 change to allow it. The trigger ships no client JS: it
is server-rendered HTML carrying `data-open-chat`, and `ChatWidget` opens
the panel from one click listener on the document, so the trigger adds
nothing to §1 criterion 4's first-load JS and the case study's "Only the
entry button ships in the first-load bundle" stays true. Focus now
returns to whichever control opened the panel, without scrolling, and
falls back to the corner button once a client-side navigation has
unmounted that control; §6 said "the button" when there was only one.
And a trigger pressed while the panel is already open moves focus back
into the input instead of doing nothing. The §2 allowlist is untouched:
no route, service, env var, schema, or workflow change. Acceptance is
SPEC.md §9 P8. Source of truth: `SPEC_v1.8_amendment.md`.
```

## 8. §6: in-page triggers (add)

Add after the **Entry button** bullet, before **Panel**:

> - **In-page triggers (v2.12).** A second way in, placed in the page
>   flow rather than fixed in the corner. There is one: the
>   `chat with PATS` button in the home hero (SPEC.md §6.1),
>   `components/OpenChatButton.tsx`.
>   - **Same widget.** It opens the panel through the same path as the
>     corner button, so it never mounts a second panel, thread or
>     session.
>   - **No client JS of its own.** Any element carrying `data-open-chat`
>     opens the panel: `ChatWidget` registers one `click` listener on the
>     document and matches the target with `closest()`. The trigger stays
>     a server component, so it adds nothing to §1 criterion 4's
>     first-load JS. Keyboard activation needs nothing extra, because
>     Enter and Space on a `<button>` dispatch `click`. The selector is
>     exported from the same file as the markup, so the two cannot drift
>     apart.
>   - **Focus comes back to it, without scrolling** (see A11y). Hiding is
>     the action that costs nothing (*Minimize vs end*, below); a visitor
>     who kept reading further down while chatting would otherwise be
>     pulled back up to the hero.
>   - **Pressed while the panel is open**, it moves focus back into the
>     input. The panel refocuses on every open request, not only when it
>     becomes visible.
>   - **Its label is static.** The corner button switches to "back to my
>     AI notes - PATS" when a thread is waiting; a server component cannot
>     read `sessionStorage`, so the trigger does not.
>   - **`aria-haspopup="dialog"`, no `aria-expanded`.** The popup
>     semantics match the corner button, but a server component cannot
>     know whether the panel is open, so `aria-expanded` could only ever
>     say "false". Its accessible name is its visible label (WCAG 2.5.3).
>   - Its look is SPEC.md's to define (§4.1, §6.1). Like the corner
>     button, it is filled with `--accent` under a `--card` label and
>     carries the speech-bubble mark, which now lives in
>     `components/SpeechBubble.tsx`.

## 9. §6 A11y: focus return (amend)

In the **A11y** bullet, **remove:**

> focus moves into the panel on open and returns to the button on both
> hide and end

**Replace with:**

> focus moves into the panel on every open request, and on both hide and
> end returns to the control that opened it: an in-page trigger if it is
> still in the document, focused without scrolling, otherwise the corner
> button (v2.12)

---

## 10. `CLAUDE.md` sync (amend)

- **Spec versions.** "(site, currently v1.7)" becomes "(site, currently
  v1.8)", and "(chatbot, currently v2.7)" becomes "(chatbot, currently
  v2.12)". The chatbot number was already stale; this amendment fixes it
  because it bumps that spec too.
- **Amendment files.** After the `SPEC_v1.6_amendment.md` sentence, add:
  "`SPEC_v1.8_amendment.md` does the same for v1.8 (hero actions and the
  note-card hover), and its §11 records the choices made while building
  them." (v1.7 has no amendment file.)
- **Conventions, line work.** After "the hand-drawn feel comes from line
  work only.", add: "One exception, since v1.8: the note card's corner
  curl on hover (SPEC.md §4.3) uses a gradient and a soft shadow, mixed
  only from the frozen tokens."
- **Workflow.** "then SPEC.md phases P6–P7 (v1.6)." becomes "then SPEC.md
  phases P6–P7 (v1.6) and P8 (v1.8)." (v1.7 adds no phase.)

---

## 11. Choices made while building it

Suyu decided what changes (see the author line). Claude decided the rest
while implementing it. Items 1–7 were reported to Suyu and approved on
2026-09-14 with the hero chat button, and items 8–15 on 2026-09-15 with
the revision. Items 16–18 came with Suyu's request that day for filled
buttons and were reported with the commit that applied this file. Each is
a small change to undo.

1. **Label: `chat with PATS`.** Taken from Suyu's request ("與 PATS
   聊天", chat with PATS). The alternative was the corner button's own
   `ask my AI notes - PATS`: it says "AI", but the same string would then
   be on screen twice.
2. **Ink outline, not solid `--accent`** (superseded on 2026-09-15). It
   added no accent to the hero (§4.1). Suyu then asked for filled buttons:
   the outline stays ink, but the chat button is solid `--accent` and the
   links `--accent-2`.
3. **Tilt −1deg** for the chat button. It is now the first of the row's
   alternating tilts (item 9).
4. **Static chat label.** Showing "back to…" when a thread is waiting
   would make the trigger a client component and give up §8's
   no-client-JS property.
5. **Focus returns to the opener, without scrolling**, and falls back to
   the corner button after a client-side navigation. Always returning to
   the corner button would send a keyboard user who opened the chat from
   the hero to the end of the page's tab order.
6. **Pressed while open, the chat button refocuses the input** rather
   than hiding the panel. Its label invites a chat; it doesn't read as a
   toggle.
7. **P8 doesn't wait for P7.** Moot: P7 merged as PR #19 first.
8. **Link labels `about` and `interests`**, lowercase like the nav and the
   `/about` headings.
9. **The row alternates:** borders `.sk-border-b`, `-a`, `-b` and tilts
   −1deg, +1deg, −1deg, so neighbours never repeat a wobble, the rule §4.3
   already gives adjacent cards.
10. **The links are text-only**, so the speech bubble stays the row's only
    icon.
11. **The anchor is `ABOUT.interestsId`**, one constant used by both the
    section and the link, because check-links drops fragments and would
    not notice a mismatch. No scroll margin: the nav is not sticky, so the
    section lands at the top of the viewport.
12. **Tilt over 400ms, ease-out.** Suyu asked for slower without a number.
13. **The curl's look.**
    - Size: 48px.
    - The lifted area is painted `--paper`, which assumes the card sits on
      the page ground; both grids that render it do. It is shaded from
      `--paper` mixed with 22% `--ink` at the crease.
    - The flap runs from `--rule` mixed with 15% `--ink` at the crease,
      through `--rule`, to `--card` at its tip.
    - An ink outline, like the card's border.
    - A shadow of `--ink` at 30% opacity, about 1.5px up and left.
14. **The curl appears on `/projects` too**, since both grids render the
    same `SketchCard`.
15. **Under reduced motion there is no curl at all**, matching the tilt,
    rather than a curl that appears instantly on hover.
16. **"White" is `--card`.** The tokens have no pure white, so `#FFFFFF`
    would be a new color (CLAUDE.md rule 4). `--card` (`#FFFDF4`) is the
    near-white the corner button already sets on `--accent`. It measures
    4.79:1 on `--accent` and 4.82:1 on `--accent-2`, against 4.88:1 and
    4.91:1 for pure white, and 20px Caveat needs 4.5:1. The speech bubble
    follows the label, since it strokes in `currentColor`.
17. **Hover fills with `--ink`** instead of `--rule`. `--card` on `--rule`
    would be 1.52:1; on `--ink` it is 14.71:1, and `--ink` already fills a
    selected pill in the chat panel and a selected chip in the project
    filter. Nothing moves, as before. The corner button has no hover fill
    and gains none (§12).
18. **The outline and the focus ring are unchanged.** The outline stays
    `--ink`. The focus ring stays the global 2px `--accent` outline, 2px
    outside the button, where it sits on `--paper` (4.53:1) rather than on
    the fill, so it still shows beside the orange button.

---

## 12. Explicitly out of scope for v1.8

- **The corner button:** placement, label, look and behaviour are
  unchanged; it gains no hover fill (§11 item 17).
- **Other pages:** the home hero is the only place with the action row and
  the only in-page chat trigger. Adding either anywhere else is a new
  amendment.
- **Other frames:** only `SketchCard` curls. `Photo`, `Figure`, the /about
  how-I-work cards and the chat panel keep line work only.
- **The chatbot runtime surface:** no route, service, env var, schema or
  workflow change. SPEC-CHATBOT.md §2 is untouched.
- **Content:** the knowledge pack and `content/ask-my-notes.mdx` stay as
  they are. The case study's "bottom-right corner" sentences are still
  true, and so is "Only the entry button ships in the first-load bundle",
  checked against the production chunks (§13).
- **`CLAUDE.md`'s "C0–C9"**, stale since C10, in the same Workflow sentence
  §10 edits.

---

## 13. Implementation notes

- **Commits** on `feat/hero-chat-button`, rebased onto `origin/main` at
  `8ef51c6` (v1.7 merged): `671f343` the chat button, `4224cc8` the about
  and interests links, `8a35d04` the card hover, and `309c75f` the fills.
  The chat button was first written on a local `main` at `5785a8b`, before
  v2.11, P6 and P7; moving it forward conflicted only on `app/page.tsx`'s
  import list.
- **Files.**
  - `lib/sketchButton.ts` (new): the frame the row shares, as
    `sketchButtonClass(fill, border, rotate)` plus the label class. `fill`
    is `accent` or `accent-2`; the `--card` label and the `--ink` hover
    fill are the same for both. Rotation uses the same `none | cw | ccw`
    scale as `TagPill` and `Photo`.
  - `components/OpenChatButton.tsx` (new, server component): the chat
    button, filled with `accent`, and `OPEN_CHAT_SELECTOR =
    "[data-open-chat]"` beside it.
  - `components/SketchButtonLink.tsx` (new, server component): a `Link` in
    the same frame, filled with `accent-2`.
  - `components/SpeechBubble.tsx` (new): the speech-bubble SVG, moved out
    of `ChatWidget` unchanged.
  - `components/ChatWidget.tsx`: `openPanel(opener)` shared by both entry
    points, the document `click` listener, and `openerRef` for focus
    return, checked with `isConnected` and focused with
    `preventScroll: true`.
  - `components/ChatPanel.tsx`: a `focusRequest: number` prop, bumped on
    every open request; the focus effect depends on `[open, focusRequest]`.
  - `components/SketchCard.tsx`: the 400ms ease, `group`, and a
    `CornerCurl` SVG (scale 0 at rest, `motion-safe:group-hover:scale-100`)
    whose gradient and filter ids derive from the card's href.
  - `lib/siteContent.ts`: `HERO.chatCta`, `aboutCta` and `interestsCta`,
    and `ABOUT.interestsId`.
  - `app/page.tsx`: the row under the sub-line. `app/about/page.tsx`: the
    section id.
- **Evidence on `309c75f`** (production build in a clean sibling worktree
  with no `.env*` files and no `next-env.d.ts`, 2026-09-15):
  - Build gates: lint, typecheck, `npm run check` and build all passed,
    and the build read no environment file.
  - 59 checks passed with no console errors or warnings. They cover: no
    client JS for the row, placement and order, the fills, label colors
    and contrast at rest and hovered, both links and the instant jump,
    Tab order, the chat button's opening and focus behaviour, card tilt
    and curl at rest and hovered on `/` and `/projects`, a click through
    the curl, reduced motion, the accent budget, and 360px and 640px.
  - Colors as the browser computes them: fills `rgb(180, 86, 40)` and
    `rgb(101, 119, 68)`; labels and the speech bubble
    `rgb(255, 253, 244)`; outlines `rgb(43, 38, 32)`. Label contrast is
    4.79:1 on the chat button and 4.82:1 on the links at rest, and
    14.71:1 hovered. The focus ring is a solid 2px `--accent` outline,
    offset 2px.
  - Accent budget: accent orange covers 1.24% of the first screen at
    1366×768 and 4.25% at 360×740, against 0.83% and 2.74% with the chat
    button unfilled. Counted as the pixels within an RGB distance of 60 of
    `#B45628` in a screenshot with photos hidden (§4.1 leaves them out).
    Everything orange on screen counts, the corner button included;
    anti-aliased edges fall outside the distance, so thin lines count a
    little short.
  - The first featured card's top at 1366×768, 1280×720, 1440×900 and
    1920×1080: 669px without the action row and 729px with it. v1.7's
    taller text column now sets the hero's height, so the row's full 60px
    counts. The fills change no size.
  - At 360×740 the row wraps to two lines, with every action inside the
    24px gutters and every label on one line; at 640px it fits on one
    line.
  - Lighthouse 12 on `/`, the median of three runs after a warm-up: mobile
    96/100/100 (the warm-up and all three runs 96; LCP 2.8 s, the intro
    paragraph; CLS 0), desktop 100/100/100 (LCP 0.6 s; CLS 0). Mobile
    matches P6's recorded 96, one point above the gate.
- **Found while checking the fills, not a P8 criterion:** on a phone whose
  viewport is about 650–750px tall, the fixed corner button covers part of
  the action row when `/` first loads. The corner button fills the band
  14–54px above the viewport's bottom edge, and the row's first line sits
  at 632–671px from 390px wide up, or 658–697px at 360–375px.
  - Measured at scroll 0: at 390×664 it covers 47% of `about`, 47% of
    `interests` and 9% of the chat button; at 393×660, 36%, 36% and 6%;
    at 360×700, 73% of `about` and 26% of the chat button; at 360×740,
    27% and 10%; at 412×715, 23%, 23% and 1%.
  - No overlap at 360×640, 375×667, 412×780, 414×736, 360×800, or
    390×844 and taller.
  - It clears as soon as the page scrolls. The row has sat there since
    `671f343` and `4224cc8`, but the fills make the overlap much easier
    to see. Flagged to Suyu on 2026-09-15; a fix changes the corner
    button or the row, so it is a separate decision.
- **Earlier evidence**, superseded by the above: 49 checks on `8a35d04`
  (before the fills; Lighthouse mobile 96/100/100 in all three runs,
  desktop 100/100/100, and the same fold figures), and 28 on `5785a8b`
  and 38 on `52d1c58` (P6 and P7, before v1.7), with the first featured
  card moving 618px → 624px and 618px → 660px.
