"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WobblyUnderline from "@/components/WobblyUnderline";

// Nav labels are microcopy (CLAUDE.md conventions exception).
// resume is a static PDF, opened in a new tab so visitors keep the site.
const NAV_LINKS = [
  { href: "/", label: "home", newTab: false },
  { href: "/projects", label: "projects", newTab: false },
  { href: "/about", label: "about", newTab: false },
  { href: "/resume.pdf", label: "resume", newTab: true },
] as const;

// SPEC §5 (v1.6): a case study counts as projects; home matches only
// itself, or every page would mark it.
function isCurrent(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Client component only because the current section comes from the
// pathname. The current link's underline never passes `draw` (SPEC §4.3);
// the other links draw the same underline on while hovered (v1.11).
export default function NavLinks() {
  const pathname = usePathname();

  return (
    // gap-3 below sm: at 360px the wordmark plus four links with gap-5
    // overran the header's content box and touched the wordmark.
    <nav aria-label="Primary" className="flex gap-3 text-sm text-muted sm:gap-7">
      {NAV_LINKS.map((l) => {
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
        const current = isCurrent(l.href, pathname);
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
    </nav>
  );
}
