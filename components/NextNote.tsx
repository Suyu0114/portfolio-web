import Link from "next/link";
import LinkArrow from "@/components/LinkArrow";

// Footer row after a case study — SPEC §6.3 (v1.6 page chrome): back to
// the index, or on to the next note by frontmatter order. The page picks
// `next` (wrapping from the last note to the first), so this stays a plain
// server component with no data access of its own.
export default function NextNote({
  next,
  allHref,
  copy,
}: {
  next: { href: string; title: string };
  /** The projects index in the page's locale. */
  allHref: string;
  copy: { label: string; allProjects: string; nextNotePrefix: string };
}) {
  return (
    <nav
      aria-label={copy.label}
      className="mt-14 flex flex-col gap-3 border-t border-rule pt-6 text-sm sm:flex-row sm:items-baseline sm:justify-between"
    >
      <Link href={allHref} className="mo-color text-muted underline hover:text-ink">
        <LinkArrow direction="left" /> {copy.allProjects}
      </Link>
      <Link href={next.href} className="text-accent underline">
        {copy.nextNotePrefix}
        {next.title} <LinkArrow />
      </Link>
    </nav>
  );
}
