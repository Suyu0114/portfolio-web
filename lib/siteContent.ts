import type { StaticImageData } from "next/image";
import bluejaysGame1 from "@/public/photos/bluejays-game-1.jpg";
import bluejaysGame2 from "@/public/photos/bluejays-game-2.jpg";
import freediving1 from "@/public/photos/freediving-1.jpg";
import freediving2 from "@/public/photos/freediving-2.jpg";
import hiking1 from "@/public/photos/hiking-1.jpg";
import hiking2 from "@/public/photos/hiking-2.jpg";
import portrait from "@/public/photos/portrait.jpg";
import powerlifting1 from "@/public/photos/powerlifting-1.jpg";
import powerlifting2 from "@/public/photos/powerlifting-2.jpg";

/**
 * Site copy — SPEC.md §1, §5, §6.1. Content constants per CLAUDE.md
 * conventions; no prose hardcoded inside components. Featured cards
 * come from content/*.mdx frontmatter, not from here.
 */

/**
 * A personal photo and its words (SPEC §6.1, §6.4, v1.6). Alt text and
 * captions are approved photo by photo by Suyu, and may state only facts
 * from SPEC_v1.6_amendment.md §6.1 or the knowledge pack.
 */
type SitePhoto = { image: StaticImageData; alt: string; caption?: string };

/** An interests block on /about: one paragraph, then its photos. */
type InterestBlock = { body: string; photos: readonly SitePhoto[] };

export const HERO = {
  headline: "field notes",
  // Positioning statement (SPEC §1); wording chosen by Suyu at v1.7. The
  // absence of "Senior" is deliberate — see SPEC §1. Its copies in
  // lib/site.ts, app/opengraph-image.tsx and the /about description follow
  // any change here (SPEC §6.5 sync rule).
  intro:
    "Hello, I'm Suyu. For six years, I've built the backbone of business operations: planning, approvals, assets, and sales. I create complete, efficient solutions, and lately, I'm integrating AI to make them even smarter.",
  subline: "Toronto · full-stack · ERP & business systems · AI integration",
  doodleCaption: "calibration, hand-checked",
  // Beside the intro (SPEC §6.1, v1.6 P7): alt text, no caption.
  portrait: {
    image: portrait,
    alt: "Suyu smiling in a Blue Jays cap and jersey",
  },
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

// Interests (SPEC §6.4, v1.6): the first two paragraphs are v1.5's wording,
// unchanged; the powerlifting and outdoors paragraphs are the copy approved
// with SPEC_v1.6_amendment.md (§10). Photos sit two to a row; outdoors
// takes two rows, hiking then freediving (Suyu, 2026-09-14).
const INTERESTS: readonly InterestBlock[] = [
  {
    body: "Outside the code: baseball, and the Blue Jays in particular, which is how BlueJaysFanWeb happened.",
    photos: [
      {
        image: bluejaysGame1,
        alt: "Suyu from behind in a Springer 4 jersey, holding a cap up toward the field at Rogers Centre",
        caption: "my Springer jersey, Rogers Centre",
      },
      {
        image: bluejaysGame2,
        alt: "Suyu pointing up at a Blue Jays trophy display case",
        caption: "the trophy case at Rogers Centre",
      },
    ],
  },
  {
    body: "I also have a long-standing interest in BaZi (八字), Chinese birth-chart astrology. It's the honest origin of the pre-registered study: a subject I have a soft spot for made the perfect adversary for testing whether I could stay rigorous about something I wanted to believe.",
    photos: [],
  },
  {
    body: "I also lift. Back in Taiwan I trained after work four or five times a week, and in 2022 I represented Yilan County in powerlifting at the Citizens Sports Games, Taiwan's national multi-sport games where each county and city sends a team. My results at that meet: a 205 kg squat, a 120 kg bench press and a 230 kg deadlift.",
    photos: [
      {
        image: powerlifting1,
        alt: "Suyu at the bar for a 230 kg deadlift on the competition platform, with referees watching",
        caption: "the 230 kg deadlift",
      },
      {
        // Suyu's own edit: the other lifters' faces are covered (SPEC §6.4
        // privacy rules), cropped to 4:3 to sit level with the deadlift.
        image: powerlifting2,
        alt: "Suyu sitting in the competition warm-up area in a blue jacket, next to other lifters",
        caption: "in the warm-up area",
      },
    ],
  },
  {
    body: "On weekends I like getting outdoors: hiking in the mountains, or freediving in the sea.",
    photos: [
      {
        image: hiking1,
        alt: "Suyu standing on a road between towering walls of snow under a clear blue sky",
        caption: "snow walls in the mountains",
      },
      {
        image: hiking2,
        alt: "Suyu in sunglasses and a fleece jacket by a rocky river, with snow-covered peaks behind",
        caption: "below the snowy peaks",
      },
      {
        image: freediving1,
        alt: "Suyu in a wetsuit and mask at the sea surface, one hand raised, with green hills behind",
        caption: "freediving",
      },
      {
        image: freediving2,
        alt: "Suyu freediving in deep blue water beside a guide line, seen from below as a silhouette",
        caption: "down the line",
      },
    ],
  },
];

/**
 * About page copy — SPEC §6.4. Bio + "how I work" + interests, drawn
 * from the approved positioning (§1) and verified project facts.
 */
export const ABOUT = {
  headline: "about",
  // Beside the bio (SPEC §6.4, v1.6 P7): the hero's photo, alt text only.
  portrait: {
    image: portrait,
    alt: "Suyu smiling in a Blue Jays cap and jersey",
  },
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
        body: "A written spec is the source of truth. I plan the decisions on paper first, then write code against them, so the hard choices are made deliberately, not mid-keystroke.",
      },
      {
        title: "Pre-registration",
        body: "In the BaZi study I froze 47 hypotheses before inspecting a single correlation, so there was no way to tune my way to a positive result.",
      },
      {
        title: "Frozen test vectors",
        body: "The World Cup value maths was written once in Python and ported to TypeScript, with golden vectors keeping the two locked in sync: 84 passing tests.",
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
  interests: INTERESTS,
} as const;
