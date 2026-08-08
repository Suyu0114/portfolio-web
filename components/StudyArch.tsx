import ArchFlow from "@/components/ArchFlow";

// Pre-registered study pipeline. The pre-registration (hypotheses.md,
// frozen before any correlation was inspected) gates the whole flow —
// that is the point of the project.
export default function StudyArch() {
  return (
    <ArchFlow
      caption="from frozen hypotheses to a reported null"
      rail="hypotheses.md frozen before the first inspected correlation: the analysis could only confirm or fail to confirm it"
      steps={[
        { label: "MLB Stats API + FanGraphs CSV", note: "1,181 players · 2016–2025" },
        { label: "three-pillar BaZi compute", note: "sxtwl · solar-term boundaries" },
        { label: "feature tables (Supabase)", note: "static + season features" },
        { label: "Spec A OLS · Spec B PanelOLS", note: "BH-FDR q=0.10" },
      ]}
    />
  );
}
