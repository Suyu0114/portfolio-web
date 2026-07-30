import Link from "next/link";

// Nav labels are microcopy (CLAUDE.md conventions exception).
// resume is a static PDF, opened in a new tab so visitors keep the site.
const NAV_LINKS = [
  { href: "/projects", label: "projects", newTab: false },
  { href: "/about", label: "about", newTab: false },
  { href: "/resume.pdf", label: "resume", newTab: true },
] as const;

export default function Nav() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-baseline justify-between px-6 py-6">
      <Link href="/" className="font-display text-2xl font-bold text-ink">
        Suyu.
      </Link>
      <nav aria-label="Primary" className="flex gap-5 text-sm text-muted sm:gap-7">
        {NAV_LINKS.map((l) =>
          l.newTab ? (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              {l.label}
            </a>
          ) : (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ),
        )}
      </nav>
    </header>
  );
}
