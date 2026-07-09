import type { FACET_TAGS } from "@/lib/content";

type FacetTag = (typeof FACET_TAGS)[number];

/**
 * Home page copy — SPEC.md §1 and §6.1. Content constants per
 * CLAUDE.md conventions; no prose hardcoded inside components.
 */
export const HERO = {
  headline: "field notes",
  // Positioning statement (SPEC §1); final wording tweakable at P3.
  intro:
    "I'm Suyu — I build data products end-to-end, from raw pipelines to statistical models to the interfaces people actually use.",
  subline: "Toronto · data engineering / analytics / full-stack",
  doodleCaption: "calibration, hand-checked",
} as const;

export type FeaturedCard = {
  title: string;
  /** Working slug — bound to content/<slug>.mdx when case studies land in P2/P3. */
  slug: string;
  oneLiner: string;
  tags: readonly FacetTag[];
};

/** Featured notes, in SPEC §6.1 order; copy from SPEC §7 draft spec. */
export const FEATURED_CARDS: readonly FeaturedCard[] = [
  {
    title: "World Cup 2026 forecasting platform",
    slug: "world-cup-forecasting",
    oneLiner:
      "Dixon-Coles + Monte Carlo engine, benchmarked against market-implied probabilities. Next.js · Supabase · Python ETL.",
    tags: ["data engineering", "modeling", "frontend"],
  },
  {
    title: "A pre-registered study on unconventional features",
    slug: "pre-registered-study",
    oneLiner:
      "47 frozen hypotheses, BH-FDR correction, n=1,181 — and the honest story of finding nothing.",
    tags: ["research", "modeling"],
  },
  {
    title: "BlueJaysFanWeb",
    slug: "bluejays-fan-web",
    oneLiner:
      "A Blue Jays analytics site: Statcast spray charts, pitch heatmaps, WAR breakdowns. Next.js · D3 · Python ETL.",
    tags: ["frontend", "data engineering"],
  },
];

/**
 * Contact details are SPEC §10 blockers Suyu hasn't supplied yet.
 * Rendered as visible TODOs until then (CLAUDE.md rule 1).
 */
export const CONTACT = {
  todo: "TODO(§10): availability · email · GitHub · LinkedIn",
} as const;

export const FOOTER = {
  handNote: "drawn with rough.js",
  linksTodo: "TODO(§10): email · GitHub · LinkedIn",
} as const;
