import type { Metadata } from "next";
import { getProject } from "@/lib/content";
import { HTML_LANG, LOCALES, localePath, OG_LOCALE, type Locale } from "@/lib/i18n";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { getSiteCopy } from "@/lib/siteContent";

/**
 * Per-page metadata — SPEC §6.5 — built once for both locales, so a
 * locale's pages can't drift from the other's. Titles take the
 * " — Suyu" suffix from the root layout's template.
 */

const SUFFIX = " — Suyu";

/** A page's URL in every locale, by hreflang (SPEC §6.5, v1.13). */
export function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], localePath(l, path)]));
}

/**
 * The page's canonical URL and its other-language twin, with English as
 * the default. Set per page, never in a root layout: a page that inherited
 * it would claim another page's canonical.
 */
function alternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(locale, path),
    languages: { ...languageAlternates(path), "x-default": path },
  };
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

export function homeMetadata(locale: Locale): Metadata {
  return { alternates: alternates(locale, "/") };
}

export function projectsMetadata(locale: Locale): Metadata {
  const { meta } = getSiteCopy(locale);
  return {
    title: meta.projectsTitle,
    description: meta.projectsDescription,
    alternates: alternates(locale, "/projects"),
  };
}

export function aboutMetadata(locale: Locale): Metadata {
  const { meta } = getSiteCopy(locale);
  return {
    title: meta.aboutTitle,
    description: meta.aboutDescription,
    alternates: alternates(locale, "/about"),
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
    alternates: alternates(locale, `/projects/${frontmatter.slug}`),
  };
}
