import { spring } from "motion";
import { DELAY, DISTANCE, DURATION, EASE, SPRING, STAGGER } from "@/lib/motion";

// Serialises lib/motion.ts into the `--motion-*` CSS variables. Server-only:
// the root layout renders the result into <head>. Kept apart from the
// tokens so client components that import a token don't also ship this
// module's spring() call.

// `spring()` returns "<settle>ms linear(...)": the time the spring takes to
// settle, then its curve as a CSS easing function. Split so CSS can pair the
// curve with the settle time. Fail loud (CLAUDE.md rule 2) if Motion ever
// changes that format, rather than shipping a broken variable.
const springCss = String(spring(SPRING.soft.visualDuration, SPRING.soft.bounce));
const springMatch = /^(\d+)ms (linear\(.+\))$/.exec(springCss);
if (!springMatch) {
  throw new Error(`lib/motionCss.ts: unexpected spring() output "${springCss}"`);
}

const bezier = (p: readonly number[]) => `cubic-bezier(${p.join(", ")})`;
const ms = (n: number) => `${n}ms`;

/** `:root { --motion-* }`, one declaration per token. */
export const MOTION_CSS = `:root{${Object.entries({
  "ease-out": bezier(EASE.out),
  "ease-in-out": bezier(EASE.inOut),
  "spring-soft": springMatch[2],
  "spring-soft-duration": ms(Number(springMatch[1])),
  press: ms(DURATION.press),
  hover: ms(DURATION.hover),
  exit: ms(DURATION.exit),
  peel: ms(DURATION.peel),
  "peel-exit": ms(DURATION.peelExit),
  reveal: ms(DURATION.reveal),
  draw: ms(DURATION.draw),
  chart: ms(DURATION.chart),
  stagger: ms(STAGGER.base),
  "stagger-tight": ms(STAGGER.tight),
  "delay-base": ms(DELAY.base),
  "reveal-distance": `${DISTANCE.reveal}px`,
  lift: `${DISTANCE.lift}px`,
  nudge: `${DISTANCE.nudge}px`,
})
  .map(([k, v]) => `--motion-${k}:${v}`)
  .join(";")}}`;
