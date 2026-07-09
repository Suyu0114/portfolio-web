import type { MDXComponents } from "mdx/types";
import Figure from "@/components/Figure";

/**
 * MDX component map — SPEC §8: handwriting h2 headings, code blocks in
 * mono on --card, Figure available inside case study bodies.
 */
export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2 className="mt-10 font-display text-2xl font-medium" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-6 text-[15px] font-semibold text-ink" {...props} />
  ),
  p: (props) => <p className="mt-3" {...props} />,
  ul: (props) => <ul className="mt-3 list-disc pl-5" {...props} />,
  ol: (props) => <ol className="mt-3 list-decimal pl-5" {...props} />,
  a: (props) => <a className="text-accent underline" {...props} />,
  code: (props) => (
    <code className="rounded-sm bg-card px-1 font-mono text-[13px] text-ink" {...props} />
  ),
  pre: (props) => (
    <pre
      className="mt-4 overflow-x-auto rounded-sm border border-rule bg-card p-4 font-mono text-[13px] leading-relaxed"
      {...props}
    />
  ),
  Figure,
};
