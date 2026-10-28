import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/content";
import { LOCALES, localePath } from "@/lib/i18n";
import { languageAlternates } from "@/lib/pageMetadata";
import { absoluteUrl } from "@/lib/site";

// SPEC §6.5 — sitemap via App Router convention. Public routes only
// (the /dev page is excluded), in both locales (v1.13), each entry naming
// its twin in the other language.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/projects",
    "/about",
    ...getAllProjects().map((p) => `/projects/${p.frontmatter.slug}`),
  ];

  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: absoluteUrl(localePath(locale, path)),
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languageAlternates(path)).map(([lang, p]) => [lang, absoluteUrl(p)]),
        ),
      },
    })),
  );
}
