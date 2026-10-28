import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import CaseStudyContents from "@/components/CaseStudyContents";
import LinkArrow from "@/components/LinkArrow";
import NextNote from "@/components/NextNote";
import TagPill from "@/components/TagPill";
import WobblyUnderline from "@/components/WobblyUnderline";
import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { getH2Headings } from "@/lib/headings";
import { mdxComponents } from "@/lib/mdxComponents";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

// SSG only — unknown slugs 404 instead of rendering dynamically.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.frontmatter.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { frontmatter } = getProjectBySlug(slug);
  return {
    title: frontmatter.title,
    description: frontmatter.oneLiner,
    openGraph: {
      title: `${frontmatter.title} — Suyu`,
      description: frontmatter.oneLiner,
      url: `${SITE_URL}/projects/${frontmatter.slug}`,
    },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const { frontmatter: fm, body } = getProjectBySlug(slug);
  const headings = getH2Headings(body);

  // Next note by frontmatter order, wrapping from the last back to the
  // first (SPEC §6.3, v1.6). getAllProjects() is already sorted by order.
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.frontmatter.slug === fm.slug);
  if (index === -1) {
    throw new Error(`CaseStudyPage: "${fm.slug}" is missing from getAllProjects()`);
  }
  const next = projects[(index + 1) % projects.length].frontmatter;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <header>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          <WobblyUnderline draw>{fm.title}</WobblyUnderline>
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">{fm.year}</span>
          {fm.tags.map((tag, i) => (
            <TagPill key={tag} label={tag} rotate={i % 2 === 1 ? "ccw" : "none"} />
          ))}
        </div>
        <p className="mt-4 text-ink">{fm.oneLiner}</p>
        {fm.links && (
          <p className="mt-3 flex flex-wrap gap-4 text-sm">
            {fm.links.demo && (
              <a href={fm.links.demo} target="_blank" rel="noreferrer" className="text-accent underline">
                live demo <LinkArrow />
              </a>
            )}
            {fm.links.repo && (
              <a href={fm.links.repo} target="_blank" rel="noreferrer" className="text-accent underline">
                repo <LinkArrow />
              </a>
            )}
            {fm.links.writeup && (
              <a href={fm.links.writeup} target="_blank" rel="noreferrer" className="text-accent underline">
                write-up <LinkArrow />
              </a>
            )}
          </p>
        )}
        <CaseStudyContents headings={headings} />
      </header>

      <article className="mt-4">
        <MDXRemote source={body} components={mdxComponents} />
      </article>

      <NextNote next={{ slug: next.slug, title: next.title }} />
    </main>
  );
}
