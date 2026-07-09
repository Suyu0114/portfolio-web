import Image from "next/image";

type FigureProps = {
  /** Screenshot path under /public/screens/ (CLAUDE.md conventions). */
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

// Screenshot in a sketch border with a handwritten caption — SPEC §4.3.
export default function Figure({ src, alt, caption, width, height }: FigureProps) {
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
