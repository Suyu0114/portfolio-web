# SPEC v1.13 amendment — a Traditional Chinese edition

Date: 2026-10-28
Author: Claude in Claude Code, for Suyu. Suyu asked, in Claude Code on
2026-10-28, for the portfolio to have a Traditional Chinese version that a
visitor can switch to and from English. Chosen from options with
trade-offs, all on 2026-10-28:
- **Scope:** the whole site, the four case studies included, rather than
  leaving case-study bodies in English.
- **PATS:** unchanged, in English on both editions, rather than translating
  the widget's copy or letting PATS reply in Chinese.
- **Fonts:** Iansui (芫荽) for Chinese display text, the system's Chinese
  sans for Chinese body text. Not chosen: LXGW WenKai TC, or system fonts
  only.
- **Switch:** in the nav from `sm` up, plus a line in the footer at every
  width. Not chosen: a line above the nav, or the footer only.

Status: **approved** by Suyu on 2026-10-28 (plan review). The Chinese copy
itself is drafted by Claude and is **not approved yet**: nothing merges
until Suyu has approved every string (§6), and the fixed-wording items in
§6.2 are Suyu's to write.

**Spec first.** This reverses `CLAUDE.md` rule 7 ("English only. No i18n
scaffolding, no locale routing") and SPEC §2 ("No i18n"), and adds a font
to the set rule 4 freezes. All three have to change in the spec before
they change in the code.

**Numbers checked** on 2026-10-28: local `main` is at `6489f57` (SPEC
v1.12, SPEC-CHATBOT v2.13). `git log --all` and the one other worktree
(`protfolio_web-ux-polish`, at `d500d1a`) claim nothing past v1.12, and no
`SPEC_v1.13` draft exists. Branch: `feat/zh-tw`.

If anything below conflicts with `SPEC.md`, `SPEC-CHATBOT.md` or
`CLAUDE.md`, stop and flag it.

---

## 0. Version block entry

Add to the version list at the top of `SPEC.md`, after v1.12:

```
v1.13 (2026-10-28, per Suyu): a Traditional Chinese edition. Every public
page also exists under /zh-tw (/zh-tw, /zh-tw/projects,
/zh-tw/projects/[slug], /zh-tw/about), the four case studies included;
the English pages keep their URLs and are the default. A visitor switches
with a link in the nav from sm up and in the footer at every width. No
locale detection, no redirects, no i18n library: each locale has its own
root layout, so each page's <html lang> is right, and both stay static.
Chinese display text is set in Iansui (芫荽), only at 20px and up like
Caveat, and Chinese body text in the system's Chinese sans; both load
only on /zh-tw pages, and Latin text keeps Caveat and JetBrains Mono.
Every Chinese string is a translation of an English one, approved by
Suyu, and the build checks that the Chinese keeps every number, section,
figure and visual of its English source (§7.5). PATS stays in English on
both editions (SPEC-CHATBOT.md unchanged). Amends §2, §3, §4.2, §5, §6.3,
§6.5, §7, §8 and §9 (adds P10). New font (Iansui); no new route outside
/zh-tw, service, env var or color token. Source of truth for the change:
`SPEC_v1.13_amendment.md`.
```

## 1. §2 Non-goals (amend)

Replace "No dark mode. No i18n. No CMS. No blog. No comments." with:

> No dark mode. No CMS. No blog. No comments. Two locales only, English
> and Traditional Chinese (v1.13, §5): no i18n library, no locale
> detection from `Accept-Language`, no redirects between locales, and no
> request-time routing for them.

## 2. §3 Tech stack (amend)

- **Fonts** row, append: "v1.13: Iansui (芫荽) for Chinese display text,
  through `next/font`, loaded only by the `/zh-tw` root layout, with
  `preload: false`, since Google Fonts serves it in unicode-range slices
  and a page downloads only the slices its characters need. Chinese body
  text uses the system stack `--font-cjk-sans` (§4.2), nothing
  downloaded."
- New row **Locales** (v1.13): "Static, per locale. `app/(en)/` and
  `app/zh-tw/` are separate root layouts; `app/global-not-found.tsx`
  (`experimental.globalNotFound`) answers unmatched URLs. Copy is typed
  per locale in `lib/`; no i18n library."

## 3. §4.2 Typography (add)

- **Chinese (v1.13).** On `/zh-tw` pages only:
  - Display: Caveat first, then Iansui, then `--font-cjk-sans`. Latin
    characters in a heading stay Caveat; Chinese ones fall through to
    Iansui. Iansui is display-only and ≥ 20px, exactly like Caveat
    (CLAUDE.md rule 5).
  - Body, labels and code: JetBrains Mono first, then `--font-cjk-sans`.
  - `--font-cjk-sans` is frozen: `"PingFang TC", "Noto Sans CJK TC",
    "Microsoft JhengHei", sans-serif`.
  - The stacks are applied by rules that match only `html:lang(zh-TW)`,
    so no English page's CSS changes.
- Full-width Chinese punctuation (，。：；（）) in Chinese text. No
  破折號 (——): CLAUDE.md rule 10 applies to Chinese copy as written.

## 4. §5 Information architecture (amend)

Add, after the route table:

| Route | Page |
|---|---|
| `/zh-tw` | Home, Chinese |
| `/zh-tw/projects` | All projects, Chinese |
| `/zh-tw/projects/[slug]` | Case study, Chinese (same slugs) |
| `/zh-tw/about` | About, Chinese |

- `/resume.pdf` stays the one English PDF (§10: it is never generated or
  edited). `/study` and the API have no Chinese edition.
- A URL that matches no route gets the English notebook 404, under
  `/zh-tw` too: a Chinese 404 for unmatched URLs would need a
  request-time route.
- **Switch (v1.13).** From `sm` up, the nav ends with a link to the same
  page in the other language: `中文` on English pages, `English` on
  Chinese ones. Below `sm` the nav has no room for a fifth item (P6:
  four links already fill 360px), so it is hidden there. The footer
  carries `English · 中文` at every width, the current language as plain
  text and the other as the link. Both are plain `<a>` with `hrefLang`
  and `lang`, since the two locales are separate root layouts and the
  switch is a full page load; the chat transcript survives it, because it
  lives in `sessionStorage`. Pages without a counterpart (`/study`, the
  404) show no switch.
- Nav on Chinese pages: `Suyu.` | 首頁 · 專案 · 關於 · 履歷 (drafts, §6).

## 5. §6.3 and §6.5 (amend)

§6.3, add:
- A Chinese case study is `content/zh-tw/<slug>.mdx`. Its frontmatter is
  `title` and `oneLiner` only; every other field (slug, tags, year,
  stack, featured, order, links) is the English file's, never restated.
  The build fails if either side has a case study the other lacks.
- The h2 ids come from the English headings, paired by position, so an
  anchor is the same in both languages. The build fails if the two
  bodies have a different number of h2s.
- The length budget applies to the English source; the Chinese mirrors
  its structure.

§6.5, add:
- Every public page carries `alternates.canonical` and
  `alternates.languages` (`en`, `zh-TW`, and `x-default` pointing to
  English). The sitemap lists both editions with the same alternates.
- Chinese pages: `og:locale` `zh_TW`, titles `{頁面} — Suyu` (the
  metadata pattern rule 10 allows), descriptions in Chinese. They share
  the English OG image, since it is rendered by Satori, which has no
  Chinese font.

## 6. §7 Content: the Chinese copy (new subsection §7.5)

### 6.1 Rules

- A translation is content (CLAUDE.md rule 1). Every Chinese string
  renders one English string; it adds no fact, number, date, name or
  claim, and drops none. Proper names stay in English unless Suyu gives
  the Chinese: Humber Polytechnic, Back Alley Barbell, the OWA,
  BlueJaysFanWeb, PATS, and every library and model name.
- Suyu's display name stays "Suyu". No Chinese name is invented.
- No 「資深」, for the same reason as no "Senior" (§1).
- Digits stay digits: wherever the English writes a number in digits, the
  Chinese writes the same number in digits. An English number word may
  become a Chinese one (six → 六); the build cannot check those, so
  review does.
- Facet tags keep their English keys and `?tag=` values; only their
  labels are translated.
- Chinese copy is drafted by Claude and approved by Suyu string by string,
  in a side-by-side table in the pull request. Nothing ships unapproved.

### 6.2 Fixed wording, Suyu's to write

| Item | English (fixed) | Chinese draft | Approved |
|---|---|---|---|
| Positioning statement (§1), and its §6.5 copies | "Hello, I'm Suyu. For six years, …" | 你好，我是 Suyu。過去六年，我打造支撐企業營運的核心系統：規劃、簽核、資產與銷售。我做的是完整而有效率的解決方案，最近也開始導入 AI，讓它們更聰明。 | ☐ |
| Credential (§6.4) | "Ontario College Graduate Certificate, Information Technology Solutions with Honours" | Kept in English, unglossed: no Chinese rendering risks reading as 研究所、碩士 or 文憑, which §6.4 forbids. | ☐ |
| Work authorization (§10) | "authorized to work in Canada, no employer sponsorship required" | 可在加拿大合法工作，不需雇主擔保 (no permit type, no term: §10) | ☐ |
| Availability (§10) | "Available now for full-time full-stack and software engineering roles — Toronto-based, open to relocation." | 現在即可到職，尋找全職的全端與軟體工程職位。人在多倫多，也願意搬遷。 (no 破折號) | ☐ |
| Companies (§6.4) | Seasonic Electronics; ACTi Corporation | 海韻電子；建碁 (Suyu to confirm both) | ☐ |
| Powerlifting (§6.4) | the 2022 Citizens Sports Games, for Yilan County | 2022 年全民運動會，代表宜蘭縣 | ☐ |

## 7. Integrity checks (new)

Rule 1 and rule 9 breaches are silent; a translation is the easiest place
for one to happen. So the build checks what it can, failing loud
(CLAUDE.md rule 2):

At build time, from `lib/i18n.ts`, called by the Chinese copy module and
by the content loader:
1. **Numbers.** For each English/Chinese pair (every copy string; each
   case study's title, one-liner and body; each visual's labels), the
   multiset of digit tokens in the English must be contained in the
   Chinese. A number only the Chinese has (a month written as 9 where the
   English says "September") must be on an explicit allowlist that names
   the English word it renders. Number words are not checked (§6.1).
2. **Structure.** Same number of h2s, Chinese headings unique, the same
   set of `<Figure src>`, the same visual components in the same order.
3. **No 破折號.** No U+2014 in Chinese copy or Chinese MDX.

In `npm run check`, a new `scripts/check-i18n.mjs`:

4. **Route parity.** Every public route in `app/(en)` has a `/zh-tw`
   twin, and every `/zh-tw` route an English one.
5. **No hop back to English.** Internal links in `content/zh-tw/` and in
   the Chinese copy go to `/zh-tw/…` or to an asset (`/resume.pdf`,
   `/screens/…`).

Typecheck enforces the rest: the Chinese copy is typed from the English
shape, so a key missing on either side does not compile.

## 8. §8 Component inventory (amend)

Add `SiteShell` (v1.13), `LanguageSwitch` (client, v1.13), `NotFoundNote`
(v1.13), and the page bodies shared by both locales: `HomePage`,
`ProjectsPage`, `CaseStudyPage`, `AboutPage` (v1.13).

## 9. §9 Phases: add P10

**P10 — Traditional Chinese (v1.13).**
Work:
- Routes in `app/(en)` and `app/zh-tw`, `app/global-not-found.tsx`.
- `lib/i18n.ts`, the copy split by locale, shared page bodies, the MDX
  component factory and heading pairing.
- The integrity checks (§7) and `scripts/check-i18n.mjs`.
- The `/zh-tw` layout, Iansui, the Chinese font stacks, and
  `check-tokens` updated for them.
- `LanguageSwitch`, alternates, sitemap, OG locale.
- The Chinese copy and the four Chinese case studies, approved by Suyu.

✓ when:
- **Build gates:** lint, typecheck, `npm run check` (with `check-i18n`)
  and build all pass with zero env vars.
- **English unchanged:** full-page screenshots of `/`, `/projects`, a
  case study and `/about` at 1366×768 and 360×740 match the pre-P10 ones
  except for the switch; the first featured card still starts inside a
  1366×768 viewport.
- **Performance:** Lighthouse (production build, median of three after a
  warm-up): `/` at least 94 on mobile (§1) and ≥ 95 on desktop, as
  before; `/zh-tw` the same; no CLS on either. No English page requests
  an Iansui file.
- **Locale markup:** `<html lang="en">` on English pages and `zh-TW` on
  Chinese ones; alternates reciprocal with `x-default` on English; the
  sitemap lists every page in both.
- **Switch:** on every public page the nav (from 640px) and the footer
  link to the counterpart; at 360px the nav doesn't overflow and hides
  its switch; `/study` and the 404 show none; the chat transcript
  survives a switch.
- **404:** `/foo`, `/zh-tw/foo` and `/zh-tw/projects/unknown` return 404.
- **Fonts:** Chinese headings in Iansui, all at 20px and up; Chinese body
  text in the system sans.
- **Content:** every Chinese string approved by Suyu (§6); the number
  and structure checks pass; no 破折號 and no 資深 in Chinese copy; the
  work-authorization wording exactly as approved.
- **PATS:** opens on Chinese pages and answers as before; the Chinese
  hero button opens it.
- **No JavaScript, reduced motion, WebKit:** every piece of text on the
  Chinese pages is visible without JavaScript; under reduced motion they
  behave like the English ones; the font and hero checks repeated in
  Playwright WebKit.
- **Mobile:** at 360×740 and 390×664 no Chinese page scrolls
  horizontally.
- **Console:** no errors or warnings while doing all of the above.

## 10. `CLAUDE.md` and `SPEC-CHATBOT.md` sync

`CLAUDE.md`:
- Rule 7 becomes: "**Two locales, no more.** English and Traditional
  Chinese (SPEC v1.13): English is the default and its URLs never change;
  Chinese lives under `/zh-tw`. No i18n library, no locale detection, no
  redirects, no request-time locale routing. A third locale is a spec
  change."
- Rule 1: a Chinese string is a translation of an English one and is
  approved by Suyu; it adds and drops nothing.
- Rules 4 and 5: Iansui and `--font-cjk-sans` join the font set; Iansui
  is display-only at ≥ 20px like Caveat.
- Rule 10: also covers Chinese copy (no 破折號).
- Workflow: P10 (v1.13).

`SPEC-CHATBOT.md`: §2's `app/study/*` is now at `app/(en)/study/*`, with
the same URLs and code; a one-line path note there, no version bump. The
widget renders on Chinese pages unchanged, in English. Known difference:
on a Chinese case study the "Ask about this project" chip does not
appear, because the widget matches only `/projects/<slug>` (§6), and
changing that is a SPEC-CHATBOT change.

## 11. Choices made while building it

1. **Spike S1 (2026-10-28): two root layouts work on Next 16.2.10.**
   Built and served (`next start`): `/`, `/about`,
   `/projects/ask-my-notes`, a stub `/zh-tw` and
   `/zh-tw/projects/ask-my-notes` return 200; `/foo`, `/zh-tw/foo`,
   `/projects/unknown` and `/zh-tw/projects/unknown` return 404 with the
   notebook 404 and `noindex`; `/study` still 307s to `/study/login`.
   `(en)/not-found.tsx` stays, for the `notFound()` in
   `/study/session/[id]`.
2. **Spike S2: metadata files.** `icon.svg` at the app root still reaches
   every page. `opengraph-image.tsx` did not: with the layout's
   `openGraph` object one segment deeper than the image, the English
   pages lost `og:image`. It moved into `app/(en)/` beside the layout,
   which restored it; Next now names it `/opengraph-image-<hash>`. The
   case studies had no `og:image` before this change either (their own
   `openGraph` replaces the layout's), and still don't; unchanged here.
3. **`<html>` stays in the layout files.** Next's `no-head-element` lint
   rule allows `<head>` only under `app/`, so each root layout (and
   `global-not-found.tsx`) renders the document, and `SiteShell` renders
   what goes inside `<body>`.

## 12. Out of scope for v1.13

- PATS in Chinese: the widget's copy, Chinese replies, the per-project
  chip on Chinese pages (SPEC-CHATBOT).
- A Chinese OG image (Satori has no Chinese font), a Chinese resume, a
  Chinese 404 for unmatched URLs.
- Locale detection, a remembered preference, redirects.
- A third locale.

## 13. P10 run

To be filled in with the P10 measurements.
