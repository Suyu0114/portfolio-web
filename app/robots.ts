import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// SPEC §6.5 — robots via App Router convention. Keep the dev-only page
// out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/dev/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
