import type { Locale } from "@/lib/i18n";
import { assertTranslatedCopy } from "@/lib/translationChecks";

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

// Traditional Chinese (SPEC.md §7.5, v1.13): drafted by Claude, approved by
// Suyu before it ships. Library, model and service names stay English.
const VISUALS_ZH: VisualsCopy = {
  assistantArch: {
    caption: "每輪只呼叫一次模型，答不出來的問題就變成待辦清單",
    rail: "每次對話都記錄在 Supabase → /study 比對拒答句，找出缺口",
    steps: [
      { label: "聊天 widget", note: "延遲載入 · 串流增量" },
      { label: "/api/chat", note: "zod · 每個 IP 與每日的保險絲" },
      { label: "Claude Opus 5", note: "逐位元組凍結的快取 prompt · 最多 2,048 tokens" },
      { label: "串流回覆", note: "分塊傳送的純文字" },
    ],
  },
  bluejaysArch: {
    caption: "資料管線：抓取、轉換、upsert、呈現",
    rail: "GitHub Actions 排程在夜間更新 → /api/revalidate 清掉 ISR 快取",
    steps: [
      { label: "Baseball Savant + MLB Stats API", note: "pybaseball · Python ETL" },
      { label: "轉換 + 冪等 upsert", note: "hc_x/y → 英尺 · 本壘板對齊" },
      { label: "Supabase Postgres", note: "web_* 資料表" },
      { label: "Next.js 呈現", note: "D3 · rough.js · SVG" },
    ],
  },
  studyArch: {
    caption: "從凍結的假設，到如實回報的虛無結果",
    rail: "hypotheses.md 在第一次檢視相關係數之前就已凍結：分析只能證實它，或無法證實它",
    steps: [
      { label: "MLB Stats API + FanGraphs CSV", note: "1,181 名球員 · 2016–2025" },
      { label: "三柱八字計算", note: "sxtwl · 節氣邊界" },
      { label: "特徵資料表（Supabase）", note: "靜態 + 球季特徵" },
      { label: "規格 A OLS · 規格 B PanelOLS", note: "BH-FDR q=0.10" },
    ],
  },
  worldCupArch: {
    caption: "Elo → Dixon-Coles → Monte Carlo，以市場為基準比較",
    rail: "GitHub Actions 比賽日重新計算：匯入 → 預測 → 模擬 → 匯入賠率 → 校準",
    steps: [
      { label: "Elo + 賽程 + 市場賠率", note: "eloratings · football-data · Odds API" },
      { label: "Dixon-Coles 引擎", note: "純函式 Python" },
      { label: "Monte Carlo（10k 次模擬）", note: "小組賽 + Annex C 淘汰賽" },
      { label: "Supabase → Next.js", note: "模型 ∥ 去除抽成的市場" },
    ],
  },
  studyNulls: {
    title:
      "各結果類別中最低的 BH-FDR 校正後 p 值：全都遠高於 q=0.10 的門檻",
    caption: "每個類別裡最好的結果：沒有一個碰到那條線（n=1,181）",
    thresholdLabel: "q = 0.10",
    bars: {
      power: "長打",
      discipline: "選球",
      contact: "擊球",
      stability: "穩定度",
      clutch: "關鍵時刻",
      speed: "速度",
      volatility: "波動度",
    },
  },
  worldCupCalibration: {
    title:
      "模型 v1.0 減去去除抽成後的市場機率，單位為百分點：熱門方 +3.9、和局 −3.5、大於 2.5 球 +10.2",
    caption: "v1.0 與市場分歧之處（百分點）",
    bars: {
      favorites: "熱門方",
      draws: "和局",
      totals: "總進球（大）",
    },
  },
};

const VISUALS: Record<Locale, VisualsCopy> = {
  en: VISUALS_EN,
  "zh-tw": VISUALS_ZH,
};

// Fail the build if a translated diagram or chart lost a number or
// carries an em dash (SPEC.md §7.5; lib/translationChecks.ts).
assertTranslatedCopy(VISUALS_EN, VISUALS_ZH, "lib/caseStudyVisuals.ts (zh-tw)");

export function getVisualsCopy(locale: Locale): VisualsCopy {
  return VISUALS[locale];
}
