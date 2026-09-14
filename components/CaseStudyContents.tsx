import type { Heading } from "@/lib/headings";

// Contents line under a case study's header — SPEC §6.3 (v1.6 page
// chrome). Server component: the headings come from the MDX body at build
// time, so the line ships no client JS.
//
// The entries flow like a line of text and wrap between entries, never
// inside one. They're spaced apart rather than separated by dots, so no
// wrapped line starts on a stray "·". The links sit in --muted text and
// are --muted themselves, so they keep a resting underline (same reason as
// Footer: axe link-in-text-block).
export default function CaseStudyContents({
  headings,
}: {
  headings: readonly Heading[];
}) {
  return (
    <nav aria-label="Contents" className="mt-5 text-sm leading-7 text-muted">
      {/* The nav's aria-label already names this for assistive tech. */}
      <span aria-hidden="true" className="mr-3 text-ink-soft">
        contents:
      </span>
      <ul className="inline">
        {headings.map((h) => (
          <li key={h.id} className="mr-4 inline-block">
            <a href={`#${h.id}`} className="underline hover:text-ink">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
