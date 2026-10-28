import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { caveat, jetbrainsMono } from "@/lib/fonts";
import { MOTION_CSS } from "@/lib/motionCss";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages set a short title; the template appends the suffix (SPEC §6.5).
  title: {
    default: "field notes — Suyu",
    template: "%s — Suyu",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "field notes — Suyu",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "field notes — Suyu",
    description: SITE_DESCRIPTION,
  },
};

// The English root layout. The Traditional Chinese pages have their own
// (app/zh-tw/layout.tsx), so each locale's <html lang> is right.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        {/* The motion tokens as --motion-* variables (SPEC §4.4, v1.11),
            in the static HTML so CSS animations have them at first paint. */}
        <style>{MOTION_CSS}</style>
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly)
          inject attributes on <body> before hydration; this ignores those
          attribute-only diffs on this element without masking real ones. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
