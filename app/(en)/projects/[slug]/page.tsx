import type { Metadata } from "next";
import CaseStudyPage from "@/components/CaseStudyPage";
import { getProjects } from "@/lib/content";
import { caseStudyMetadata } from "@/lib/pageMetadata";

type Params = { params: Promise<{ slug: string }> };

// SSG only — unknown slugs 404 instead of rendering dynamically.
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects("en").map((p) => ({ slug: p.frontmatter.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return caseStudyMetadata("en", (await params).slug);
}

export default async function Page({ params }: Params) {
  return <CaseStudyPage locale="en" slug={(await params).slug} />;
}
