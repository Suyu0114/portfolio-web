import { Caveat, JetBrains_Mono } from "next/font/google";

// The two Latin faces (SPEC §3, §4.2), shared by every root layout and by
// app/global-not-found.tsx, which bypasses the layouts and so loads its own.

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Display face: Caveat — finalized by Suyu after the P0 sample review.
export const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});
