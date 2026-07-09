"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProjectGrid from "@/components/ProjectGrid";
import { FACET_TAGS, type ProjectCardData } from "@/lib/facets";

// Client filter — SPEC §6.2: tag chips toggle filtering, state lives in
// the ?tag= query param (survives reload), "all" resets, no library.
export default function FacetFilter({
  projects,
}: {
  projects: readonly ProjectCardData[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTag = searchParams.get("tag");
  const activeTag = FACET_TAGS.find((t) => t === rawTag) ?? null;
  const filtered = activeTag
    ? projects.filter((p) => p.tags.includes(activeTag))
    : projects;

  function setTag(tag: string | null) {
    router.replace(
      tag ? `/projects?tag=${encodeURIComponent(tag)}` : "/projects",
      { scroll: false },
    );
  }

  const chipBase = "sk-pill px-2.5 py-0.5 text-xs";
  const chipOn = "bg-ink text-paper";
  const chipOff = "text-ink hover:bg-rule";

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by tag">
        <button
          type="button"
          aria-pressed={activeTag === null}
          onClick={() => setTag(null)}
          className={`${chipBase} ${activeTag === null ? chipOn : chipOff}`}
        >
          all
        </button>
        {FACET_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={activeTag === tag}
            onClick={() => setTag(tag)}
            className={`${chipBase} ${activeTag === tag ? chipOn : chipOff}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {filtered.length > 0 ? (
          <ProjectGrid projects={filtered} />
        ) : (
          // Should be unreachable with v1 tags (SPEC §6.2).
          <p className="font-display text-xl text-muted">
            nothing filed under this tag (yet)
          </p>
        )}
      </div>
    </div>
  );
}
