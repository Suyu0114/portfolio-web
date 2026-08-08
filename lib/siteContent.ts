/**
 * Site copy — SPEC.md §1, §5, §6.1. Content constants per CLAUDE.md
 * conventions; no prose hardcoded inside components. Featured cards
 * come from content/*.mdx frontmatter, not from here.
 */
export const HERO = {
  headline: "field notes",
  // Positioning statement (SPEC §1); wording finalized at v1.5. The
  // absence of "Senior" is deliberate — see SPEC §1.
  intro:
    "I'm Suyu. Six years building the systems businesses actually run on: planning, approvals, assets, sales. End to end, and lately with AI features on top.",
  subline: "Toronto · full-stack · ERP & business systems · AI integration",
  doodleCaption: "calibration, hand-checked",
} as const;

/** Contact details — supplied by Suyu (SPEC §10). */
export const CONTACT = {
  availability:
    "Available now for full-time full-stack and software engineering roles — Toronto-based, open to relocation.",
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
  // Bio order and the exact credential wording are fixed by SPEC §6.4.
  // Every fact traces to notes/CV_FS_ERPCRM_v2.md; body prose carries no
  // em dashes (CLAUDE.md rule 10).
  bio: [
    "I'm Suyu. I spent six years in two-to-three person internal development teams at Seasonic Electronics, a power-supply manufacturer, and ACTi Corporation, a security technology company, both in Taipei. I built what those businesses actually ran on: material requirements planning, multi-stage approval workflows, fixed-asset tracking, sales forecasting and commissions. End to end there meant working out the requirements with the CEO, finance, procurement and the factory floor, modeling the data, writing the SQL-heavy backend and the frontend, then rolling it out across four countries.",
    "I moved to Toronto in 2024 and completed an Ontario College Graduate Certificate, Information Technology Solutions with Honours, at Humber Polytechnic (September 2024 to May 2026). I'm now looking for full-stack and software engineering roles here. I'm a Taiwanese citizen, authorized to work in Canada, and no employer sponsorship is required. The projects on this site are meant to show real decision depth, not a feature checklist.",
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
      {
        title: "Accuracy over fluency",
        body: "The assistant on this site can only state facts that exist in its knowledge pack; anything else gets a fixed fallback line rather than a plausible guess.",
      },
    ],
  },
  interests: [
    "Outside the code: baseball, and the Blue Jays in particular — which is how BlueJaysFanWeb happened.",
    "I also have a long-standing interest in BaZi (八字), Chinese birth-chart astrology. It's the honest origin of the pre-registered study: a subject I have a soft spot for made the perfect adversary for testing whether I could stay rigorous about something I wanted to believe.",
  ],
} as const;
