# SPEC v1.6 amendment — UX polish and photos

Date: 2026-09-14
Author: Suyu, with Claude in Claude Code. Every decision below was made by
Suyu in the planning session of 2026-09-14; this file writes them down.
Status: **approved** by Suyu on 2026-09-14, together with the
knowledge-pack wording in §6.1 and the /about draft copy in §10. This
file is the source of truth for the change.

**How to use this file.** Once approved, apply every section to `SPEC.md`,
and to `SPEC-CHATBOT.md` and `CLAUDE.md` where noted. Then implement.
Don't improvise beyond what's written here. If anything below conflicts
with `SPEC.md`, `SPEC-CHATBOT.md` or `CLAUDE.md`, stop and flag it.

**Two phases, two PRs.**
- **P6 (§§1–6):** UX polish, plus a fact correction in the knowledge pack.
  Needs no assets, so it ships first.
- **P7 (§§7–11):** personal photos. Ships once Suyu has supplied the
  photo files.

**The ground rule for both** is Suyu's direction: nothing flashy. Every
change has to earn its place through orientation, readability or
accessibility, and the hand-drawn feel still comes from line work, not
motion.

---

## 0. Version block entry

Add to the version list at the top of `SPEC.md`, after v1.5:

```
v1.6 (2026-09-14, per Suyu): UX polish and personal photos, nothing
flashy. Adds orientation aids (a case-study contents line and next-note
footer, a nav current-page state, a skip link), a whole-card click
target with a micro hover tilt, the single sanctioned motion moment (h1
underline draw-on), and personal photos on the home hero and /about.
Corrects the powerlifting fact in the chatbot knowledge pack. Amends §2,
§3, §4.1, §4.3, §5, §6.1, §6.3, §6.4, §8, and §9 (adds P6, P7). Source
of truth for the change: `SPEC_v1.6_amendment.md`.
```

Update the status line beneath the version list to read
`(last updated 2026-09-14)`.

---

## Part A — P6: UX polish

## 1. §2 Non-goals: motion (replace)

**Remove:**

> - No animation system beyond micro hover states and at most one
>   scroll-reveal moment (P4, optional, reduced-motion-safe).

**Replace with:**

> - No animation system beyond micro hover states and exactly one motion
>   moment: the page h1's `WobblyUnderline` draws itself once on load
>   (v1.6, §4.3). That moment uses up the old optional P4 scroll-reveal
>   allowance.
> - The moment, and any motion in a hover state (such as the `SketchCard`
>   tilt), runs only under `prefers-reduced-motion: no-preference`.
>   Everyone else sees the static end state immediately.
> - No page transitions, parallax, custom cursors, typing effects, or
>   smooth scrolling.

---

## 2. §4.1 Tokens: text selection (add)

Add after the anti-cliché guard paragraph:

> **Text selection (v1.6).** `::selection` uses `--rule` as background and
> `--ink` as text, so selected text stays on the paper palette instead of
> the browser's default blue. No new token.

---

## 3. §4.3 Sketch utilities (amend)

**Remove:**

> - `WobblyUnderline`: inline SVG quadratic-wiggle path, `--accent`,
>   stroke-linecap round; width adapts to heading.

**Replace with:**

> - `WobblyUnderline`: inline SVG quadratic-wiggle path, `--accent`,
>   stroke-linecap round; width adapts to what it wraps.
>   - Optional `draw`: the path draws on once (about 0.6s) when motion is
>     allowed (§2).
>   - Only page h1s pass `draw`. The nav's current-page underline (§5)
>     never does.

**Add** after the `TagPill` item:

> - `SketchCard`: the whole card is the click target.
>   - It is still one link, stretched over the card, and keeps its
>     distinct accessible name (`read case study: {title}`).
>   - On hover the card tilts 0.5deg: variant a clockwise, variant b
>     counter-clockwise.
>   - Tilt only under `motion-safe`. No shadow, no lift, no color change.

---

## 4. §5 Nav (replace)

**Remove:**

> Nav: `Suyu.` (handwriting) | projects · about · resume.

**Replace with:**

> Nav: `Suyu.` (handwriting) | home · projects · about · resume.
>
> - The current section is marked in `--ink`, with a `WobblyUnderline`
>   (no `draw`) and `aria-current="page"`.
> - `/projects/[slug]` counts as projects. `resume` (a PDF in a new tab) is
>   never marked.
> - Marking needs the pathname, so the links live in a small client
>   component, `NavLinks`.
>
> A `skip to content` link is the first focusable element on every page.
> It is visually hidden until focused and jumps past the nav.

Note: the `home` link has been in the code since commit `1c3a580`
("Add a home link and enlarge the wordmark", 2026-08-22), but this line of
the spec was never updated. The replacement records the existing link;
it doesn't add one.

---

## 5. §6.3 Case study template: page chrome (add)

Add after the length-budget paragraph:

> **Page chrome (v1.6).** Two orientation aids around the MDX body. Both
> are server-rendered, with no client JS.
>
> 1. **Contents line**, under the header: one line of links built from the
>    body's `##` headings.
>    - Each MDX h2 gets a slug id.
>    - The build fails if a heading isn't plain text, or if two slugs
>      collide.
>    - Links carry a resting underline. No smooth scrolling (§2).
> 2. **Footer row**, after the article:
>    - `← all projects` links to `/projects`.
>    - `next note: {title} →` links to the next project by `order`.
>    - From the last project it wraps back to the first.

---

## 6. §9 P6 and the knowledge-pack fix (add)

### 6.1 Knowledge-pack correction (`content/chatbot/interests.md`, CLAUDE.md rule 9)

The current "Outside work" text garbles two facts into one name:
"a representative powerlifting athlete at the Yilan County Citizens Sports
Games in 2022". That reads as a county-level event. Suyu confirmed the real
facts on 2026-09-14:
- In 2022 Suyu **represented Yilan County** in powerlifting at the
  **Citizens Sports Games** (中華民國111年全民運動會).
- The Citizens Sports Games is Taiwan's national multi-sport games, with a
  team from each county and city. The 2022 edition was held in Chiayi
  County. The English name and host come from Wikipedia; the official site
  and the Sports Administration site were unreachable.
- 205 kg squat, 120 kg bench press and 230 kg deadlift are the **official
  results at that meet**.
- Weekend outdoors means hiking in the mountains and **freediving** in the
  sea.

**Remove** (lines 111-114):

> In Taiwan he went to the gym after work, four or five sessions a week. He
> took it far enough to compete: he was a representative powerlifting athlete
> at the Yilan County Citizens Sports Games in 2022, with a 205 kg squat,
> 120 kg bench press, and 230 kg deadlift.

**Replace with:**

> In Taiwan he went to the gym after work, four or five sessions a week. He
> took it far enough to compete: in 2022 he represented Yilan County in
> powerlifting at the Citizens Sports Games (全民運動會), Taiwan's national
> multi-sport games where each county and city sends a team, held that year
> in Chiayi County. His official results at that meet were a 205 kg squat,
> a 120 kg bench press, and a 230 kg deadlift.

**Remove** (lines 118-119):

> On weekends he likes
> getting outdoors.

**Replace with:**

> On weekends he likes
> getting outdoors: hiking in the mountains, or freediving in the sea.

Per SPEC-CHATBOT.md (Claude drafts `interests.md`, Suyu approves before
commit), this diff is shown to Suyu before it's committed.

**Out of scope for this amendment.** The same garbled wording sits in
`public/resume.pdf` (page 2) and in `notes/CV_FS_ERPCRM_v2.md:96`. Suyu
fixes the resume source personally and re-copies the PDF; the PDF is
never edited in this repo.

### 6.2 SPEC-CHATBOT.md §4 table (amend)

The `interests.md` row's Content column is stale; the file has grown past
it. **Replace** only that cell with:

> Baseball (MLB/Blue Jays), other sports, BaZi as a genuine long-term
> interest, working with him, outside work (training and the 2022 Citizens
> Sports Games, cooking, hiking, freediving), topics to decline (content
> corrected per SPEC.md v1.6)

### 6.3 §9 Phases: add P6

> **P6 — UX polish (v1.6).**
> Work:
> - Case-study contents line and next-note footer.
> - Nav current-page state and skip link.
> - On-palette `::selection`.
> - Whole-card click target with hover tilt.
> - h1 underline draw-on.
> - Knowledge-pack correction.
>
> ✓ when:
> - **Build gates:** lint, typecheck, `npm run check` and build all pass
>   with zero env vars.
> - **Skip link:** on a fresh load, the first Tab focuses a visible skip
>   link, which jumps past the nav.
> - **Nav:** marks the right section (with `aria-current`) on `/`,
>   `/projects`, a case study and `/about`.
> - **Case study:** every contents link lands on its h2; next note cycles
>   through every case study and wraps.
> - **Cards:** clicking anywhere on a card opens its case study.
> - **Reduced motion emulated:** no tilt, and the underline is static.
> - **Mobile:** no horizontal scroll at 360px, and the nav doesn't break.
> - **Performance:** Lighthouse ≥ 95 ×3 on `/` (production build), and no
>   CLS.
> - **Content:** the corrected knowledge pack contains no em dash.

---

## Part B — P7: photos

## 7. §3 Tech stack: Images row (replace)

**Remove:**

> | Images | `next/image`, screenshots in `/public/screens/` | |

**Replace with:**

> | Images | `next/image`; screenshots in `/public/screens/` (PNG, via `Figure`); personal photos in `/public/photos/` (JPEG, via `Photo`, statically imported) | Photos: EXIF stripped, long edge ≤ 1600px, ≤ 500 KB each; originals never committed |

---

## 8. §4.1 and §4.3: photos in the design system (add)

Add to `SPEC.md` §4.1, after the text-selection paragraph that amendment §2
adds:

> **Photos (v1.6).** Personal photos are content, not palette.
> - They stay in full color and don't count toward the ≤ ~10% accent
>   budget.
> - Their frame is line work only: `.sk-border-a` / `.sk-border-b` on
>   `--card` with small padding, tilted ≤ 1deg.
> - No shadow, tape, sticker or texture (CLAUDE.md rule 4 and conventions).

Add after the `Figure` item (§4.3):

> - `Photo`: a statically imported photo in a sketch border.
>   - Optional handwritten caption (Caveat, ≥ 20px) and optional ±1deg tilt.
>   - Dimensions come from the import, so there is no layout shift.
>   - Separate from `Figure`, which stays the PNG screenshot frame.

---

## 9. §6.1 Home: hero portrait (add)

Add to item 1 (Hero), after the calibration-doodle sentences:

> A small `Photo` portrait (about 112px wide) sits beside the intro
> paragraph; on mobile it stacks under the headline. It has alt text and
> no caption. The calibration doodle is unchanged.
>
> The portrait loads eagerly. It gets `preload` only if Lighthouse reports
> it as the page's LCP element.

---

## 10. §6.4 /about: portrait and interests (replace)

**Remove:**

> - Interests: MLB/Blue Jays; BaZi (八字) as a genuine long-term interest
>   and the origin of the pre-registered study — personality lives here,
>   stated plainly and confidently.

**Replace with:**

> - Portrait (v1.6): the same photo as the hero, beside the bio. It floats
>   right on desktop and is centered above the bio on mobile.
> - Interests, in blocks of one paragraph plus optional photos. Personality
>   lives here, stated plainly and confidently.
>   1. MLB/Blue Jays, with a photo from a Blue Jays game. Wording unchanged
>      from v1.5.
>   2. BaZi (八字) as a genuine long-term interest and the origin of the
>      pre-registered study. No photo. Wording unchanged from v1.5.
>   3. Powerlifting (new), with two competition photos. Facts:
>      `SPEC_v1.6_amendment.md` §6.1.
>   4. Outdoors (new), with a hiking photo and a freediving photo. Facts:
>      `SPEC_v1.6_amendment.md` §6.1.

**Draft copy for blocks 3 and 4.** Final wording is approved together with
this file. No em dashes (CLAUDE.md rule 10).

> I also lift. Back in Taiwan I trained after work four or five times a
> week, and in 2022 I represented Yilan County in powerlifting at the
> Citizens Sports Games, Taiwan's national multi-sport games where each
> county and city sends a team. My results at that meet: a 205 kg squat,
> a 120 kg bench press and a 230 kg deadlift.

> On weekends I like getting outdoors: hiking in the mountains, or
> freediving in the sea.

Captions and alt text are drafted for each photo once the files exist, and
Suyu approves each one. Captions may state only facts from §6.1 of this
file or from the knowledge pack.

---

## 11. Photo files and privacy (new, for P7)

**Files.** Suyu supplies originals in one local folder.
- **Format:** JPEG. iPhone HEIC is exported to JPEG first. A competition
  photo may be a still taken from the video.
- **Names:** lowercase kebab-case, with no spaces, Chinese characters, full
  name, date or location, because the filename becomes a public URL.
- **Alternatives:** suffixed `-1`, `-2`.

| File | Used for |
|---|---|
| `portrait.jpg` | Hero and /about bio (face clearly visible; may be cropped from a life photo) |
| `bluejays-game.jpg` | Interests block 1 |
| `powerlifting-1.jpg`, `powerlifting-2.jpg` | Interests block 3 |
| `hiking.jpg`, `freediving.jpg` | Interests block 4 |

**Processing.**
- Each original goes through sharp: auto-orient from EXIF, fit inside
  1600×1600, JPEG quality 82 (mozjpeg). The output lands in
  `/public/photos/`.
- sharp drops EXIF, XMP and IPTC, GPS included. This is verified per file.
- Any crop is shown to Suyu first.

**Privacy.**
- No family members (matches the knowledge pack's "Topics to decline").
- No identifiable third party as the subject of a photo. Background crowds
  are fine.
- Nothing that locates Suyu's home or workplace.
- Competition videos stay on YouTube and are not linked or embedded
  (amendment §14).

**§9 Phases: add P7**

> **P7 — photos (v1.6).**
> Work:
> - The `Photo` component.
> - Photos processed into `/public/photos/`.
> - Hero portrait.
> - /about portrait and interest blocks.
>
> ✓ when:
> - **Build gates:** the P6 build gates all still pass.
> - **Photo files:** none has EXIF, XMP or IPTC metadata, and each is
>   ≤ 500 KB.
> - **Accessibility:** every photo has alt text; every caption is Caveat
>   ≥ 20px with no em dash.
> - **Layout:** the hero's height is unchanged at 1366×768 (compared
>   against a before-screenshot), and there is no horizontal scroll at
>   360px.
> - **Performance:** Lighthouse ≥ 95 ×3 on `/` (production build), and no
>   CLS on `/` or `/about`.
> - **Content:** every fact in the new copy traces to `SPEC_v1.6_amendment.md` §6.1 or
>   to the knowledge pack.

---

## 12. §8 Component inventory (replace)

**Remove:**

> `Nav`, `Footer`, `SketchCard`, `TagPill`, `WobblyUnderline`,
> `DoodleArrow`, `Figure`, `RoughChart` (client), `FacetFilter` (client),
> `ContactStrip`, MDX component map (headings with optional underline,
> `Figure`, code blocks in mono on `--card`).

**Replace with:**

> `Nav`, `NavLinks` (client, v1.6), `Footer`, `SketchCard`, `TagPill`,
> `WobblyUnderline`, `DoodleArrow`, `Figure`, `Photo` (v1.6),
> `CaseStudyContents` (v1.6), `NextNote` (v1.6), `RoughChart` (client),
> `FacetFilter` (client), `ContactStrip`, MDX component map (headings with
> optional underline and h2 slug ids, `Figure`, code blocks in mono on
> `--card`).

---

## 13. `CLAUDE.md` sync (amend)

- **Spec version and sources.** Change "`SPEC.md` (site, currently v1.5)"
  to "currently v1.6". Add `SPEC_v1.6_amendment.md` beside
  `SPEC_v1.5_amendment.md`, as the source of truth for v1.6.
- **Workflow.** After the C-phases, add "then SPEC.md phases P6–P7 (v1.6)".
- **Conventions, Images line.** After "screenshots live in
  `/public/screens/`", add "personal photos in `/public/photos/` (JPEG,
  EXIF stripped, rendered through `Photo`)".

Stale details elsewhere in `CLAUDE.md` (the chatbot "currently v2.7", and
"C0–C9" now that C10 exists) are not part of this amendment.

---

## 14. Explicitly out of scope for v1.6

Each of these would be a separate spec decision:

- **Design system:** design tokens, fonts, and the sketch utility system
  beyond §3 and §8. No new color or font; no gradients, drop shadows or
  textures.
- **Standing rules:** dark mode (rule 6) and i18n (rule 7).
- **Media:** video, YouTube links or embeds, a gallery route, a lightbox,
  a carousel.
- **Motion:** page transitions, parallax, custom cursors, typing effects,
  smooth scrolling.
- **Structure:** new nav items; the chatbot runtime surface; the home card
  count; the calibration doodle.
- **Existing content:** case-study bodies (only the chrome around them
  changes), and `Figure`.

---

## 15. Implementation notes

These technical choices were agreed with Suyu in the plan. They are
recorded here so the plan doesn't live only outside the repo.

- **Headings.**
  - `lib/headings.ts` (no `fs` import) exports `slugify` and
    `getH2Headings(body)`, which skips fenced code blocks.
  - The MDX `h2` mapping uses the same `slugify`, so ids and contents
    links cannot drift apart.
- **Nav.** `NAV_LINKS` moves into `components/NavLinks.tsx`.
  `components/Nav.tsx` keeps the header and the wordmark.
- **Skip link target.** The skip link targets a `div#main` wrapping
  `{children}` in `app/layout.tsx`. That covers every route, 404 and
  `/study` included, without touching each page's `<main>`. It has no
  `tabIndex`, so the whole content never gets a focus ring.
- **`SketchCard`.**
  - The stretched link uses an `::after` overlay on the existing `Link`.
  - The focus ring stays on the link text: the unlayered `:focus-visible`
    rule in `globals.css` can't be overridden by utilities anyway.
- **Draw-on.** Uses `pathLength={1}` with a
  `stroke-dasharray`/`stroke-dashoffset` keyframe, declared inside
  `@media (prefers-reduced-motion: no-preference)`.
- **`Photo`.**
  - Props: `image`, `alt`, `sizes`, `caption?`, `rotate?`
    (`"none" | "cw" | "ccw"`, mirroring `TagPill`), `border?`, `load?`
    (`"lazy" | "eager" | "preload"`), `className?`.
  - `preload` maps to Next 16's `preload` prop, never `priority`.
- **About copy.** `ABOUT.interests` becomes
  `{ body, photos }[]`. The two existing `body` strings are kept
  byte-identical.
