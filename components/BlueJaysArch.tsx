import ArchFlow from "@/components/ArchFlow";

// BlueJaysFanWeb architecture — data note (SPEC §7.3): Savant + MLB Stats
// API are the primary self-built sources; FanGraphs CSV is a manual,
// membership-gated side input (not republished on this site).
export default function BlueJaysArch() {
  return (
    <ArchFlow
      caption="pipeline: pull, transform, upsert, render"
      rail="GitHub Actions cron refreshes overnight → /api/revalidate drops the ISR cache"
      steps={[
        { label: "Baseball Savant + MLB Stats API", note: "pybaseball · Python ETL" },
        { label: "transform + idempotent upsert", note: "hc_x/y → feet · plate alignment" },
        { label: "Supabase Postgres", note: "web_* tables" },
        { label: "Next.js render", note: "D3 · rough.js · SVG" },
      ]}
    />
  );
}
