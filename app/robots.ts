import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// SPEC §6.5 — robots via App Router convention. Keep the dev-only page
// out of the index. `/study` is the admin area (SPEC-CHATBOT §8): disallowed
// here, absent from the sitemap, noindex in its layout metadata — and gated by
// middleware, which is the part that actually protects it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dev/", "/study", "/study/", "/api/admin/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
