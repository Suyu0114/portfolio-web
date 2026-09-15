import Link from "next/link";
import {
  SKETCH_BUTTON_LABEL,
  sketchButtonClass,
  type SketchRotate,
} from "@/lib/sketchButton";

/**
 * A link drawn as a hand-drawn button, for the hero's about and interests
 * actions (SPEC.md §6.1, v1.8). They change page, so they are links rather
 * than buttons, but they share the chat button's frame so the row reads as
 * one set. They are filled with --accent-2 and carry no icon, so the chat
 * button's --accent and speech bubble mark the one action in the row that
 * opens something instead of navigating.
 */
export default function SketchButtonLink({
  href,
  label,
  border = "a",
  rotate = "none",
  className = "",
}: {
  href: string;
  label: string;
  border?: "a" | "b";
  rotate?: SketchRotate;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={sketchButtonClass("accent-2", border, rotate, className)}
    >
      <span className={SKETCH_BUTTON_LABEL}>{label}</span>
    </Link>
  );
}
