import { HERO } from "@/lib/siteContent";

// Hero doodle — SPEC §6.1.1: decorative, hand-drawn calibration sketch.
// Deliberately NOT rough.js and not data-bound; the wobble is drawn into
// the paths themselves.
//
// It draws itself in once as part of the hero's opening (SPEC §4.4, v1.11):
// the axes, then the model line, then the dashed market line wiped on from
// the left (a dash draw would break its dashes), then the caption. [--i:n]
// is the step in the sequence; the classes are in globals.css. pathLength
// lets the draw cover each path whatever its length.
export default function CalibrationDoodle() {
  return (
    <figure className="mx-auto w-full max-w-sm">
      <svg
        aria-hidden="true"
        viewBox="0 0 320 200"
        fill="none"
        className="h-auto w-full"
      >
        {/* axes */}
        <path
          d="M28 12 C 26 60 27 120 26 176"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength={1}
          className="mo-draw [--i:1]"
        />
        <path
          d="M26 174 C 100 176 220 173 304 175"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength={1}
          className="mo-draw [--i:2]"
        />
        {/* solid "model" line (--accent) */}
        <path
          d="M32 150 C 70 138 96 108 130 96 C 168 82 200 76 236 58 C 258 47 278 40 296 34"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          className="mo-draw [--i:4]"
        />
        {/* dashed "market" line (--accent-2) */}
        <path
          d="M32 156 C 78 132 110 122 148 104 C 186 87 226 68 258 60 C 274 56 288 50 298 46"
          stroke="var(--color-accent-2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="7 7"
          className="mo-wipe [--i:5]"
        />
      </svg>
      <figcaption className="mo-rise mt-2 text-center font-display text-xl text-muted [--i:8]">
        {HERO.doodleCaption}
      </figcaption>
    </figure>
  );
}
