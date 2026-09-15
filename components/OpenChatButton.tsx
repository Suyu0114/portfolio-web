import SpeechBubble from "@/components/SpeechBubble";
import {
  SKETCH_BUTTON_LABEL,
  sketchButtonClass,
  type SketchRotate,
} from "@/lib/sketchButton";

/**
 * Selector for any control that opens the chat panel — SPEC-CHATBOT §6.
 * `ChatWidget` listens for clicks matching it on the document, which is what
 * lets this button stay a server component: it ships no client JS of its own,
 * so the widget still adds nothing to first-load JS beyond its entry code
 * (§1 criterion 4). Kept beside the attribute it matches so the two cannot
 * drift apart.
 */
export const OPEN_CHAT_SELECTOR = "[data-open-chat]";

/**
 * A second way into the chat, in page flow (the home hero) rather than fixed in
 * the corner. It opens the same widget, so there is still one panel and one
 * conversation, and the corner button keeps its own §6 label.
 */
export default function OpenChatButton({
  label,
  border = "b",
  rotate = "ccw",
  className = "",
}: {
  label: string;
  border?: "a" | "b";
  rotate?: SketchRotate;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-open-chat=""
      // Matches the corner button. No aria-expanded: a server component cannot
      // know whether the panel is open, so it could only ever say "false".
      aria-haspopup="dialog"
      // Ink outline rather than the corner button's solid --accent: the hero
      // already carries the underline and the doodle in accent, and SPEC.md
      // §4.1 keeps accent to about a tenth of the screen.
      className={sketchButtonClass(border, rotate, className)}
    >
      <SpeechBubble />
      <span className={SKETCH_BUTTON_LABEL}>{label}</span>
    </button>
  );
}
