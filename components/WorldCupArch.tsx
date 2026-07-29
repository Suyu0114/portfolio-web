import ArchFlow from "@/components/ArchFlow";

// World Cup forecasting architecture. Framing (SPEC §7.1): the model is a
// clearly-labeled experimental layer; de-vigged market odds are the
// benchmark, shown side by side.
export default function WorldCupArch() {
  return (
    <ArchFlow
      caption="Elo → Dixon-Coles → Monte Carlo, benchmarked against the market"
      rail="GitHub Actions matchday recompute: ingest → predict → simulate → ingest odds → calibrate"
      steps={[
        { label: "Elo + fixtures + market odds", note: "eloratings · football-data · Odds API" },
        { label: "Dixon-Coles engine", note: "pure-function Python" },
        { label: "Monte Carlo (10k sims)", note: "groups + Annex C knockout" },
        { label: "Supabase → Next.js", note: "model ∥ de-vigged market" },
      ]}
    />
  );
}
