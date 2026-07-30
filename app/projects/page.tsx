import type { Metadata } from "next";
import { Suspense } from "react";
import DoodleArrow from "@/components/DoodleArrow";
import FacetFilter from "@/components/FacetFilter";
import ProjectGrid from "@/components/ProjectGrid";
import { getAllProjects } from "@/lib/content";
import type { ProjectCardData } from "@/lib/facets";

export const metadata: Metadata = {
  title: "projects",
  description: "All projects, filterable by facet tag.",
};

export default function ProjectsPage() {
  const cards: ProjectCardData[] = getAllProjects().map(({ frontmatter: fm }) => ({
    title: fm.title,
    slug: fm.slug,
    oneLiner: fm.oneLiner,
    tags: fm.tags,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="font-display text-4xl font-bold">
        projects <DoodleArrow className="ml-1" />
      </h1>
      {/* useSearchParams needs a Suspense boundary for static rendering;
          the fallback prerenders the unfiltered grid. */}
      <div className="mt-8">
        <Suspense fallback={<ProjectGrid projects={cards} />}>
          <FacetFilter projects={cards} />
        </Suspense>
      </div>
    </main>
  );
}
