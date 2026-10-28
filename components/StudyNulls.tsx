import RoughBarChart from "@/components/RoughBarChart";
import { getVisualsCopy, type StudyNullsKey } from "@/lib/caseStudyVisuals";
import type { Locale } from "@/lib/i18n";

// Pre-registered study result (verified: notes/pre-registered-study,
// a8_fit_results.md §8). Lowest BH-FDR adjusted p-value within each
// outcome family across all 47 confirmatory tests — the q=0.10
// rejection line is never approached, let alone crossed. The values live
// here, once; the words are in lib/caseStudyVisuals.ts, per locale.
const VALUES: readonly { key: StudyNullsKey; value: number }[] = [
  { key: "power", value: 0.79 },
  { key: "discipline", value: 0.65 },
  { key: "contact", value: 0.89 },
  { key: "stability", value: 0.21 },
  { key: "clutch", value: 0.78 },
  { key: "speed", value: 0.35 },
  { key: "volatility", value: 0.37 },
];

export default function StudyNulls({ locale }: { locale: Locale }) {
  const copy = getVisualsCopy(locale).studyNulls;
  return (
    <figure className="sk-border-a my-8 bg-card p-5">
      <RoughBarChart
        title={copy.title}
        bars={VALUES.map(({ key, value }) => ({ label: copy.bars[key], value }))}
        min={0}
        max={1}
        threshold={0.1}
        thresholdLabel={copy.thresholdLabel}
      />
      <figcaption className="mt-2 font-display text-xl text-muted">
        {copy.caption}
      </figcaption>
    </figure>
  );
}
