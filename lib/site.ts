/**
 * Canonical site metadata — SPEC §6.5.
 *
 * v1 production origin (Vercel default, per SPEC §10 fallback). If a
 * custom domain is added later, update this one constant — it feeds
 * metadataBase, OG/Twitter tags, sitemap, and robots.
 */
export const SITE_URL = "https://protfolio-web-alpha.vercel.app";

export const SITE_NAME = "Suyu — field notes";

export const SITE_DESCRIPTION =
  "I'm Suyu — I build data products end-to-end, from raw pipelines to statistical models to the interfaces people actually use. Toronto · data engineering / analytics / full-stack.";
