type TagPillProps = {
  label: string;
  /** Optional ±1deg rotation (SPEC.md §4.3); stays within the ±1.5deg cap. */
  rotate?: "none" | "cw" | "ccw";
};

const ROTATION: Record<NonNullable<TagPillProps["rotate"]>, string> = {
  none: "",
  cw: "rotate-[1deg]",
  ccw: "-rotate-[1deg]",
};

export default function TagPill({ label, rotate = "none" }: TagPillProps) {
  return (
    <span
      className={`sk-pill inline-block px-2 py-0.5 text-xs text-ink ${ROTATION[rotate]}`}
    >
      {label}
    </span>
  );
}
