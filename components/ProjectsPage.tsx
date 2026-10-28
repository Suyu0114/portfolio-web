import { Suspense } from "react";
import DoodleArrow from "@/components/DoodleArrow";
import FacetFilter from "@/components/FacetFilter";
import ProjectGrid from "@/components/ProjectGrid";
import { getProjects } from "@/lib/content";
import { localePath, type Locale } from "@/lib/i18n";
import { toProjectCard } from "@/lib/projectCards";
import { getSiteCopy } from "@/lib/siteContent";

// All projects with the facet filter — SPEC §6.2 — in either locale
// (SPEC v1.13).
export default function ProjectsPage({ locale }: { locale: Locale }) {
  const { meta, ui } = getSiteCopy(locale);
  const cards = getProjects(locale).map((p) => toProjectCard(locale, p.frontmatter));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="font-display text-4xl font-bold">
        {meta.projectsTitle} <DoodleArrow className="ml-1" draw="load" />
      </h1>
      {/* useSearchParams needs a Suspense boundary for static rendering;
          the fallback prerenders the unfiltered grid. On load this block
          settles into place (SPEC §4.4): a transform only, since a card's
          one-liner is this page's largest contentful paint. It is the
          server-rendered wrapper, so it doesn't replay when the filter
          replaces the fallback. */}
      <div className="mo-settle mt-8">
        <Suspense fallback={<ProjectGrid projects={cards} cardCopy={ui.card} />}>
          <FacetFilter
            projects={cards}
            path={localePath(locale, "/projects")}
            copy={{ ...ui.filter, tags: ui.tags }}
            cardCopy={ui.card}
          />
        </Suspense>
      </div>
    </main>
  );
}
