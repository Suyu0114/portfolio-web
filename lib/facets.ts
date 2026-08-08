/**
 * Fixed facet tag list — SPEC.md §7. Lives in its own module (no fs
 * imports) so client components like FacetFilter can import it.
 *
 * Order is meaningful: FacetFilter renders chips in this order, and
 * SPEC.md §7 (v1.5) puts full-stack and AI first on purpose.
 */
export const FACET_TAGS = [
  "full-stack",
  "AI",
  "data engineering",
  "modeling",
  "frontend",
  "BI",
  "research",
] as const;

export type FacetTag = (typeof FACET_TAGS)[number];

/** Serializable card data passed from server pages to the grid/filter. */
export type ProjectCardData = {
  title: string;
  slug: string;
  oneLiner: string;
  tags: readonly FacetTag[];
};
