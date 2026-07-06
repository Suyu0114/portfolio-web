import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "mdx spike — P0 dev page",
  robots: { index: false },
};

// Dev-only page (removed before P5): renders every content/*.mdx file
// through the pipeline so the static build validates all frontmatter
// and MDX bodies — a broken file fails the build (CLAUDE.md rule 2).
export default function MdxSpikePage() {
  const projects = getAllProjects();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">mdx spike (P0)</h1>

      {projects.map((p) => (
        <article key={p.frontmatter.slug} className="mt-10">
          <div className="rounded-sm border border-rule bg-card p-4 font-mono text-xs">
            <p className="text-ink">{p.file}</p>
            <pre className="mt-2 overflow-x-auto">
              {JSON.stringify(p.frontmatter, null, 2)}
            </pre>
          </div>
          <div className="mt-6 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_p]:mt-2">
            <MDXRemote source={p.body} />
          </div>
        </article>
      ))}
    </main>
  );
}
