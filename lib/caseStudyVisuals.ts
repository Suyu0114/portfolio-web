import type { Locale } from "@/lib/i18n";

/**
 * The words in the case studies' diagrams and charts, per locale (SPEC.md
 * v1.13). The numbers a chart plots stay in its component, once, so a
 * translation can never change one; the numbers below are the ones the
 * diagrams and chart titles state in words, and the build checks each
 * locale keeps them. No fs import: the components that read this are
 * rendered inside MDX.
 */

export type ArchCopy = {
  caption: string;
  rail: string;
  steps: readonly { label: string; note: string }[];
};

export type ChartCopy<Key extends string> = {
  /** The chart's accessible name. */
  title: string;
  caption: string;
  bars: Record<Key, string>;
  thresholdLabel?: string;
};

export type StudyNullsKey =
  | "power"
  | "discipline"
  | "contact"
  | "stability"
  | "clutch"
  | "speed"
  | "volatility";

export type WorldCupCalibrationKey = "favorites" | "draws" | "totals";

export type VisualsCopy = {
  assistantArch: ArchCopy;
  bluejaysArch: ArchCopy;
  studyArch: ArchCopy;
  worldCupArch: ArchCopy;
  studyNulls: ChartCopy<StudyNullsKey>;
  worldCupCalibration: ChartCopy<WorldCupCalibrationKey>;
};

const VISUALS_EN: VisualsCopy = {
  // Every label is traceable to SPEC-CHATBOT.md (SPEC §7.4).
  assistantArch: {
    caption: "one model call per turn, and the misses become a to-do list",
    rail: "every exchange is logged to Supabase → /study matches the refusal line to find the gaps",
    steps: [
      { label: "chat widget", note: "lazy-loaded · streams deltas" },
      { label: "/api/chat", note: "zod · per-IP and daily fuses" },
      { label: "Claude Opus 5", note: "byte-frozen cached prompt · 2,048 max tokens" },
      { label: "streamed reply", note: "chunked plain text" },
    ],
  },
  bluejaysArch: {
    caption: "pipeline: pull, transform, upsert, render",
    rail: "GitHub Actions cron refreshes overnight → /api/revalidate drops the ISR cache",
    steps: [
      { label: "Baseball Savant + MLB Stats API", note: "pybaseball · Python ETL" },
      { label: "transform + idempotent upsert", note: "hc_x/y → feet · plate alignment" },
      { label: "Supabase Postgres", note: "web_* tables" },
      { label: "Next.js render", note: "D3 · rough.js · SVG" },
    ],
  },
  studyArch: {
    caption: "from frozen hypotheses to a reported null",
    rail: "hypotheses.md frozen before the first inspected correlation: the analysis could only confirm or fail to confirm it",
    steps: [
      { label: "MLB Stats API + FanGraphs CSV", note: "1,181 players · 2016–2025" },
      { label: "three-pillar BaZi compute", note: "sxtwl · solar-term boundaries" },
      { label: "feature tables (Supabase)", note: "static + season features" },
      { label: "Spec A OLS · Spec B PanelOLS", note: "BH-FDR q=0.10" },
    ],
  },
  worldCupArch: {
    caption: "Elo → Dixon-Coles → Monte Carlo, benchmarked against the market",
    rail: "GitHub Actions matchday recompute: ingest → predict → simulate → ingest odds → calibrate",
    steps: [
      { label: "Elo + fixtures + market odds", note: "eloratings · football-data · Odds API" },
      { label: "Dixon-Coles engine", note: "pure-function Python" },
      { label: "Monte Carlo (10k sims)", note: "groups + Annex C knockout" },
      { label: "Supabase → Next.js", note: "model ∥ de-vigged market" },
    ],
  },
  studyNulls: {
    title:
      "Lowest BH-FDR adjusted p-value per outcome family: all far above the q=0.10 threshold",
    caption: "the best result in each family: nothing reaches the line (n=1,181)",
    thresholdLabel: "q = 0.10",
    bars: {
      power: "power",
      discipline: "discipline",
      contact: "contact",
      stability: "stability",
      clutch: "clutch",
      speed: "speed",
      volatility: "volatility",
    },
  },
  worldCupCalibration: {
    title:
      "Model v1.0 minus de-vigged market, in percentage points: favorites +3.9, draws −3.5, over 2.5 goals +10.2",
    caption: "where v1.0 diverged from the market (percentage points)",
    bars: {
      favorites: "favorites",
      draws: "draws",
      totals: "totals (over)",
    },
  },
};

const VISUALS: Record<Locale, VisualsCopy> = {
  en: VISUALS_EN,
};

export function getVisualsCopy(locale: Locale): VisualsCopy {
  return VISUALS[locale];
}
