import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// SPEC §6.5 — sitemap via App Router convention. Public routes only
// (the /dev page is excluded).
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/projects", "/about"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const projects = getAllProjects().map((p) => ({
    url: `${SITE_URL}/projects/${p.frontmatter.slug}`,
    lastModified: new Date(),
  }));

  return [...routes, ...projects];
}
