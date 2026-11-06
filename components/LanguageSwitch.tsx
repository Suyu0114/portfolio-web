"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import WobblyUnderline from "@/components/WobblyUnderline";
import {
  counterpartPath,
  HTML_LANG,
  LANGUAGE_NAME,
  LOCALES,
  localeOf,
} from "@/lib/i18n";

// The language switch — SPEC §5 (v1.13): a link to the same page in the
// other language. Client component only because the page comes from the
// pathname; it still renders on the server, so it works without
// JavaScript. A plain <a>, not <Link>: each locale has its own root
// layout, so the switch is a full page load either way (the chat
// transcript survives it in sessionStorage). Each name is written in its
// own language and carries that lang, so a screen reader says it right.
//
// "nav" is the nav's last link, from sm up only: below sm the nav has no
// room for a fifth item (SPEC §9 P6: it must hold at 360px). "footer" is
// "English · 中文" at every width, the current language as plain text.
export default function LanguageSwitch({ variant }: { variant: "nav" | "footer" }) {
  const pathname = usePathname();
  const counterpart = counterpartPath(pathname);
  if (counterpart === null) return null;
  const lang = HTML_LANG[counterpart.locale];

  if (variant === "nav") {
    return (
      <a
        href={counterpart.href}
        hrefLang={lang}
        lang={lang}
        className="mo-color hidden hover:text-ink sm:inline"
      >
        <WobblyUnderline hover>{LANGUAGE_NAME[counterpart.locale]}</WobblyUnderline>
      </a>
    );
  }

  const current = localeOf(pathname);
  return (
    <p className="text-sm text-muted">
      {LOCALES.map((locale, i) => (
        <Fragment key={locale}>
          {i > 0 ? " · " : null}
          {locale === current ? (
            <span lang={HTML_LANG[locale]}>{LANGUAGE_NAME[locale]}</span>
          ) : (
            // Muted in muted text, so the resting underline is what marks
            // it as a link (axe link-in-text-block), as in the footer's
            // contact links.
            <a
              href={counterpart.href}
              hrefLang={HTML_LANG[locale]}
              lang={HTML_LANG[locale]}
              className="mo-color underline hover:text-ink"
            >
              {LANGUAGE_NAME[locale]}
            </a>
          )}
        </Fragment>
      ))}
    </p>
  );
}
