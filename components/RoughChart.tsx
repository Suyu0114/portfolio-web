"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

type RoughChartProps = {
  /** Accessible name for the chart. */
  title: string;
  /** Primary series, values in 0–1, plotted left to right (--accent). */
  series: readonly number[];
  /** Optional comparison series, drawn dashed in --accent-2. */
  compare?: readonly number[];
  /** Fixed pixel size; the box is reserved during SSR so layout never shifts. */
  width?: number;
  height?: number;
};

const PAD = 24;

// Fixed seed keeps the wobble stable across re-renders.
const ROUGH_SEED = 7;

function toPoints(
  values: readonly number[],
  width: number,
  height: number,
): [number, number][] {
  const innerW = width - PAD * 2;
  const innerH = height - PAD * 2;
  return values.map((v, i) => [
    PAD + (i / (values.length - 1)) * innerW,
    PAD + (1 - v) * innerH,
  ]);
}

/**
 * SSR-safe rough.js chart (SPEC.md §4.3). The <svg> renders empty on the
 * server with fixed dimensions (reserved space); the sketchy line work is
 * drawn on the client after mount.
 */
export default function RoughChart({
  title,
  series,
  compare,
  width = 480,
  height = 240,
}: RoughChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const styles = getComputedStyle(document.documentElement);
    const ink = styles.getPropertyValue("--color-ink").trim();
    const accent = styles.getPropertyValue("--color-accent").trim();
    const accent2 = styles.getPropertyValue("--color-accent-2").trim();

    svg.replaceChildren();
    const rc = rough.svg(svg);

    // Axes.
    svg.appendChild(
      rc.line(PAD, height - PAD, width - PAD, height - PAD, {
        stroke: ink,
        strokeWidth: 1.5,
        seed: ROUGH_SEED,
      }),
    );
    svg.appendChild(
      rc.line(PAD, PAD, PAD, height - PAD, {
        stroke: ink,
        strokeWidth: 1.5,
        seed: ROUGH_SEED,
      }),
    );

    svg.appendChild(
      rc.curve(toPoints(series, width, height), {
        stroke: accent,
        strokeWidth: 2,
        roughness: 1.5,
        seed: ROUGH_SEED,
      }),
    );

    if (compare) {
      svg.appendChild(
        rc.curve(toPoints(compare, width, height), {
          stroke: accent2,
          strokeWidth: 2,
          roughness: 1.5,
          strokeLineDash: [6, 6],
          seed: ROUGH_SEED,
        }),
      );
    }
  }, [series, compare, width, height]);

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label={title}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full max-w-full"
      style={{ aspectRatio: `${width} / ${height}` }}
    />
  );
}
