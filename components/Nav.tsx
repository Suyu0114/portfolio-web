import Link from "next/link";

// Nav labels are microcopy (CLAUDE.md conventions exception).
const NAV_LINKS = [
  { href: "/projects", label: "projects" },
  { href: "/about", label: "about" },
  // TODO(§10/P5): /resume.pdf is a static file added at P5.
  { href: "/resume.pdf", label: "resume" },
] as const;

export default function Nav() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-baseline justify-between px-6 py-6">
      <Link href="/" className="font-display text-2xl font-bold text-ink">
        Suyu.
      </Link>
      <nav className="flex gap-5 text-sm text-muted sm:gap-7">
        {NAV_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-ink">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
