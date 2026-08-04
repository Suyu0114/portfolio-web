import type { Metadata } from "next";

/**
 * The study — SPEC-CHATBOT §8. Suyu's private review area.
 *
 * Hidden, not secret-by-obscurity alone: absent from Nav, excluded from
 * sitemap.ts, disallowed in robots.ts, noindex here — *and* gated by
 * middleware.ts. This metadata is the last of those four, not the only one.
 */
export const metadata: Metadata = {
  title: "the study",
  robots: { index: false, follow: false },
};

export default function StudyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="mx-auto w-full max-w-3xl px-4 py-10">{children}</div>;
}
