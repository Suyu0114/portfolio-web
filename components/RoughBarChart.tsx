"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

export type RoughBar = {
  label: string;
  value: number;
};

type RoughBarChartProps = {
  /** Accessible name for the chart. */
  title: string;
  bars: readonly RoughBar[];
  /** Value-axis domain. */
  min: number;
  max: number;
  /** Optional dashed reference line (e.g. a significance threshold). */
  threshold?: number;
  /** Short label drawn next to the threshold line. */
  thresholdLabel?: string;
  /** Suffix appended to printed bar values (e.g. "pp"). */
  unit?: string;
  /** Prefix positive values with "+" (for signed deltas, not p-values). */
  signed?: boolean;
  width?: number;
  height?: number;
};

const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 44;
const ROUGH_SEED = 11;

/**
 * SSR-safe rough.js bar chart (SPEC §4.3 chart system). Renders a fixed
 * empty SVG on the server (reserved space, no layout shift); the sketchy
 * bars are drawn on the client after mount. Handles signed values: bars
 * grow from a zero baseline when 0 is within [min, max], otherwise from
 * the bottom.
 */
export default function RoughBarChart({
  title,
  bars,
  min,
  max,
  threshold,
  thresholdLabel,
  unit = "",
  signed = false,
  width = 520,
  height = 280,
}: RoughBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const styles = getComputedStyle(document.documentElement);
    const ink = styles.getPropertyValue("--color-ink").trim();
    const inkSoft = styles.getPropertyValue("--color-ink-soft").trim();
    const accent = styles.getPropertyValue("--color-accent").trim();
    const accent2 = styles.getPropertyValue("--color-accent-2").trim();

    const innerW = width - PAD_L - PAD_R;
    const innerH = height - PAD_T - PAD_B;
    const yOf = (v: number) =>
      PAD_T + innerH * (1 - (v - min) / (max - min));
    const baseline = min <= 0 && max >= 0 ? yOf(0) : PAD_T + innerH;

    svg.replaceChildren();
    const rc = rough.svg(svg);

    // Baseline / zero axis.
    svg.appendChild(
      rc.line(PAD_L, baseline, width - PAD_R, baseline, {
        stroke: ink,
        strokeWidth: 1.5,
        seed: ROUGH_SEED,
      }),
    );

    const svgNS = "http://www.w3.org/2000/svg";
    const slot = innerW / bars.length;
    const barW = Math.min(52, slot * 0.55);

    bars.forEach((bar, i) => {
      const cx = PAD_L + slot * (i + 0.5);
      const yv = yOf(bar.value);
      const top = Math.min(yv, baseline);
      const h = Math.abs(yv - baseline);
      const fill = bar.value >= 0 ? accent : accent2;

      if (h > 0.5) {
        svg.appendChild(
          rc.rectangle(cx - barW / 2, top, barW, h, {
            stroke: ink,
            strokeWidth: 1.5,
            fill,
            fillStyle: "hachure",
            hachureGap: 4,
            roughness: 1.4,
            seed: ROUGH_SEED + i,
          }),
        );
      }

      // Category label.
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", String(cx));
      label.setAttribute("y", String(height - PAD_B + 16));
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "11");
      label.setAttribute("fill", inkSoft);
      label.textContent = bar.label;
      svg.appendChild(label);

      // Value readout.
      const val = document.createElementNS(svgNS, "text");
      val.setAttribute("x", String(cx));
      val.setAttribute("y", String(bar.value >= 0 ? top - 6 : top + h + 14));
      val.setAttribute("text-anchor", "middle");
      val.setAttribute("font-size", "11");
      val.setAttribute("fill", ink);
      val.textContent = `${signed && bar.value > 0 ? "+" : ""}${bar.value}${unit}`;
      svg.appendChild(val);
    });

    if (threshold !== undefined) {
      const ty = yOf(threshold);
      svg.appendChild(
        rc.line(PAD_L, ty, width - PAD_R, ty, {
          stroke: accent2,
          strokeWidth: 2,
          strokeLineDash: [6, 6],
          seed: ROUGH_SEED,
        }),
      );
      if (thresholdLabel) {
        const t = document.createElementNS(svgNS, "text");
        t.setAttribute("x", String(width - PAD_R));
        t.setAttribute("y", String(ty - 5));
        t.setAttribute("text-anchor", "end");
        t.setAttribute("font-size", "11");
        t.setAttribute("fill", accent2);
        t.textContent = thresholdLabel;
        svg.appendChild(t);
      }
    }
  }, [bars, min, max, threshold, thresholdLabel, unit, signed, width, height]);

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
