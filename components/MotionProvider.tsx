"use client";

import { LazyMotion, MotionConfig } from "motion/react";

// Motion's animation features load in their own chunk once the page has
// loaded and the main thread is idle, so they compete with nothing the
// first paint needs (SPEC §4.4, v1.11). Until then `m` elements render as
// plain, visible elements; nothing on screen at that point is waiting on
// them, since Reveal only hides content below the viewport.
function afterLoadAndIdle(): Promise<void> {
  return new Promise((resolve) => {
    const idle = () =>
      "requestIdleCallback" in window
        ? requestIdleCallback(() => resolve())
        : setTimeout(resolve, 0);
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
  });
}

const loadFeatures = () =>
  afterLoadAndIdle()
    .then(() => import("@/lib/motionFeatures"))
    .then((m) => m.default);

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
