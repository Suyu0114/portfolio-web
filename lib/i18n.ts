/**
 * Locales — SPEC.md v1.13. English is the default and has no URL prefix;
 * Traditional Chinese lives under /zh-tw. No i18n library, no detection,
 * no redirects (CLAUDE.md rule 7). No fs import, so client components can
 * use it.
 */

export const LOCALES = ["en", "zh-tw"] as const;

export type Locale = (typeof LOCALES)[number];

/** `<html lang>` and hreflang for each locale. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  "zh-tw": "zh-TW",
};

/** `og:locale` for each locale. */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  "zh-tw": "zh_TW",
};

const PREFIX: Record<Locale, string> = {
  en: "",
  "zh-tw": "/zh-tw",
};

/** A site path in `locale`: "/projects" is "/zh-tw/projects" in Chinese. */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`localePath: "${path}" is not a site path`);
  }
  const prefix = PREFIX[locale];
  if (prefix === "") return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}
