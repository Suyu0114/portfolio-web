/**
 * The hand-drawn button frame shared by the hero's three actions — SPEC.md
 * §6.1 (v1.8). An ink outline on --card that fills with --rule on hover, and
 * an optional ±1deg tilt on the same scale as TagPill and Photo. One place, so
 * the chat button and the two links beside it cannot drift apart (CLAUDE.md:
 * sketch utilities are shared, never ad-hoc).
 */

export type SketchRotate = "none" | "cw" | "ccw";

const ROTATION: Record<SketchRotate, string> = {
  none: "",
  cw: "rotate-[1deg]",
  ccw: "-rotate-[1deg]",
};

export function sketchButtonClass(
  border: "a" | "b",
  rotate: SketchRotate,
  className = "",
): string {
  return `${border === "a" ? "sk-border-a" : "sk-border-b"} bg-card text-ink hover:bg-rule inline-flex items-center gap-1.5 px-3 py-1.5 ${ROTATION[rotate]} ${className}`;
}

/** The label inside the frame. Caveat is display-only and never below 20px (CLAUDE.md rule 5). */
export const SKETCH_BUTTON_LABEL =
  "font-display text-xl leading-none whitespace-nowrap";
