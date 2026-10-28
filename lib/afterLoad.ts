/**
 * Resolves once the page has loaded and the main thread is idle, so work
 * started then competes with nothing the first paint needs. Browser-only.
 * Shared by MotionProvider (SPEC §4.4, v1.11) and ChineseDisplayFont
 * (SPEC §4.2, v1.13).
 */
export function afterLoadAndIdle(): Promise<void> {
  return new Promise((resolve) => {
    const idle = () =>
      "requestIdleCallback" in window
        ? requestIdleCallback(() => resolve())
        : setTimeout(resolve, 0);
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
  });
}
