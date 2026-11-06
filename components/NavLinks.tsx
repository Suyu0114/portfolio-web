"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitch from "@/components/LanguageSwitch";
import WobblyUnderline from "@/components/WobblyUnderline";

// One nav entry. Nav builds them in the page's locale (SPEC v1.13): home,
// projects, about, then resume, a static PDF opened in a new tab so
// visitors keep the site.
export type NavLink = { href: string; label: string; newTab: boolean };

// SPEC §5 (v1.6): a case study counts as projects; home matches only
// itself, or every page would mark it. Home is the first entry, in either
// locale ("/" or "/zh-tw").
function isCurrent(href: string, pathname: string, isHome: boolean): boolean {
  if (isHome) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Client component only because the current section comes from the
// pathname. The current link's underline never passes `draw` (SPEC §4.3);
// the other links draw the same underline on while hovered (v1.11).
export default function NavLinks({
  label,
  links,
  languageSwitch,
}: {
  label: string;
  links: readonly NavLink[];
  /** End with the switch to the other language (SPEC §5, v1.13). */
  languageSwitch: boolean;
}) {
  const pathname = usePathname();

  return (
    // gap-3 below sm: at 360px the wordmark plus four links with gap-5
    // overran the header's content box and touched the wordmark.
    <nav aria-label={label} className="flex gap-3 text-sm text-muted sm:gap-7">
      {links.map((l, i) => {
        if (l.newTab) {
          return (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="mo-color hover:text-ink"
            >
              <WobblyUnderline hover>{l.label}</WobblyUnderline>
            </a>
          );
        }
        const current = isCurrent(l.href, pathname, i === 0);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current ? "page" : undefined}
            className={current ? "text-ink" : "mo-color hover:text-ink"}
          >
            <WobblyUnderline hover={!current}>{l.label}</WobblyUnderline>
          </Link>
        );
      })}
      {languageSwitch && <LanguageSwitch variant="nav" />}
    </nav>
  );
}
