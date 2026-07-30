/**
 * Site copy — SPEC.md §1, §5, §6.1. Content constants per CLAUDE.md
 * conventions; no prose hardcoded inside components. Featured cards
 * come from content/*.mdx frontmatter, not from here.
 */
export const HERO = {
  headline: "field notes",
  // Positioning statement (SPEC §1); final wording tweakable at P3.
  intro:
    "I'm Suyu — I build data products end-to-end, from raw pipelines to statistical models to the interfaces people actually use.",
  subline: "Toronto · data engineering / analytics / full-stack",
  doodleCaption: "calibration, hand-checked",
} as const;

/** Contact details — supplied by Suyu (SPEC §10). */
export const CONTACT = {
  availability:
    "Available now for full-time data engineering, analytics, and full-stack roles — Toronto-based, open to relocation.",
  email: "suyu0229@gmail.com",
  github: "https://github.com/Suyu0114",
  linkedin: "https://www.linkedin.com/in/suyu-cheng",
} as const;

export const FOOTER = {
  handNote: "drawn with rough.js",
} as const;

/**
 * About page copy — SPEC §6.4. Bio + "how I work" + interests, drawn
 * from the approved positioning (§1) and verified project facts.
 */
export const ABOUT = {
  headline: "about",
  bio: [
    "I'm Suyu — I recently completed a postgraduate program in Information Technology Solutions (with Honours) at Humber Polytechnic in Toronto. I build data products end-to-end: the pipeline that pulls the data, the model that makes sense of it, and the interface people actually use.",
    "I'm a Taiwanese citizen with a three-year Canadian work permit — authorized to work here without sponsorship — and open to full-time data engineering, analytics, and full-stack roles. The projects here are meant to show real decision depth, not a feature checklist.",
  ],
  howIWork: {
    heading: "how I work",
    intro:
      "The through-line across these projects is a working discipline borrowed from research: decide the rules before you can be tempted to bend them.",
    points: [
      {
        title: "Design, then implement",
        body: "A written spec is the source of truth. I plan the decisions on paper first, then write code against them — so the hard choices are made deliberately, not mid-keystroke.",
      },
      {
        title: "Pre-registration",
        body: "In the BaZi study I froze 47 hypotheses before inspecting a single correlation, so there was no way to tune my way to a positive result.",
      },
      {
        title: "Frozen test vectors",
        body: "The World Cup value maths was written once in Python and ported to TypeScript, with golden vectors keeping the two locked in sync — 84 passing tests.",
      },
      {
        title: "Fail-loud pipelines",
        body: "My ETL raises on an unmatched team name or a silently-shifted coordinate rather than approximating. A loud failure beats a plausible-looking wrong answer.",
      },
    ],
  },
  interests: [
    "Outside the code: baseball, and the Blue Jays in particular — which is how BlueJaysFanWeb happened.",
    "I also have a long-standing interest in BaZi (八字), Chinese birth-chart astrology. It's the honest origin of the pre-registered study: a subject I have a soft spot for made the perfect adversary for testing whether I could stay rigorous about something I wanted to believe.",
  ],
} as const;
