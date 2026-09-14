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

// Hover tilt — SPEC §4.3 (v1.6): 0.5deg, mirrored per variant like the
// border wobble, and only for users who haven't asked for reduced motion.
const VARIANT = {
  a: "sk-border-a motion-safe:hover:rotate-[0.5deg]",
  b: "sk-border-b motion-safe:hover:-rotate-[0.5deg]",
} as const;

export default function SketchCard({
  title,
  tags,
  oneLiner,
  href,
  variant,
}: SketchCardProps) {
  return (
    <article
      className={`${VARIANT[variant]} relative flex flex-col gap-3 bg-card p-5 motion-safe:transition-transform`}
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
    </article>
  );
}
