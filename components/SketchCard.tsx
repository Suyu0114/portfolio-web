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

export default function SketchCard({
  title,
  tags,
  oneLiner,
  href,
  variant,
}: SketchCardProps) {
  return (
    <article
      className={`${variant === "a" ? "sk-border-a" : "sk-border-b"} flex flex-col gap-3 bg-card p-5`}
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
          text, satisfying WCAG 2.5.3 Label in Name. */}
      <Link
        href={href}
        aria-label={`read case study: ${title}`}
        className="mt-auto text-[13px] text-accent hover:underline"
      >
        read case study →
      </Link>
    </article>
  );
}
