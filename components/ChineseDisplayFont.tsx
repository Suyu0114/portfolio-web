"use client";

import { useEffect } from "react";
import { afterLoadAndIdle } from "@/lib/afterLoad";

/**
 * Brings in the Chinese display face once the page has loaded and the
 * main thread is idle — SPEC.md §4.2 (v1.13). Loaded with the page, its
 * slices and @font-face rules took /zh-tw's mobile Lighthouse from the
 * English page's 94 to 69 (SPEC_v1.13_amendment.md §13), all of it in the
 * intro paragraph's render delay. Until it arrives, and without
 * JavaScript, Chinese headings show in the system's Chinese sans
 * (globals.css); Chinese glyphs are one em wide in both faces, so the swap
 * moves nothing sideways. Renders nothing.
 */
export default function ChineseDisplayFont() {
  useEffect(() => {
    let current = true;
    afterLoadAndIdle()
      .then(() => import("@/lib/fontIansui"))
      .then(({ iansui }) => {
        // The class defines --font-iansui; React never writes <html>'s
        // className again after hydration, so it stays.
        if (current) document.documentElement.classList.add(iansui.variable);
      });
    return () => {
      current = false;
    };
  }, []);
  return null;
}
