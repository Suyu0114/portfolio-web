import Reveal from "@/components/Reveal";
import SketchCard from "@/components/SketchCard";
import type { ProjectCardData } from "@/lib/facets";

/** The /projects grid, shared with FacetFilter's animated grid so the two can't drift apart. */
export const PROJECT_GRID_CLASS = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

// Presentational grid for /projects' static Suspense fallback; FacetFilter
// renders the same cards in an animated grid. Cards below the first screen
// fade up as they scroll in (Reveal, SPEC §4.4); each Reveal is a one-cell
// grid so its card still stretches to the row's height.
export default function ProjectGrid({
  projects,
}: {
  projects: readonly ProjectCardData[];
}) {
  return (
    <div className={PROJECT_GRID_CLASS}>
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
