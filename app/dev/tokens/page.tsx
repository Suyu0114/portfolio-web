import type { Metadata } from "next";
import { Gochi_Hand, Patrick_Hand } from "next/font/google";
import RoughChart from "@/components/RoughChart";

// Font candidates for the P0 sample review only (SPEC.md §10) — loaded
// on this dev page, not site-wide. Both faces ship a single 400 weight.
const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const gochiHand = Gochi_Hand({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "tokens — P0 dev page",
  robots: { index: false },
};

const TOKENS = [
  { name: "--paper", value: "#FBF6EA", use: "page background", cls: "bg-paper" },
  { name: "--card", value: "#FFFDF4", use: "card background", cls: "bg-card" },
  { name: "--ink", value: "#2B2620", use: "headings, borders, primary text", cls: "bg-ink" },
  { name: "--ink-soft", value: "#5C5546", use: "body/secondary text", cls: "bg-ink-soft" },
  { name: "--muted", value: "#8A8272", use: "captions, nav links, meta", cls: "bg-muted" },
  { name: "--accent", value: "#C05B2B", use: "links, chart model lines, underlines", cls: "bg-accent" },
  { name: "--accent-2", value: "#667844", use: "secondary chart lines, notes", cls: "bg-accent-2" },
  { name: "--rule", value: "#D8CFBB", use: "hairline dividers", cls: "bg-rule" },
] as const;

const SAMPLE_HEADLINE = "field notes";
const SAMPLE_LINE = "Toronto · data engineering / analytics / full-stack";

// Abstract demo values for the rough.js spike — not project data.
const DEMO_SERIES = [0.2, 0.35, 0.3, 0.55, 0.5, 0.72, 0.68, 0.85];
const DEMO_COMPARE = [0.25, 0.3, 0.4, 0.45, 0.55, 0.6, 0.7, 0.75];

export default function TokensPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">token page (P0)</h1>
      <p className="mt-2 text-muted">
        Dev-only page: design tokens, handwriting font candidates, sketch
        utilities, and the rough.js spike. Removed before P5.
      </p>

      <h2 className="mt-12 font-display text-2xl font-medium">colors</h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOKENS.map((t) => (
          <li key={t.name} className="rounded-sm border border-rule bg-card p-2">
            <div className={`h-12 w-full rounded-sm border border-rule ${t.cls}`} />
            <p className="mt-2 font-mono text-xs text-ink">{t.name}</p>
            <p className="font-mono text-xs text-muted">{t.value}</p>
            <p className="text-xs">{t.use}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-2xl font-medium">
        handwriting candidates
      </h2>
      <p className="mt-2 text-sm text-muted">
        SPEC §4.2 asks for display weights 500/700 — only Caveat has them;
        Patrick Hand and Gochi Hand ship 400 only.
      </p>
      <div className="mt-4 space-y-6">
        <section className="sk-border-a bg-card p-6">
          <p className="font-mono text-xs text-muted">Caveat · 500 / 700</p>
          <p className="font-display text-4xl font-medium">{SAMPLE_HEADLINE}</p>
          <p className="font-display text-4xl font-bold">{SAMPLE_HEADLINE}</p>
          <p className="font-display text-xl font-medium text-accent-2">
            {SAMPLE_LINE}
          </p>
        </section>
        <section className={`sk-border-b bg-card p-6 ${patrickHand.className}`}>
          <p className="font-mono text-xs text-muted">Patrick Hand · 400 only</p>
          <p className="text-4xl">{SAMPLE_HEADLINE}</p>
          <p className="text-xl text-accent-2">{SAMPLE_LINE}</p>
        </section>
        <section className={`sk-border-a bg-card p-6 ${gochiHand.className}`}>
          <p className="font-mono text-xs text-muted">Gochi Hand · 400 only</p>
          <p className="text-4xl">{SAMPLE_HEADLINE}</p>
          <p className="text-xl text-accent-2">{SAMPLE_LINE}</p>
        </section>
      </div>

      <h2 className="mt-12 font-display text-2xl font-medium">
        body &amp; mono
      </h2>
      <div className="mt-4 rounded-sm border border-rule bg-card p-6">
        <p>
          Body text is JetBrains Mono at 16px with line-height 1.65 in --ink-soft.
          Sentence case everywhere; no all caps.
        </p>
        <p className="mt-2 font-mono text-sm text-ink">
          mono: Next.js · TypeScript · Tailwind · rough.js
        </p>
      </div>

      <h2 className="mt-12 font-display text-2xl font-medium">
        rough.js spike
      </h2>
      <p className="mt-2 text-sm text-muted">
        Client component, SSR renders a fixed-size empty SVG (no layout
        shift). Solid --accent line vs dashed --accent-2. Demo data only.
      </p>
      <div className="sk-border-b mt-4 bg-card p-6">
        <RoughChart
          title="Rough.js spike chart with abstract demo data"
          series={DEMO_SERIES}
          compare={DEMO_COMPARE}
        />
      </div>
    </main>
  );
}
