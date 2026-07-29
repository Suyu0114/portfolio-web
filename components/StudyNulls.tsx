import RoughBarChart from "@/components/RoughBarChart";

// Pre-registered study result (verified: notes/pre-registered-study,
// a8_fit_results.md §8). Lowest BH-FDR adjusted p-value within each
// outcome family across all 47 confirmatory tests — the q=0.10
// rejection line is never approached, let alone crossed.
export default function StudyNulls() {
  return (
    <figure className="sk-border-a my-8 bg-card p-5">
      <RoughBarChart
        title="Lowest BH-FDR adjusted p-value per outcome family — all far above the q=0.10 threshold"
        bars={[
          { label: "power", value: 0.79 },
          { label: "discipline", value: 0.65 },
          { label: "contact", value: 0.89 },
          { label: "stability", value: 0.21 },
          { label: "clutch", value: 0.78 },
          { label: "speed", value: 0.35 },
          { label: "volatility", value: 0.37 },
        ]}
        min={0}
        max={1}
        threshold={0.1}
        thresholdLabel="q = 0.10"
      />
      <figcaption className="mt-2 font-display text-xl text-muted">
        the best result in each family — nothing reaches the line (n=1,181)
      </figcaption>
    </figure>
  );
}
