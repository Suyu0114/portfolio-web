/**
 * Motion tokens — SPEC.md §4.4 (v1.11). The one place a duration, easing,
 * stagger, distance or spring is written down; `npm run check`
 * (scripts/check-motion.mjs) fails on one anywhere else.
 *
 * Three readers, one source:
 * - CSS reads `--motion-*` variables, which lib/motionCss.ts serialises from
 *   these values and the root layout renders into <head>, so they exist
 *   from the first paint. The `mo-*` classes in app/globals.css use them.
 * - Motion (`m` components, `animate`) reads the transition objects below.
 * - Tailwind can read the variables too, e.g. `duration-(--motion-hover)`.
 *
 * This file imports nothing, so a client component that reads a token
 * ships only the numbers.
 *
 * The rhythm Suyu asked for (2026-09-25): hover about 300ms on a soft
 * ease-out, a faster exit, and springs that barely overshoot.
 */

/** Cubic-bezier control points. `out` starts at about 2.8x the average
 *  speed; Tailwind's `ease-out` (0, 0, 0.2, 1) starts at 5x, which is why
 *  the v1.8 card hover read as abrupt even at 400ms. */
export const EASE = {
  out: [0.22, 0.61, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

/** Milliseconds. */
export const DURATION = {
  press: 120,
  hover: 300,
  exit: 200,
  peel: 400,
  peelExit: 240,
  reveal: 500,
  draw: 600,
  chart: 700,
} as const;

/** Milliseconds between items that enter in sequence. */
export const STAGGER = { base: 70, tight: 40 } as const;

/** Milliseconds before the hero opening starts. */
export const DELAY = { base: 100 } as const;

/** Pixels. */
export const DISTANCE = { reveal: 12, lift: 2, nudge: 3 } as const;

/** Bounce stays at or below 0.15 (SPEC §4.4): no visible wobble. */
export const SPRING = { soft: { visualDuration: 0.35, bounce: 0.1 } } as const;

const s = (ms: number) => ms / 1000;

/** Motion transition for content fading up into view, the i-th in a sequence. */
export function revealTransition(i = 0) {
  return {
    duration: s(DURATION.reveal),
    ease: EASE.out,
    delay: s(i * STAGGER.base),
  };
}

/** Motion transition that applies a state at once, with no animation. */
export const INSTANT = { duration: 0 } as const;

/** Motion transition for the /projects filter reflow and for leaving cards. */
export const LAYOUT_TRANSITION = {
  layout: { type: "spring", ...SPRING.soft },
  opacity: { duration: s(DURATION.exit), ease: EASE.out },
  scale: { duration: s(DURATION.exit), ease: EASE.out },
} as const;

/** Chart entrance timings, in seconds for `animate`. */
export const CHART = {
  draw: s(DURATION.draw),
  grow: s(DURATION.chart),
  fade: s(DURATION.reveal),
  stagger: s(STAGGER.base),
  ease: EASE.out,
  drawEase: EASE.inOut,
} as const;
