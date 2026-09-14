import type { Heading } from "@/lib/headings";

// Contents line under a case study's header — SPEC §6.3 (v1.6 page
// chrome). Server component: the headings come from the MDX body at build
// time, so the line ships no client JS. The links sit in --muted text and
// are --muted themselves, so they keep a resting underline (same reason
// as Footer: axe link-in-text-block).
export default function CaseStudyContents({
  headings,
}: {
  headings: readonly Heading[];
}) {
  return (
    <nav
      aria-label="Contents"
      className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-muted"
    >
      <span className="text-ink-soft">contents:</span>
      <ul className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {headings.map((h, i) => (
          <li key={h.id} className="flex items-baseline gap-x-2">
            {i > 0 && <span aria-hidden="true">·</span>}
            <a href={`#${h.id}`} className="underline hover:text-ink">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
