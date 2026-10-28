import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import { localePath, type Locale } from "@/lib/i18n";
import { getSiteCopy } from "@/lib/siteContent";

export default function Nav({ locale }: { locale: Locale }) {
  const { nav } = getSiteCopy(locale).ui;
  return (
    // gap-4 keeps the wordmark and the links apart when a narrow screen
    // leaves no free space to justify (SPEC §9 P6: the nav holds at 360px).
    <header className="mx-auto flex w-full max-w-5xl items-baseline justify-between gap-4 px-6 py-6">
      <Link href={localePath(locale, "/")} className="font-display text-4xl font-bold text-ink">
        Suyu.
      </Link>
      {/* The links mark the current section, which needs the pathname, so
          they live in a client component (SPEC §5, v1.6). The wordmark
          stays server-rendered. The labels and paths arrive in the page's
          locale, so the client bundle carries no copy. */}
      <NavLinks
        label={nav.label}
        links={[
          { href: localePath(locale, "/"), label: nav.home, newTab: false },
          { href: localePath(locale, "/projects"), label: nav.projects, newTab: false },
          { href: localePath(locale, "/about"), label: nav.about, newTab: false },
          { href: "/resume.pdf", label: nav.resume, newTab: true },
        ]}
      />
    </header>
  );
}
