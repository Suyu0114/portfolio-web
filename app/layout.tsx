import type { Metadata } from "next";
import { Caveat, JetBrains_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
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
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
