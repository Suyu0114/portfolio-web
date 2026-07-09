import SketchCard from "@/components/SketchCard";
import type { ProjectCardData } from "@/lib/facets";

// Presentational grid shared by /projects (via FacetFilter) and its
// static Suspense fallback.
export default function ProjectGrid({
  projects,
}: {
  projects: readonly ProjectCardData[];
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <SketchCard
          key={p.slug}
          title={p.title}
          tags={p.tags}
          oneLiner={p.oneLiner}
          href={`/projects/${p.slug}`}
          variant={i % 2 === 0 ? "a" : "b"}
        />
      ))}
    </div>
  );
}
