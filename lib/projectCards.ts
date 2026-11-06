import type { ProjectFrontmatter } from "@/lib/content";
import type { ProjectCardData } from "@/lib/facets";
import { localePath, type Locale } from "@/lib/i18n";
import { getSiteCopy } from "@/lib/siteContent";

/** A case study's card, with its tag labels and link in `locale`. */
export function toProjectCard(
  locale: Locale,
  fm: ProjectFrontmatter,
): ProjectCardData {
  const { tags } = getSiteCopy(locale).ui;
  return {
    title: fm.title,
    slug: fm.slug,
    oneLiner: fm.oneLiner,
    tags: fm.tags,
    tagLabels: fm.tags.map((tag) => tags[tag]),
    href: localePath(locale, `/projects/${fm.slug}`),
  };
}
