import ChineseDisplayFont from "@/components/ChineseDisplayFont";
import SiteShell from "@/components/SiteShell";
import { caveat, jetbrainsMono } from "@/lib/fonts";
import { HTML_LANG } from "@/lib/i18n";
import { MOTION_CSS } from "@/lib/motionCss";
import { rootMetadata } from "@/lib/pageMetadata";
import "../globals.css";

export const metadata = rootMetadata("zh-tw");

// The Traditional Chinese root layout (SPEC.md v1.13): the same shell as
// the English one, with its own <html lang>. The Chinese display face,
// Iansui, arrives after load (ChineseDisplayFont), so no English page and
// no first paint downloads it.
export default function ZhRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={HTML_LANG["zh-tw"]}
      className={`${jetbrainsMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <style>{MOTION_CSS}</style>
      </head>
      {/* suppressHydrationWarning: see app/(en)/layout.tsx. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <SiteShell locale="zh-tw">{children}</SiteShell>
        <ChineseDisplayFont />
      </body>
    </html>
  );
}
