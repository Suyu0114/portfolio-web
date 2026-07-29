import type { Metadata } from "next";
import { Caveat, JetBrains_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
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
  // TODO(P4): per-page metadata, final "{Page} — Suyu" pattern, OG image.
  title: "field notes — Suyu",
  description:
    "I'm Suyu — I build data products end-to-end, from raw pipelines to statistical models to the interfaces people actually use.",
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
