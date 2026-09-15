/**
 * The hand-drawn button frame shared by the hero's three actions — SPEC.md
 * §6.1 (v1.8). An ink outline around a solid fill with a --card label, the
 * fill turning --ink on hover, and an optional ±1deg tilt on the same scale as
 * TagPill and Photo. One place, so the chat button and the two links beside it
 * cannot drift apart (CLAUDE.md: sketch utilities are shared, never ad-hoc).
 */

export type SketchRotate = "none" | "cw" | "ccw";

/** --accent for the chat button, as on the corner button; --accent-2 for the links. */
export type SketchFill = "accent" | "accent-2";

const ROTATION: Record<SketchRotate, string> = {
  none: "",
  cw: "rotate-[1deg]",
  ccw: "-rotate-[1deg]",
};

const FILL: Record<SketchFill, string> = {
  accent: "bg-accent",
  "accent-2": "bg-accent-2",
};

// The label is --card, near-white, as on the corner button: 4.79:1 on --accent
// and 4.82:1 on --accent-2, and 20px Caveat is normal-size text under WCAG, so
// it needs the full 4.5:1. Hover can't borrow the pills' --rule fill, where the
// label would drop to about 1.5:1, so it turns --ink, the fill a selected pill
// already uses.
export function sketchButtonClass(
  fill: SketchFill,
  border: "a" | "b",
  rotate: SketchRotate,
  className = "",
): string {
  return `${border === "a" ? "sk-border-a" : "sk-border-b"} ${FILL[fill]} text-card hover:bg-ink inline-flex items-center gap-1.5 px-3 py-1.5 ${ROTATION[rotate]} ${className}`;
}

/** The label inside the frame. Caveat is display-only and never below 20px (CLAUDE.md rule 5). */
export const SKETCH_BUTTON_LABEL =
  "font-display text-xl leading-none whitespace-nowrap";
