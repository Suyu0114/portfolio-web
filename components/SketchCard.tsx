import Link from "next/link";
import TagPill from "@/components/TagPill";

type SketchCardProps = {
  title: string;
  tags: readonly string[];
  oneLiner: string;
  href: string;
  /** Alternate a/b between adjacent cards so the wobble doesn't repeat. */
  variant: "a" | "b";
};

// Hover — SPEC §4.3 (v1.8): the card tilts 0.5deg, mirrored per variant like
// the border wobble, while its bottom-right corner curls up like a sticky note
// being peeled. Both share one slow ease so they read as a single motion, and
// both run only for users who haven't asked for reduced motion.
const VARIANT = {
  a: "sk-border-a motion-safe:hover:rotate-[0.5deg]",
  b: "sk-border-b motion-safe:hover:-rotate-[0.5deg]",
} as const;

const EASE =
  "motion-safe:transition-transform motion-safe:duration-(--motion-peel) motion-safe:ease-(--motion-ease-out)";

/**
 * The peeled corner, and the one place the site draws a gradient or a shadow
 * (CLAUDE.md conventions, SPEC §4.3 v1.8). Both are mixed from the frozen
 * tokens alone, so no color outside SPEC §4.1 appears.
 *
 * It sits over the card's corner at scale 0 and grows out of it on hover. The
 * part beyond the crease is the page showing through where the corner lifted,
 * painted --paper and shaded where the flap still overhangs it; that assumes
 * the card sits on the page ground, which both grids that render it do. The
 * flap is the note's back rolling up and inward, outlined in ink like the
 * border it was folded from, with a soft shadow on the card beneath it.
 * pointer-events-none keeps the stretched link underneath clickable.
 */
function CornerCurl({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={`pointer-events-none absolute -right-0.5 -bottom-0.5 size-12 origin-bottom-right scale-0 motion-safe:group-hover:scale-100 ${EASE}`}
    >
      <defs>
        <linearGradient id={`${id}-gap`} x1="0.5" y1="0.5" x2="1" y2="1">
          <stop
            offset="0"
            style={{
              stopColor:
                "color-mix(in srgb, var(--color-paper), var(--color-ink) 22%)",
            }}
          />
          <stop offset="0.5" style={{ stopColor: "var(--color-paper)" }} />
        </linearGradient>
        <linearGradient id={`${id}-flap`} x1="0.7" y1="0.7" x2="0.15" y2="0.15">
          <stop
            offset="0"
            style={{
              stopColor:
                "color-mix(in srgb, var(--color-rule), var(--color-ink) 15%)",
            }}
          />
          <stop offset="0.5" style={{ stopColor: "var(--color-rule)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-card)" }} />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="-3"
            dy="-3"
            stdDeviation="3"
            style={{ floodColor: "var(--color-ink)", floodOpacity: 0.3 }}
          />
        </filter>
      </defs>
      <path d="M0 100 Q58 58 100 0 L100 100 Z" fill={`url(#${id}-gap)`} />
      <path
        d="M0 100 Q58 58 100 0 Q54 8 16 16 Q8 54 0 100 Z"
        fill={`url(#${id}-flap)`}
        filter={`url(#${id}-shadow)`}
        style={{ stroke: "var(--color-ink)" }}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SketchCard({
  title,
  tags,
  oneLiner,
  href,
  variant,
}: SketchCardProps) {
  // Each project appears once per page, so an id derived from its href keeps
  // the curl's gradient and filter ids unique without a hook.
  const curlId = `curl${href.replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <article
      className={`${VARIANT[variant]} group relative flex flex-col gap-3 bg-card p-5 ${EASE}`}
    >
      <h3 className="text-[15px] font-medium text-ink">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <TagPill key={tag} label={tag} rotate={i % 2 === 1 ? "ccw" : "none"} />
        ))}
      </div>
      <p className="text-[13px]">{oneLiner}</p>
      {/* Three cards render this same visible text to three different
          projects, so each needs a distinct accessible name (axe
          identical-links-same-purpose). The label still contains the visible
          text, satisfying WCAG 2.5.3 Label in Name. The ::after overlay
          stretches this one link over the whole card (SPEC §4.3, v1.6), so
          the card is the click target without a second link or a handler. */}
      <Link
        href={href}
        aria-label={`read case study: ${title}`}
        className="mt-auto text-[13px] text-accent after:absolute after:inset-0 after:content-[''] hover:underline"
      >
        read case study →
      </Link>
      <CornerCurl id={curlId} />
    </article>
  );
}
