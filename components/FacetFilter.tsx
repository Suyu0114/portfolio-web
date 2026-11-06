"use client";

import { AnimatePresence, LazyMotion, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useRouter, useSearchParams } from "next/navigation";
import { PROJECT_GRID_CLASS } from "@/components/ProjectGrid";
import Reveal from "@/components/Reveal";
import SketchCard from "@/components/SketchCard";
import {
  FACET_TAGS,
  type CardCopy,
  type FacetTag,
  type ProjectCardData,
} from "@/lib/facets";
import { INSTANT, LAYOUT_TRANSITION } from "@/lib/motion";

// Layout animation needs Motion's larger feature set, loaded here only, so
// no page but /projects downloads it (SPEC §4.4, v1.11).
const loadLayoutFeatures = () =>
  import("@/lib/motionFeaturesLayout").then((mod) => mod.default);

// Client filter — SPEC §6.2: tag chips toggle filtering, state lives in
// the ?tag= query param (survives reload), "all" resets, no filtering
// library.
//
// The reflow animates (v1.11, SPEC §4.4): cards that stay slide to their
// new places on the soft spring, cards filtered out fade and shrink a
// little as they leave, and cards that return fade in. `layout="position"`
// moves a card without scaling it, so its text never stretches; popLayout
// lifts a leaving card out of the grid at once so the rest can move. The
// grid is relative so a lifted card stays where it was. Cards on screen at
// first render don't animate in. With reduced motion the markup is the
// same (it must match whatever the server rendered, which can't know the
// preference) and only the transition changes, to instant.
//
// Every word arrives already in the page's locale (SPEC v1.13), so this
// client bundle carries no copy of its own.
export type FilterCopy = {
  label: string;
  all: string;
  empty: string;
  tags: Readonly<Record<FacetTag, string>>;
};

export default function FacetFilter({
  projects,
  path,
  copy,
  cardCopy,
}: {
  projects: readonly ProjectCardData[];
  /** This page's path in its locale, which the ?tag= state rides on. */
  path: string;
  copy: FilterCopy;
  cardCopy: CardCopy;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  const rawTag = searchParams.get("tag");
  const activeTag = FACET_TAGS.find((t) => t === rawTag) ?? null;
  const filtered = activeTag
    ? projects.filter((p) => p.tags.includes(activeTag))
    : projects;

  function setTag(tag: string | null) {
    router.replace(
      tag ? `${path}?tag=${encodeURIComponent(tag)}` : path,
      { scroll: false },
    );
  }

  const chipBase = "sk-pill mo-color px-2.5 py-0.5 text-xs";
  const chipOn = "bg-ink text-paper";
  const chipOff = "text-ink hover:bg-rule";

  return (
    <div>
      {/* The chips render on the client only, so they rise in as they
          mount rather than popping in (SPEC §4.4). */}
      <div className="mo-rise flex flex-wrap gap-2" role="group" aria-label={copy.label}>
        <button
          type="button"
          aria-pressed={activeTag === null}
          onClick={() => setTag(null)}
          className={`${chipBase} ${activeTag === null ? chipOn : chipOff}`}
        >
          {copy.all}
        </button>
        {FACET_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={activeTag === tag}
            onClick={() => setTag(tag)}
            className={`${chipBase} ${activeTag === tag ? chipOn : chipOff}`}
          >
            {copy.tags[tag]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          // Should be unreachable with v1 tags (SPEC §6.2).
          <p className="font-display text-xl text-muted">{copy.empty}</p>
        ) : (
          <LazyMotion features={loadLayoutFeatures} strict>
            <div className={`relative ${PROJECT_GRID_CLASS}`}>
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.map((p, i) => (
                  <m.div
                    key={p.slug}
                    layout="position"
                    className="grid"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={reduce ? INSTANT : LAYOUT_TRANSITION}
                  >
                    <Reveal className="grid">
                      <SketchCard
                        title={p.title}
                        tags={p.tagLabels}
                        oneLiner={p.oneLiner}
                        href={p.href}
                        variant={i % 2 === 0 ? "a" : "b"}
                        copy={cardCopy}
                      />
                    </Reveal>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </LazyMotion>
        )}
      </div>
    </div>
  );
}
