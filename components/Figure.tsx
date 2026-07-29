import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

type FigureProps = {
  /** Screenshot path under /public (e.g. "/screens/foo.png"). */
  src: string;
  alt: string;
  caption: string;
};

// Reads intrinsic dimensions from a PNG's IHDR chunk (width @ byte 16,
// height @ 20, big-endian). Avoids depending on MDX to pass numeric
// width/height props to next/image, which it does inconsistently between
// dev and build.
function readPngSize(buf: Buffer): { width: number; height: number } | null {
  const isPng =
    buf.length >= 24 &&
    buf.readUInt32BE(0) === 0x89504e47 &&
    buf.readUInt32BE(4) === 0x0d0a1a0a;
  if (!isPng) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// Screenshot in a sketch border with a handwritten caption — SPEC §4.3.
// Server component: resolves and validates the image at build time (case
// studies are SSG). Fail loud (CLAUDE.md rule 2) — a missing or non-PNG
// image throws and fails the build instead of shipping a broken <img>.
export default function Figure({ src, alt, caption }: FigureProps) {
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    throw new Error(`Figure: missing image "${src}" (looked in public/)`);
  }
  const size = readPngSize(fs.readFileSync(filePath));
  if (!size) {
    throw new Error(`Figure: "${src}" is not a readable PNG`);
  }

  return (
    <figure className="sk-border-b my-8 bg-card p-3">
      <Image
        src={src}
        alt={alt}
        width={size.width}
        height={size.height}
        className="h-auto w-full"
      />
      <figcaption className="mt-2 font-display text-xl text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
