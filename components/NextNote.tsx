import Link from "next/link";

// Footer row after a case study — SPEC §6.3 (v1.6 page chrome): back to
// the index, or on to the next note by frontmatter order. The page picks
// `next` (wrapping from the last note to the first), so this stays a plain
// server component with no data access of its own.
export default function NextNote({
  next,
}: {
  next: { slug: string; title: string };
}) {
  return (
    <nav
      aria-label="More notes"
      className="mt-14 flex flex-col gap-3 border-t border-rule pt-6 text-sm sm:flex-row sm:items-baseline sm:justify-between"
    >
      <Link href="/projects" className="text-muted underline hover:text-ink">
        ← all projects
      </Link>
      <Link href={`/projects/${next.slug}`} className="text-accent underline">
        next note: {next.title} →
      </Link>
    </nav>
  );
}
