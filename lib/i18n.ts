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

/** Each language's name in its own language, for the switch (SPEC §5). */
export const LANGUAGE_NAME: Record<Locale, string> = {
  en: "English",
  "zh-tw": "中文",
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

/**
 * `lang="en"` for a string a Chinese page shows in English (one Suyu kept
 * English, SPEC §7.5), so a screen reader voices it in English; otherwise
 * undefined, which leaves English pages' markup as it was.
 */
export function langOf(locale: Locale, text: string): string | undefined {
  return locale !== "en" && !/\p{Script=Han}/u.test(text) ? HTML_LANG.en : undefined;
}

/** The locale a pathname belongs to. */
export function localeOf(pathname: string): Locale {
  const prefixed = LOCALES.find(
    (locale) =>
      PREFIX[locale] !== "" &&
      (pathname === PREFIX[locale] || pathname.startsWith(`${PREFIX[locale]}/`)),
  );
  return prefixed ?? "en";
}

/** The pages that exist in both locales (SPEC §5), without a prefix. */
const BOTH_LOCALES = /^\/(?:projects(?:\/[a-z0-9-]+)?|about)?$/;

/**
 * The same page in the other locale, or null when it has none (/study).
 * Unmatched URLs render the 404 inside this pattern too, so the 404 asks
 * for no switch itself (SiteShell's `languageSwitch`).
 */
export function counterpartPath(pathname: string): { locale: Locale; href: string } | null {
  const locale = localeOf(pathname);
  const path = pathname.slice(PREFIX[locale].length) || "/";
  if (!BOTH_LOCALES.test(path)) return null;
  const other: Locale = locale === "en" ? "zh-tw" : "en";
  return { locale: other, href: localePath(other, path) };
}
