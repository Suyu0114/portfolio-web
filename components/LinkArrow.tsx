// The arrow at the end of a text link — SPEC §4.3 (v1.11). It moves 3px its
// own way while the link is hovered (.mo-nudge in globals.css). It is a
// direct child of the link, which is what the hover rule matches, and the
// glyph stays text, so the link's accessible name doesn't change.
export default function LinkArrow({
  direction = "right",
}: {
  direction?: "left" | "right";
}) {
  return (
    <span className={`mo-nudge mo-nudge-${direction}`}>
      {direction === "right" ? "→" : "←"}
    </span>
  );
}
