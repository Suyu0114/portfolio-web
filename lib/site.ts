/**
 * Canonical site metadata — SPEC §6.5.
 *
 * TODO(§10/P5): SITE_URL is a placeholder. The portfolio's own domain is
 * a §10 input (fallback: a *.vercel.app URL for v1). Set the real origin
 * at deploy — it feeds metadataBase, OG/Twitter tags, sitemap, robots.
 */
export const SITE_URL = "https://suyu-portfolio.vercel.app";

export const SITE_NAME = "Suyu — field notes";

export const SITE_DESCRIPTION =
  "I'm Suyu — I build data products end-to-end, from raw pipelines to statistical models to the interfaces people actually use. Toronto · data engineering / analytics / full-stack.";
