"use client";

import { m, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { DISTANCE, INSTANT, revealTransition } from "@/lib/motion";

// Reveals that start in the same moment (a row of cards scrolling in
// together) fade up one stagger step apart; one on its own starts at once.
let lastRevealAt = -Infinity;
let revealsInBatch = 0;
function nextInBatch(): number {
  const now = performance.now();
  revealsInBatch = now - lastRevealAt < 50 ? revealsInBatch + 1 : 0;
  lastRevealAt = now;
  return revealsInBatch;
}

type Phase = "static" | "hidden" | "shown";

/**
 * Content that fades up once as it scrolls into view — SPEC §4.4 (v1.11).
 *
 * Rendered visible, so nothing depends on JavaScript to be seen and the
 * server HTML is the finished page. After hydration, the first
 * IntersectionObserver report decides: content still wholly below the
 * viewport is hidden (it's off screen, so nothing flashes) and fades up the
 * first time 15% of it shows; content already on screen, or scrolled past,
 * is left alone. It never replays, doesn't touch scrolling, and does
 * nothing for visitors who ask for reduced motion.
 *
 * It marks itself data-reveal="shown" as it fades up, which starts the
 * .mo-rise-in and .mo-arrow-in steps inside it (globals.css).
 */
export default function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("static");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let hidden = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!hidden) {
          if (entry.boundingClientRect.top < window.innerHeight) {
            io.disconnect();
            return;
          }
          hidden = true;
          setPhase("hidden");
          return;
        }
        if (entry.isIntersecting) {
          io.disconnect();
          setStep(nextInBatch());
          setPhase("shown");
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <m.div
      ref={ref}
      className={className}
      data-reveal={phase === "shown" ? "shown" : undefined}
      initial={false}
      animate={
        phase === "hidden"
          ? { opacity: 0, y: DISTANCE.reveal }
          : { opacity: 1, y: 0 }
      }
      transition={phase === "hidden" ? INSTANT : revealTransition(step)}
    >
      {children}
    </m.div>
  );
}
