import { Iansui } from "next/font/google";
import SiteShell from "@/components/SiteShell";
import { caveat, jetbrainsMono } from "@/lib/fonts";
import { HTML_LANG } from "@/lib/i18n";
import { MOTION_CSS } from "@/lib/motionCss";
import { rootMetadata } from "@/lib/pageMetadata";
import "../globals.css";

// Chinese display face: Iansui (芫荽), SPEC.md §4.2 (v1.13). Loaded here
// only, so no English page downloads it, and not preloaded: Google Fonts
// serves it in unicode-range slices, and a page fetches only the slices
// its characters need. globals.css puts it after Caveat on this layout's
// pages, so Latin letters in a heading stay Caveat. next/font has no
// metrics to size a fallback for it (the build says so), so none is made;
// until it loads, Chinese headings show in the system's Chinese sans.
const iansui = Iansui({
  variable: "--font-iansui",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const metadata = rootMetadata("zh-tw");

// The Traditional Chinese root layout (SPEC.md v1.13): the same shell as
// the English one, with its own <html lang> and the Chinese display face.
export default function ZhRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={HTML_LANG["zh-tw"]}
      className={`${jetbrainsMono.variable} ${caveat.variable} ${iansui.variable} h-full antialiased`}
    >
      <head>
        <style>{MOTION_CSS}</style>
      </head>
      {/* suppressHydrationWarning: see app/(en)/layout.tsx. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <SiteShell locale="zh-tw">{children}</SiteShell>
      </body>
    </html>
  );
}
