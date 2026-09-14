import type { Metadata } from "next";
import { Caveat, JetBrains_Mono } from "next/font/google";
import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { getAllProjects } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Display face: Caveat — finalized by Suyu after the P0 sample review.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read at build time so the widget can name the case study a visitor is
  // reading (SPEC-CHATBOT §6) without a client-side fetch. Three short
  // strings; the loader already fails the build if any project is malformed.
  const projectTitles = Object.fromEntries(
    getAllProjects().map((p) => [p.frontmatter.slug, p.frontmatter.title]),
  );

  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${caveat.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly)
          inject attributes on <body> before hydration; this ignores those
          attribute-only diffs on this element without masking real ones. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {/* Skip link, SPEC §5 (v1.6): the first focusable element on every
            page, off-screen until focused (.skip-link in globals.css). */}
        <a href="#main" className="skip-link sk-pill bg-card px-3 py-1 text-sm text-ink">
          skip to content
        </a>
        <Nav />
        {/* The skip target wraps every route here, 404 and /study included,
            so no page has to carry the id. Deliberately no tabIndex: that
            would ring the whole page in the focus outline. */}
        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>
        <Footer />
        <ChatWidget projectTitles={projectTitles} />
      </body>
    </html>
  );
}
