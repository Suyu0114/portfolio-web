import Link from "next/link";
import NavLinks from "@/components/NavLinks";

export default function Nav() {
  return (
    // gap-4 keeps the wordmark and the links apart when a narrow screen
    // leaves no free space to justify (SPEC §9 P6: the nav holds at 360px).
    <header className="mx-auto flex w-full max-w-5xl items-baseline justify-between gap-4 px-6 py-6">
      <Link href="/" className="font-display text-4xl font-bold text-ink">
        Suyu.
      </Link>
      {/* The links mark the current section, which needs the pathname, so
          they live in a client component (SPEC §5, v1.6). The wordmark
          stays server-rendered. */}
      <NavLinks />
    </header>
  );
}
