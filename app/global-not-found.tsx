import type { Metadata } from "next";
import NotFoundNote from "@/components/NotFoundNote";
import SiteShell from "@/components/SiteShell";
import { caveat, jetbrainsMono } from "@/lib/fonts";
import { MOTION_CSS } from "@/lib/motionCss";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// The 404 for URLs that match no route, in either locale. With one root
// layout per locale there is no single layout to compose it from, so it
// renders the whole document itself (experimental.globalNotFound). A miss
// under /zh-tw lands here too, in English: knowing the locale would take a
// request-time route, and the site stays static (SPEC v1.13).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "field notes — Suyu",
};

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <style>{MOTION_CSS}</style>
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <SiteShell locale="en">
          <NotFoundNote />
        </SiteShell>
      </body>
    </html>
  );
}
