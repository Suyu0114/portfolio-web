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
      className={`inline-block border-[1.5px] border-ink px-2 py-0.5 text-xs text-ink ${ROTATION[rotate]}`}
      style={{ borderRadius: "8px 3px 10px 3px / 3px 10px 3px 8px" }}
    >
      {label}
    </span>
  );
}
