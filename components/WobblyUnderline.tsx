// Inline SVG quadratic-wiggle underline — SPEC.md §4.3. The SVG
// stretches to the width of whatever it wraps (preserveAspectRatio
// none), so the wobble adapts to any heading length.
//
// `draw` (v1.6) makes the path draw itself once on load, passed by page h1s
// only (SPEC §4.3). `hover` (v1.11) keeps the path hidden until what it
// wraps is hovered, then draws it on; the nav's other links use it.
// pathLength={1} lets the dash animations in globals.css (.mo-draw,
// .mo-hover-line; SPEC §4.4) cover the path whatever its rendered length.
export default function WobblyUnderline({
  children,
  draw = false,
  hover = false,
}: {
  children: React.ReactNode;
  draw?: boolean;
  hover?: boolean;
}) {
  return (
    <span className={`relative inline-block${hover ? " mo-hover-line" : ""}`}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 8"
        preserveAspectRatio="none"
        className="absolute -bottom-1 left-0 h-2 w-full"
      >
        <path
          d="M2 5 Q 12 2 24 5 T 46 5 T 68 3.5 T 90 5 T 118 4"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          className={draw ? "mo-draw" : undefined}
        />
      </svg>
    </span>
  );
}
