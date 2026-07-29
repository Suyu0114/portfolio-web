import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

type FigureProps = {
  /** Screenshot path under /public (e.g. "/screens/foo.png"). */
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

// Screenshot in a sketch border with a handwritten caption — SPEC §4.3.
// Fail loud (CLAUDE.md rule 2): next/image does not verify that a public
// file exists, so a missing/renamed screenshot would ship as a broken
// image. This server component checks existence at build time (case
// studies are SSG) and throws, failing the build instead.
export default function Figure({ src, alt, caption, width, height }: FigureProps) {
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    throw new Error(`Figure: missing image "${src}" (looked in public/)`);
  }

  return (
    <figure className="sk-border-b my-8 bg-card p-3">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full"
      />
      <figcaption className="mt-2 font-display text-xl text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
