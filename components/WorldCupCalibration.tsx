import RoughBarChart from "@/components/RoughBarChart";
import {
  getVisualsCopy,
  type WorldCupCalibrationKey,
} from "@/lib/caseStudyVisuals";
import type { Locale } from "@/lib/i18n";

// World Cup calibration diagnostic (verified: notes/world-cup-forecasting,
// P6 diagnose_market + medium/article1_en). v1.0 vs de-vigged Pinnacle,
// in percentage points. The independent historical refit (v1.1) moved in
// the same direction — two independent signals agreeing. The values live
// here, once; the words are in lib/caseStudyVisuals.ts, per locale.
const VALUES: readonly { key: WorldCupCalibrationKey; value: number }[] = [
  { key: "favorites", value: 3.9 },
  { key: "draws", value: -3.5 },
  { key: "totals", value: 10.2 },
];

export default function WorldCupCalibration({ locale }: { locale: Locale }) {
  const copy = getVisualsCopy(locale).worldCupCalibration;
  return (
    <figure className="sk-border-b my-8 bg-card p-5">
      <RoughBarChart
        title={copy.title}
        bars={VALUES.map(({ key, value }) => ({ label: copy.bars[key], value }))}
        min={-6}
        max={12}
        unit="pp"
        signed
      />
      <figcaption className="mt-2 font-display text-xl text-muted">
        {copy.caption}
      </figcaption>
    </figure>
  );
}
