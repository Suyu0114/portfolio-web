// Inline SVG quadratic-wiggle underline — SPEC.md §4.3. The SVG
// stretches to the width of whatever it wraps (preserveAspectRatio
// none), so the wobble adapts to any heading length.
//
// `draw` (v1.6) makes the path draw itself once on load: the site's one
// motion moment (SPEC §2), passed by page h1s only. pathLength={1} lets the
// dash animation in globals.css (.wobbly-draw) cover the path whatever its
// rendered length.
export default function WobblyUnderline({
  children,
  draw = false,
}: {
  children: React.ReactNode;
  draw?: boolean;
}) {
  return (
    <span className="relative inline-block">
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
          className={draw ? "wobbly-draw" : undefined}
        />
      </svg>
    </span>
  );
}
