import { MDXRemote } from "next-mdx-remote/rsc";
import CaseStudyContents from "@/components/CaseStudyContents";
import LinkArrow from "@/components/LinkArrow";
import NextNote from "@/components/NextNote";
import TagPill from "@/components/TagPill";
import WobblyUnderline from "@/components/WobblyUnderline";
import { getProject, getProjects } from "@/lib/content";
import { langOf, localePath, type Locale } from "@/lib/i18n";
import { getMdxComponents } from "@/lib/mdxComponents";
import { getSiteCopy } from "@/lib/siteContent";

// A case study — SPEC §6.3 — in either locale (SPEC v1.13).
export default function CaseStudyPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const { ui } = getSiteCopy(locale);
  const { frontmatter: fm, body, headings } = getProject(locale, slug);

  // Next note by frontmatter order, wrapping from the last back to the
  // first (SPEC §6.3, v1.6). getProjects() is already sorted by order.
  const projects = getProjects(locale);
  const index = projects.findIndex((p) => p.frontmatter.slug === fm.slug);
  if (index === -1) {
    throw new Error(`CaseStudyPage: "${fm.slug}" is missing from getProjects()`);
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
            <TagPill key={tag} label={ui.tags[tag]} rotate={i % 2 === 1 ? "ccw" : "none"} />
          ))}
        </div>
        <p className="mt-4 text-ink">{fm.oneLiner}</p>
        {fm.links && (
          <p className="mt-3 flex flex-wrap gap-4 text-sm">
            {fm.links.demo && (
              <a href={fm.links.demo} target="_blank" rel="noreferrer" className="text-accent underline">
                {`${ui.caseStudy.demo} `}<LinkArrow />
              </a>
            )}
            {fm.links.repo && (
              <a
                href={fm.links.repo}
                target="_blank"
                rel="noreferrer"
                lang={langOf(locale, ui.caseStudy.repo)}
                className="text-accent underline"
              >
                {`${ui.caseStudy.repo} `}<LinkArrow />
              </a>
            )}
            {fm.links.writeup && (
              <a href={fm.links.writeup} target="_blank" rel="noreferrer" className="text-accent underline">
                {`${ui.caseStudy.writeup} `}<LinkArrow />
              </a>
            )}
          </p>
        )}
        <CaseStudyContents
          headings={headings}
          label={ui.caseStudy.contentsLabel}
          lead={ui.caseStudy.contentsLead}
        />
      </header>

      <article className="mt-4">
        <MDXRemote source={body} components={getMdxComponents(locale, headings)} />
      </article>

      <NextNote
        next={{ href: localePath(locale, `/projects/${next.slug}`), title: next.title }}
        allHref={localePath(locale, "/projects")}
        copy={{
          label: ui.caseStudy.moreNotesLabel,
          allProjects: ui.caseStudy.allProjects,
          nextNotePrefix: ui.caseStudy.nextNotePrefix,
        }}
      />
    </main>
  );
}
