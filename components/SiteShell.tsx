import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";
import Nav from "@/components/Nav";
import { getAllProjects } from "@/lib/content";

/**
 * Everything inside <body> that every page shares: the skip link, nav,
 * footer and chat widget. Each root layout, and app/global-not-found.tsx
 * (which bypasses the layouts), renders the document around it.
 */
export default function SiteShell({
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
    <>
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
        <MotionProvider>{children}</MotionProvider>
      </div>
      <Footer />
      <ChatWidget projectTitles={projectTitles} />
    </>
  );
}
