import Link from "next/link";
import LinkArrow from "@/components/LinkArrow";
import TagPill from "@/components/TagPill";

type SketchCardProps = {
  title: string;
  tags: readonly string[];
  oneLiner: string;
  href: string;
  /** Alternate a/b between adjacent cards so the wobble doesn't repeat. */
  variant: "a" | "b";
};

// Hover — SPEC §4.3 (v1.8, reworked v1.11): the card tilts 0.5deg, mirrored
// per variant like the border wobble, and lifts 2px (.mo-card), while its
// bottom-right corner peels up like a sticky note (.mo-peel). All of it
// runs only for users who haven't asked for reduced motion, on devices that
// hover; the timings are motion tokens (SPEC §4.4).
const VARIANT = {
  a: "sk-border-a motion-safe:hover:rotate-[0.5deg]",
  b: "sk-border-b motion-safe:hover:-rotate-[0.5deg]",
} as const;

/**
 * The peeled corner (SPEC §4.3), drawn entirely by the .mo-peel rules in
 * app/globals.css: the gap where the corner lifted, the flap's shadow, and
 * the flap with its front (the card's own corner) and back (its shaded
 * underside). The layers take the card's border-radius, which is how the
 * peel follows each card's outline, so this markup carries no geometry.
 */
function CornerPeel() {
  return (
    <span aria-hidden="true" className="mo-peel">
      <span className="mo-peel-gap" />
      <span className="mo-peel-shadow">
        <span>
          <span />
        </span>
      </span>
      <span className="mo-peel-flap">
        <span className="mo-peel-front" />
        <span className="mo-peel-back" />
      </span>
    </span>
  );
}

export default function SketchCard({
  title,
  tags,
  oneLiner,
  href,
  variant,
}: SketchCardProps) {
  return (
    <article
      className={`${VARIANT[variant]} mo-card relative flex flex-col gap-3 bg-card p-5`}
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
        className="mo-underline mo-color mt-auto text-[13px] text-accent after:absolute after:inset-0 after:content-['']"
      >
        read case study <LinkArrow />
      </Link>
      <CornerPeel />
    </article>
  );
}
