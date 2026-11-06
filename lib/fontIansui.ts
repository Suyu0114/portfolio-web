import { Iansui } from "next/font/google";

/**
 * Chinese display face: Iansui (芫荽), SPEC.md §4.2 (v1.13). Imported only
 * by ChineseDisplayFont, dynamically, so neither its @font-face rules
 * (one per unicode-range slice, about 38 KB of CSS) nor its files are on
 * the first paint's path. next/font has no metrics to size a fallback for
 * it (the build says so), so none is made.
 */
export const iansui = Iansui({
  variable: "--font-iansui",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});
