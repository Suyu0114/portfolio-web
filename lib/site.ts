/**
 * Canonical site metadata — SPEC §6.5.
 *
 * Production origin (Vercel default, per SPEC §10 fallback). If a custom
 * domain is added later, update this one constant — it feeds metadataBase,
 * OG/Twitter tags, sitemap, and robots.
 *
 * Changed 2026-08-22 from `protfolio-web-alpha.vercel.app`, which Suyu
 * renamed and which now 307s here. A redirecting canonical is not a broken
 * one, but it costs on both surfaces this constant feeds: every URL in the
 * sitemap pointed at a redirect, and OG tags on the old origin made every
 * shared link unfurl through a hop, which is the wrong first impression when
 * the sharer is a recruiter.
 */
export const SITE_URL = "https://suyu-portfolio.vercel.app";

export const SITE_NAME = "Suyu — field notes";

// Kept under ~160 characters so search results show it whole (SPEC §6.5
// sync rule: this and the OG strings derive from the positioning
// statement, shortened here rather than reworded).
export const SITE_DESCRIPTION =
  "Suyu, a Toronto full-stack engineer. Six years building the backbone of business operations: planning, approvals, assets, and sales, now integrating AI.";
