# SPEC v1.11 amendment — a motion system

Date: 2026-09-25
Author: Claude in Claude Code, for Suyu. Suyu decided what changes, in
Claude Code on 2026-09-25: the site felt too static and the note-card
corner curl looked fake and uneven, so it gets a motion system with a
single rhythm (hover about 300ms, a soft ease-out, little bounce). Chosen
from a list with trade-offs: a home hero opening, one-time scroll
reveals, chart entrances, a site-wide hover rhythm, a rebuilt card hover
with a real 3D corner peel, small arrow and underline moves, the
`motion` library, and an animated reflow on the /projects filter. Not
chosen: page transitions and pointer-following effects.
Status: **approved** by Suyu on 2026-09-25 (plan review); built and
verified 2026-09-25 to 2026-09-26 on `feat/motion`. One decision taken
with Suyu along the way: accept 94 on `/` mobile Lighthouse (§11 item 11).
§§0–9 went into `SPEC.md` with the first commit and were adjusted where
§11 says so; §10 went into `CLAUDE.md` with the last one. The P9 run is in
§13.

**Spec first.** Unlike v1.8, this file is written before the code: it
reverses SPEC §2's "exactly one motion moment" rule, which CLAUDE.md says
must change in the spec before it changes in the code.

**Numbers checked** on 2026-09-25: `origin/main` is at `c217426`, SPEC.md
v1.10 (volunteering) was uncommitted in the main checkout and was
committed first on this branch (`feat/motion`, `46b8d23`), no other
branch or worktree claims v1.11, and no `SPEC_v1.1x` draft exists.
SPEC-CHATBOT.md is untouched: the chat widget and `/study` keep their
current motion (§12).

If anything below conflicts with `SPEC.md`, `SPEC-CHATBOT.md` or
`CLAUDE.md`, stop and flag it.

---

## 0. Version block entry

Add to the version list at the top of `SPEC.md`, after v1.10:

```
v1.11 (2026-09-25, per Suyu): a motion system. The site felt too static,
and the note-card corner curl looked fake and uneven. Motion becomes one
token set in `lib/motion.ts` (easing, duration, stagger, distance,
spring) that every component reads, with a single rhythm: hover about
300ms on a soft ease-out, a faster exit, and springs that barely
overshoot. Adds a staggered opening on the home hero, one-time scroll
reveals on cards and case-study figures, chart entrances, a hover
transition on every link, button and chip, small arrow and underline
moves, the /projects filter reflow, and a rebuilt card hover whose corner
peels up in 3D and lines up with both border variants. Adds the `motion`
library for the effects that need JavaScript; whatever plays at first
paint stays CSS. Every effect runs only under
`prefers-reduced-motion: no-preference`, and no content needs JavaScript
to be visible. Page transitions, parallax, custom cursors,
pointer-following effects, typing effects, smooth scrolling and
scroll-jacking stay out. Amends §2, §3, §4.3, §5, §6.1, §6.2, §8 and §9
(adds P9), and adds §4.4. No new route, service, env var, color token,
or font. Source of truth for the change: `SPEC_v1.11_amendment.md`.
```

Update the status line beneath the version list to 2026-09-25.

## 1. §2 Non-goals: motion (replace)

**Replace** the three bullets that start "No animation system beyond",
"The moment, and any motion in a hover state" and "No page transitions"
with:

```
- Motion is one small, token-driven system (v1.11, §4.4): micro hover
  states, the home hero's opening, one-time scroll reveals, chart
  entrances, and the /projects filter reflow. The h1 underline draw-on
  (v1.6) is part of it. Every duration, easing, stagger, distance and
  spring comes from `lib/motion.ts`.
- All of it runs only under `prefers-reduced-motion: no-preference`.
  Everyone else sees the static end state immediately. No content needs
  JavaScript, or an animation, to become visible.
- No page transitions, parallax, custom cursors, pointer-following
  effects, typing effects, smooth scrolling, scroll-jacking,
  scroll-scrubbed animation, or numbers that count up.
```

## 2. §3 Tech stack (add a row)

After the Charts row:

```
| Motion | `motion` (`motion/react`): `m` components under `LazyMotion strict`, features imported asynchronously | v1.11. Only for effects that need JavaScript (§4.4): scroll reveals, chart entrances, the filter reflow. Whatever plays at first paint is CSS. |
```

## 3. §4.3 Sketch utilities (amend)

- `WobblyUnderline`: after the `draw` bullets, add "Optional `hover`
  (v1.11): the path draws on while the link it sits in is hovered. The
  nav's links that aren't current use it."
- `DoodleArrow`: add "Optional `draw` (v1.11): the arrow draws itself in
  once, on load or with the reveal it sits in (§4.4)."
- `SketchCard`: **replace** the three bullets that start "On hover the
  card tilts", "On the same ease" and "The curl is the site's only
  gradient" with:

```
  - On hover the card tilts 0.5deg (variant a clockwise, variant b
    counter-clockwise) and lifts 2px, on the hover duration going in and
    the shorter exit duration coming out (§4.4; v1.8 used 400ms both
    ways, v1.6 Tailwind's 150ms).
  - Its bottom-right corner peels up like a sticky note (v1.8, rebuilt
    v1.11). The corner turns over in 3D along a fixed crease rather than
    growing out of a point, so the ink outline keeps its width and the
    shadow only fades. It is clipped to the card's own border shape, so
    it meets the border the same way on variant a, variant b and any
    card height. Where it lifted, the page shows through, shaded along
    the crease; the flap is the note's back, shaded with a gradient,
    outlined in ink, with a soft shadow on the card.
  - The peel is the site's only gradient and shadow (CLAUDE.md
    conventions). Every color in it is one of the frozen tokens `--ink`,
    `--rule`, `--card` and `--paper`, or a `color-mix()` of them. The
    card itself gains no shadow and no color change.
```

- Add, after `Photo`:

```
- `LinkArrow` (v1.11): the `→` or `←` at the end of a text link, which
  moves 3px in its own direction while the link (or the card around it)
  is hovered. It stays in the link's accessible name.
- `Reveal` (client, v1.11): wraps content that fades up once when it
  scrolls into view (§4.4). It renders its content visible and only
  hides what is still below the viewport after hydration.
```

## 4. §4.4 Motion (new section, after §4.3)

```
### 4.4 Motion (v1.11)

One token set, in `lib/motion.ts`. CSS reads it as `--motion-*`
variables rendered into the page head, Tailwind through preset class
strings in the same file, and Motion through transition objects built
from it. `npm run check` fails on a raw duration, easing or spring
anywhere else.

| Token | Value | Use |
|---|---|---|
| ease out | cubic-bezier(0.22, 0.61, 0.36, 1) | hovers, reveals |
| ease in-out | cubic-bezier(0.65, 0, 0.35, 1) | lines drawing on |
| press | 120ms | a button pressed |
| hover | 300ms | going into a hover |
| exit | 200ms | coming out of a hover |
| peel / peel exit | 400ms / 240ms | the card corner |
| reveal | 500ms | fades up, the hero opening |
| draw | 600ms | underlines, doodles, arrows |
| chart | 700ms | bars growing |
| stagger | 70ms (tight 40ms) | items in sequence |
| base delay | 100ms | the hero opening's start |
| distances | 12px reveal, 2px lift, 3px arrow | |
| spring | visual duration 0.35s, bounce 0.1 (never above 0.15) | lifts, the filter reflow |

These values may be tuned during P9, in `lib/motion.ts` only, and the
table updated with them.

Where each effect applies:
- Hover (every page but the chat widget and /study): links, chips and
  the contents line ease their color; the hero buttons also lift 2px and
  settle 1px when pressed; the nav's other links draw a wobbly underline;
  arrows at the end of links move 3px; note cards tilt, lift and peel
  (§4.3).
- Home hero opening (CSS, on every load of `/`): the headline and the
  intro paragraph are there from the first paint. The underline draws
  on, the portrait settles onto the page (a transform only, never
  faded), the sub-line and the three buttons fade up in turn, and the
  calibration doodle draws its axes and lines, then its caption. About
  one second in all.
- Scroll reveals (`Reveal`, once each): on `/`, the featured-notes head
  with its arrow, the cards in turn, `all projects →` and the contact
  strip; on `/projects`, cards below the first screen, while the chips
  and the grid fade up as one block on load; on a case study, figures
  and architecture diagrams only, the diagram's steps in turn with their
  arrows drawing between them. Body text and headings never wait.
- Charts: when a case-study bar chart comes into view, its baseline
  draws, the bars grow from it in turn, their values fade in, and the
  threshold line draws last. Values never count up.
- The /projects filter: cards that stay slide to their new places,
  cards filtered out fade away, and cards that return fade in.

Rules:
- Only transform and opacity animate, plus the stroke or clip of a few
  small SVG paths and the colors of a hover. Nothing animates layout.
- An animation's end state is the static page, pixel for pixel.
- Content never needs JavaScript to be visible, and what may be the
  largest contentful paint (a page's h1, the home intro, the portrait, a
  case study's one-liner) never starts hidden.
- Whatever plays at first paint is CSS; Motion is only for effects that
  need JavaScript, and loads its features after hydration.
- Under `prefers-reduced-motion: reduce` nothing moves: CSS animations
  are declared only under `no-preference`, and the Motion effects check
  the preference themselves, since the global reduce rule does not reach
  them.
```

## 5. §5 Information architecture: nav (amend)

In the nav bullet on the current section, after "(no `draw`)", add ";
the other links draw the same underline on while hovered (v1.11)".

## 6. §6.1 Home (amend)

- Hero: **replace** "This SVG is decorative and static — not rough.js,
  not data-bound." with "This SVG is decorative: not rough.js, not
  data-bound. It draws itself in once as part of the hero's opening
  (v1.11, §4.4)."
- Actions: **replace** "On hover each fills with `--ink`, and nothing
  moves." with "On hover each fills with `--ink` and lifts 2px (v1.11,
  §4.4)."

## 7. §6.2 /projects (amend)

**Replace** "no external library" with "no filtering library; the
reflow animates with Motion (v1.11, §4.4)".

## 8. §8 Component inventory (amend)

Add `LinkArrow` (v1.11), `Reveal` (client, v1.11) and `MotionProvider`
(client, v1.11) after `ContactIcons` (v1.9).

## 9. §9 Phases: add P9

After P8:

```
**P9 — motion (v1.11).**
Work:
- `lib/motion.ts`, its CSS variables, `MotionProvider`, and the
  `check-motion` gate in `npm run check`.
- The hover rhythm, `LinkArrow` and the nav's hover underline.
- `SketchCard`: tilt, lift and the rebuilt corner peel.
- The home hero opening and the calibration doodle drawing in.
- `Reveal` and its placements; the /projects block fade.
- Chart entrances in `RoughBarChart`.
- The /projects filter reflow.

✓ when:
- **Build gates:** lint, typecheck, `npm run check` (with
  `check-motion`) and build all pass with zero env vars.
- **Hero:** screenshots at 0, 150, 300 and 600ms and at the end, at
  1366×768; the headline and the intro are visible in the first one.
- **Cards:** at rest, halfway and settled, zoomed 3×, on variant a and
  variant b: the peel meets the border cleanly and its outline keeps its
  width; the exit is shorter than the entry; a click inside the peel
  still opens the case study; the same on `/projects`.
- **Hover:** the hero buttons, nav, arrows and chips, halfway and
  settled.
- **Reveals and charts:** halfway and settled on `/`, `/projects` and
  both chart case studies; nothing already on screen when the page
  hydrates flashes.
- **Filter:** halfway and settled after a chip click; no flash when the
  filter replaces the prerendered grid.
- **End state:** once everything settles, full-page screenshots at
  1366×768 and 360×740 match the pre-P9 ones.
- **Mobile:** at 360×740 and 390×664 nothing scrolls horizontally and
  the hero row wraps as before.
- **Reduced motion emulated:** nothing runs after load, cards neither
  tilt nor peel, revealed content is there at once, charts are drawn
  complete, and the filter swaps instantly.
- **No JavaScript:** every piece of text on `/`, `/projects` and a case
  study is visible.
- **WebKit:** the hero, card, reveal and reduced-motion checks repeated
  in Playwright WebKit.
- **Performance:** Lighthouse ≥ 95 ×3 on `/` (production build; the
  median of three runs after a warm-up), and no CLS. With the CPU
  throttled 4×, the 95th-percentile frame during the hero opening and
  the reveals is at most 33ms, and no long task comes from the motion
  code. `/`'s first-load JavaScript grows by about 20 KB gzipped at
  most.
- **Console:** no errors or warnings while doing all of the above.
```

## 10. `CLAUDE.md` sync

With the commit that finishes P9:

- The header: `SPEC.md` is currently v1.11; name
  `SPEC_v1.11_amendment.md` beside the other amendments, with §11 as the
  record of the choices made while building.
- Conventions: a **Motion (v1.11)** block. Every motion value comes
  from `lib/motion.ts` (`npm run check` enforces it), with the rhythm,
  the transform-and-opacity rule, the end-state and no-JavaScript rules,
  CSS for what plays at first paint and Motion only for what needs
  JavaScript, reduced motion on both paths, and the list of what stays
  out (§1). New components reuse the presets, `Reveal` and `LinkArrow`
  rather than hand-rolling motion.
- Workflow: add P9 (v1.11) after P8.

## 11. Choices made while building it

1. **Motion classes live in `globals.css`.** The plan put Tailwind class
   presets in `lib/motion.ts`. Hovers that exit faster than they enter
   need a base rule and a `:hover` rule with different durations, behind
   `(hover: hover)` and sometimes the motion media query too, so they are
   `mo-*` classes beside the `sk-*` sketch utilities instead. Every value
   in them is still a `--motion-*` variable from `lib/motion.ts`.
2. **`lib/motionCss.ts` serialises the tokens.** It is the only file that
   calls Motion's `spring()`, so client components that read a token don't
   ship it. The spring's CSS form is Motion's own output: `linear(...)`
   with a 500ms settle for visual duration 0.35s, bounce 0.1 (peak 1.001).
3. **The h1 underline now ends on the static line.** The v1.6 draw
   finished on a full-length dash, 3 to 13 pixels off the static path; the
   new draw hands back the plain path. Its keyframes use a 1-2 dash pattern
   starting just past the path, which also removes a stray round-cap dot
   the v1.6 underline showed before it drew.
4. **`LinkArrow` draws its own underline.** An `inline-block` doesn't
   receive its link's underline, so the arrow takes
   `text-decoration: inherit`. On an underlined link the two underlines
   meet with a 1px antialiasing seam (the case-study header links), the
   only rest-state pixel that differs from before P9.
5. **The peel.** The corner turns 165deg about its 45deg crease with
   `perspective: 500px`. The front face is a copy of the card's border box
   (fill, ink border, the card's own `border-radius`) cut to the corner
   triangle, and the back face is the same box mirrored in z, so the lift
   starts from exactly what was there and the folded flap is the corner
   reflected across the crease. The shadow is that reflected footprint,
   blurred 2px, nudged 3px up and left, only fading. The v1.8 overlay's
   mismatches were confirmed first (the right border showing inside the
   lifted area on variant a, a bottom-border stub on variant b, the ink
   thinning at 150ms).
6. **`/projects` settles rather than fades.** A card's one-liner is that
   page's largest contentful paint (measured), so fading the grid would
   break §4.4's own rule. The grid block settles with a transform only,
   and the chips, which render on the client only, rise as they mount.
   §4.4's placement text says so.
7. **`Reveal`.** The first IntersectionObserver report decides: content
   wholly below the viewport is hidden, anything else is left alone.
   Blocks that start in the same moment stagger automatically. It marks
   itself `data-reveal="shown"` to start CSS steps inside it, which is how
   `ArchFlow` builds stage by stage and `DoodleArrow` draws.
8. **Charts** use Motion's `inView` (30% visible) and `motion/mini`'s
   `animate`, and drop every inline style once they finish, so the settled
   chart is the plain drawing.
9. **The filter** animates `layout="position"`, so a moving card never
   scales its text, with `popLayout` exits. Its markup must not depend on
   the reduced-motion preference: `next dev` server-renders `FacetFilter`
   without knowing it, and a markup branch produced a hydration mismatch.
   Only the transition changes, to instant. §4.4 gained that as a rule.
10. **Motion loads its features after `load`, when the main thread is
    idle**, and Next optimises Motion's barrel imports
    (`optimizePackageImports` in `next.config.ts`), with `m` from
    `motion/react-m`. Without that, `Reveal` and `FacetFilter` importing
    from `motion/react` made Turbopack ship both feature packs as initial
    scripts on `/`: first-load JS 209.7 KB and mobile Lighthouse 91. After:
    178.5 KB and 94. §4.4's loading rule says so.
11. **94 on mobile, accepted (2026-09-26).** Loading Motion's runtime in the
    root layout alone moved `/` mobile Performance from 96 to 94 (removing
    `MotionProvider` and nothing else restored 96). Offered: keep Motion
    but load it lazily, or do the reveals in plain CSS. Suyu chose to accept
    94. §1 notes the exception, and P9's performance line checks 94 on
    mobile rather than 95. It also checks that no long task comes from *an
    animation* rather than from *the motion code*: under 4× CPU throttling
    the hydration long task at load is 130 to 190ms longer than before P9,
    which is the same accepted cost of shipping Motion, while scrolling
    through the reveals produces no long task at all.
12. **Out-of-scope findings, left as they were:** at 360px,
    `/projects/bluejays-fan-web` is 10px too wide because of the
    unbreakable `github.com/Suyu0114/BlueJaysFanWeb` link in its body
    (predates this branch); the study chart's `q = 0.10` label sits on its
    own line (predates it too).

## 12. Explicitly out of scope for v1.11

- The chat widget and panel (SPEC-CHATBOT.md §6) and `/study`: no motion
  changes, so no SPEC-CHATBOT.md version. The corner chat button does
  not lift like the hero chat button; aligning them is a v2.x change.
- `/about` gets only what its shared components bring (link colors,
  arrows); no reveals, no opening.
- Page transitions and pointer-following effects: offered, not chosen.
- `RoughChart`: still unused and still inventoried (CLAUDE.md).

## 13. P9 run (2026-09-26)

On `feat/motion` at `7270904`. Browser checks drove Chrome headless over
CDP against `next dev` (as Suyu asked) and, for pixels and Lighthouse,
against `next start`; WebKit through Playwright 1.63. Scrolling used real
wheel input: a scripted `scrollTo` doesn't end LCP tracking, which makes
`next dev` warn that a screenshot below the fold "was detected as" LCP.

- **Build gates:** pass. In a detached worktree with no env file and no
  `next-env.d.ts`: lint, typecheck, `check` (tokens, links, motion) and
  build.
- **Hero:** the opening runs 100 to about 1160ms; headline, intro and
  portrait are at opacity 1 at t=0. Frames at 0, 150, 300, 600ms and the
  end.
- **Cards:** enter 300ms (peel 400ms, shadow delayed 133ms), exit 200ms
  (peel 240ms); a and b meet the border cleanly at 160ms and settled, in
  Chrome and WebKit; a click 14px inside the corner opens the case study;
  same on `/projects`.
- **Hover:** fills, colors and underlines 300ms in, 200ms out; button
  lift on the 500ms spring settle.
- **Reveals and charts:** below-the-fold blocks hide after hydration and
  fade up once; nothing on screen at hydration moves; charts are hidden
  until 30% in view and settle to the plain drawing.
- **Filter:** kept cards slide (about 450ms), leaving cards fade and
  shrink to 0.98; 165 to 173 frames sampled through the fallback swap, no
  card's opacity dips.
- **End state:** full-page screenshots at 1366×768 and 360×740 on five
  pages match the reduced-motion render taken after M1, apart from §11
  item 4's pixel.
- **Mobile:** no horizontal scroll at 360×740 or 390×664 on any page but
  the one in §11 item 12; the hero row wraps as before, no label wraps.
- **Reduced motion:** nothing runs, nothing is hidden, cards neither tilt
  nor peel, charts are drawn complete, the filter swaps instantly, in
  Chrome and WebKit.
- **No JavaScript:** every text element on `/`, `/projects` and a case
  study is fully opaque at both widths.
- **Performance:** mobile Lighthouse on `/` 94, 95, 93 (median 94, LCP
  3.0s, CLS 0; before P9: 96, LCP 2.8s); desktop 100/100/100. First-load
  JS on `/` 178.5 KB against 159.5 KB before (+19 KB). CPU 4×: `/` opening
  p95 frame 25.1 to 33.5ms (before: 16.7), reveals p95 16.8 to 25.1ms with
  no long tasks (before: 8.5).
- **Console:** production, 8 pages × 2 widths, with and without reduced
  motion: no messages. `next dev` adds one development-only Motion notice
  when reduced motion is on ("You have Reduced Motion enabled"), which
  production strips.
