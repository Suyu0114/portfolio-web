import RoughBarChart from "@/components/RoughBarChart";

// World Cup calibration diagnostic (verified: notes/world-cup-forecasting,
// P6 diagnose_market + medium/article1_en). v1.0 vs de-vigged Pinnacle,
// in percentage points. The independent historical refit (v1.1) moved in
// the same direction — two independent signals agreeing.
export default function WorldCupCalibration() {
  return (
    <figure className="sk-border-b my-8 bg-card p-5">
      <RoughBarChart
        title="Model v1.0 minus de-vigged market, in percentage points: favorites +3.9, draws −3.5, over 2.5 goals +10.2"
        bars={[
          { label: "favorites", value: 3.9 },
          { label: "draws", value: -3.5 },
          { label: "totals (over)", value: 10.2 },
        ]}
        min={-6}
        max={12}
        unit="pp"
        signed
      />
      <figcaption className="mt-2 font-display text-xl text-muted">
        where v1.0 diverged from the market (percentage points)
      </figcaption>
    </figure>
  );
}
