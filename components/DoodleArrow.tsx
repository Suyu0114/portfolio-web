// Small hand-drawn arrow used next to section heads — SPEC.md §4.3.
//
// `draw` (v1.11, SPEC §4.4) draws the shaft, then the head: "load" once at
// first paint, beside a page's h1; "reveal" when the Reveal it sits in
// scrolls into view. Set --i (a "[--i:2]" class, or `style` when the step is
// computed) to place it in a sequence. pathLength lets the draw cover each
// path.
export default function DoodleArrow({
  className = "",
  draw,
  style,
}: {
  className?: string;
  draw?: "load" | "reveal";
  style?: React.CSSProperties;
}) {
  const drawClass =
    draw === "load" ? "mo-arrow-load" : draw === "reveal" ? "mo-arrow-in" : "";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 24"
      fill="none"
      className={`inline-block h-5 w-10 align-middle ${drawClass} ${className}`}
      style={style}
    >
      <path
        d="M3 7 C 13 15 27 17 41 13"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
      />
      <path
        d="M33 8 L 42 12.5 L 33.5 18"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
    </svg>
  );
}
