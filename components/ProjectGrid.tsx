import Reveal from "@/components/Reveal";
import SketchCard from "@/components/SketchCard";
import type { ProjectCardData } from "@/lib/facets";

// Presentational grid shared by /projects (via FacetFilter) and its
// static Suspense fallback. Cards below the first screen fade up as they
// scroll in (Reveal, SPEC §4.4); each Reveal is a one-cell grid so its
// card still stretches to the row's height.
export default function ProjectGrid({
  projects,
}: {
  projects: readonly ProjectCardData[];
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <Reveal key={p.slug} className="grid">
          <SketchCard
            title={p.title}
            tags={p.tags}
            oneLiner={p.oneLiner}
            href={`/projects/${p.slug}`}
            variant={i % 2 === 0 ? "a" : "b"}
          />
        </Reveal>
      ))}
    </div>
  );
}
