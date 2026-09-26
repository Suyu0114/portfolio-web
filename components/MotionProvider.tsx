"use client";

import { LazyMotion, MotionConfig } from "motion/react";

// Motion's animation features load after hydration, in their own chunk, so
// they add nothing to what the first paint waits for (SPEC §4.4, v1.11).
const loadFeatures = () => import("@/lib/motionFeatures").then((m) => m.default);

/**
 * Wraps page content so `m` components can animate — SPEC §4.4 (v1.11).
 * `strict` makes a full `motion.*` component throw, which would bypass the
 * lazy loading. `reducedMotion="user"` turns transform and layout
 * animations off for visitors who ask; `Reveal` and `RoughBarChart` also
 * check the preference themselves, since they skip their hidden states
 * entirely rather than fading.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
