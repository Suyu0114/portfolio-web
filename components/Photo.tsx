import Image, { type StaticImageData } from "next/image";

type PhotoProps = {
  /** Static import from /public/photos, so width and height come from the file. */
  image: StaticImageData;
  alt: string;
  sizes: string;
  /** Handwritten line under the photo; omit for a bare portrait. */
  caption?: string;
  /** Optional ±1deg tilt, the same scale as TagPill (SPEC §4.3). */
  rotate?: "none" | "cw" | "ccw";
  border?: "a" | "b";
  /** "preload" only for a measured LCP element (SPEC §6.1). */
  load?: "lazy" | "eager" | "preload";
  /** p-2 instead of p-3, for frames under about 200px wide, where the radius scales down with the box. */
  compact?: boolean;
  className?: string;
};

const ROTATION: Record<NonNullable<PhotoProps["rotate"]>, string> = {
  none: "",
  cw: "rotate-[1deg]",
  ccw: "-rotate-[1deg]",
};

// Personal photo in a sketch frame — SPEC §4.1 and §4.3 (v1.6, P7). Server
// component. The static import gives next/image the intrinsic size at build
// time, so the photo reserves its space (no layout shift), and a missing
// file fails the build rather than shipping a broken image. Line work only:
// no shadow, tape, or texture. p-3 matches Figure: with less padding, the
// wobbly radius (up to 255px on one axis, 15px on the other) crosses the
// photo's corners once the frame is wider than about 270px. Below about
// 200px the browser scales that radius down with the box, so `compact`
// frames can take p-2 and give the photo the space back.
export default function Photo({
  image,
  alt,
  sizes,
  caption,
  rotate = "none",
  border = "a",
  load = "lazy",
  compact = false,
  className = "",
}: PhotoProps) {
  return (
    <figure
      className={`${border === "a" ? "sk-border-a" : "sk-border-b"} bg-card ${compact ? "p-2" : "p-3"} ${ROTATION[rotate]} ${className}`}
    >
      <Image
        src={image}
        alt={alt}
        sizes={sizes}
        preload={load === "preload"}
        loading={load === "preload" ? undefined : load}
        className="h-auto w-full"
      />
      {caption && (
        <figcaption className="mt-2 font-display text-xl text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
