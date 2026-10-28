import type { Metadata } from "next";
import { getProject } from "@/lib/content";
import { localePath, OG_LOCALE, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { getSiteCopy } from "@/lib/siteContent";

/**
 * Per-page metadata — SPEC §6.5 — built once for both locales, so a
 * locale's pages can't drift from the other's. Titles take the
 * " — Suyu" suffix from the root layout's template.
 */

const SUFFIX = " — Suyu";

/** An absolute URL for a site path; the home page has no trailing slash. */
function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

export function rootMetadata(locale: Locale): Metadata {
  const { meta } = getSiteCopy(locale);
  const title = `${meta.title}${SUFFIX}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s${SUFFIX}`,
    },
    description: meta.description,
    openGraph: {
      type: "website",
      siteName: meta.siteName,
      title,
      description: meta.description,
      url: absoluteUrl(localePath(locale, "/")),
      locale: OG_LOCALE[locale],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: meta.description,
    },
  };
}

export function projectsMetadata(locale: Locale): Metadata {
  const { meta } = getSiteCopy(locale);
  return {
    title: meta.projectsTitle,
    description: meta.projectsDescription,
  };
}

export function aboutMetadata(locale: Locale): Metadata {
  const { meta } = getSiteCopy(locale);
  return {
    title: meta.aboutTitle,
    description: meta.aboutDescription,
  };
}

export function caseStudyMetadata(locale: Locale, slug: string): Metadata {
  const { frontmatter } = getProject(locale, slug);
  return {
    title: frontmatter.title,
    description: frontmatter.oneLiner,
    openGraph: {
      title: `${frontmatter.title}${SUFFIX}`,
      description: frontmatter.oneLiner,
      url: absoluteUrl(localePath(locale, `/projects/${frontmatter.slug}`)),
    },
  };
}
