"use client";

import { inView } from "motion";
import { animate } from "motion/mini";
import { useEffect, useRef } from "react";
import rough from "roughjs";
import { CHART } from "@/lib/motion";

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

/** A line hidden to the left of its own box, ready to wipe on. */
const WIPE_FROM = "inset(0 100% 0 0)";
const WIPE_TO = "inset(0 0% 0 0)";

/**
 * SSR-safe rough.js bar chart (SPEC §4.3 chart system). Renders a fixed
 * empty SVG on the server (reserved space, no layout shift); the sketchy
 * bars are drawn on the client after mount. Handles signed values: bars
 * grow from a zero baseline when 0 is within [min, max], otherwise from
 * the bottom.
 *
 * Entrance (SPEC §4.4, v1.11): once 30% of the chart is in view, or at once
 * if it already is, the baseline draws, the bars grow from it in turn, each
 * value fades in halfway through its bar, and the threshold line draws
 * last. Values are printed as they are and never count up. The pieces are
 * hidden in the same task that draws them, so they never paint complete
 * first; with reduced motion they are simply drawn complete, as before.
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
    const axis = rc.line(PAD_L, baseline, width - PAD_R, baseline, {
      stroke: ink,
      strokeWidth: 1.5,
      seed: ROUGH_SEED,
    });
    svg.appendChild(axis);

    const svgNS = "http://www.w3.org/2000/svg";
    const slot = innerW / bars.length;
    const barW = Math.min(52, slot * 0.55);
    const labels: SVGTextElement[] = [];
    const drawn: { rect: SVGGElement | null; value: SVGTextElement }[] = [];

    bars.forEach((bar, i) => {
      const cx = PAD_L + slot * (i + 0.5);
      const yv = yOf(bar.value);
      const top = Math.min(yv, baseline);
      const h = Math.abs(yv - baseline);
      const fill = bar.value >= 0 ? accent : accent2;

      let rect: SVGGElement | null = null;
      if (h > 0.5) {
        rect = rc.rectangle(cx - barW / 2, top, barW, h, {
          stroke: ink,
          strokeWidth: 1.5,
          fill,
          fillStyle: "hachure",
          hachureGap: 4,
          roughness: 1.4,
          seed: ROUGH_SEED + i,
        });
        // Grows out of the baseline, up for a positive value, down for a
        // negative one.
        rect.style.transformBox = "view-box";
        rect.style.transformOrigin = `${cx}px ${baseline}px`;
        svg.appendChild(rect);
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
      labels.push(label);

      // Value readout.
      const val = document.createElementNS(svgNS, "text");
      val.setAttribute("x", String(cx));
      val.setAttribute("y", String(bar.value >= 0 ? top - 6 : top + h + 14));
      val.setAttribute("text-anchor", "middle");
      val.setAttribute("font-size", "11");
      val.setAttribute("fill", ink);
      val.textContent = `${signed && bar.value > 0 ? "+" : ""}${bar.value}${unit}`;
      svg.appendChild(val);
      drawn.push({ rect, value: val });
    });

    const thresholdParts: SVGElement[] = [];
    if (threshold !== undefined) {
      const ty = yOf(threshold);
      const line = rc.line(PAD_L, ty, width - PAD_R, ty, {
        stroke: accent2,
        strokeWidth: 2,
        strokeLineDash: [6, 6],
        seed: ROUGH_SEED,
      });
      svg.appendChild(line);
      thresholdParts.push(line);
      if (thresholdLabel) {
        const t = document.createElementNS(svgNS, "text");
        t.setAttribute("x", String(width - PAD_R));
        t.setAttribute("y", String(ty - 5));
        t.setAttribute("text-anchor", "end");
        t.setAttribute("font-size", "11");
        t.setAttribute("fill", accent2);
        t.textContent = thresholdLabel;
        svg.appendChild(t);
        thresholdParts.push(t);
      }
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Hide every piece before the browser paints them.
    axis.style.clipPath = WIPE_FROM;
    for (const el of labels) el.style.opacity = "0";
    for (const { rect, value } of drawn) {
      if (rect) rect.style.transform = "scaleY(0)";
      value.style.opacity = "0";
    }
    for (const el of thresholdParts) el.style.clipPath = WIPE_FROM;

    // Plays once, then hands every piece back to its plain style.
    const play = () => {
      const runs = [
        animate(axis, { clipPath: [WIPE_FROM, WIPE_TO] }, { duration: CHART.draw, ease: CHART.drawEase }),
        ...labels.map((el) =>
          animate(el, { opacity: [0, 1] }, { duration: CHART.fade, ease: CHART.ease }),
        ),
        ...drawn.flatMap(({ rect, value }, i) => {
          const at = CHART.barsAt + i * CHART.stagger;
          return [
            ...(rect
              ? [animate(rect, { transform: ["scaleY(0)", "scaleY(1)"] }, { duration: CHART.grow, ease: CHART.ease, delay: at })]
              : []),
            animate(value, { opacity: [0, 1] }, { duration: CHART.fade, ease: CHART.ease, delay: at + CHART.valueLag }),
          ];
        }),
        ...thresholdParts.map((el) =>
          animate(el, { clipPath: [WIPE_FROM, WIPE_TO] }, {
            duration: CHART.draw,
            ease: CHART.drawEase,
            delay: CHART.barsAt + drawn.length * CHART.stagger + CHART.valueLag,
          }),
        ),
      ];
      Promise.all(runs.map((r) => r.finished)).then(() => {
        for (const el of [axis, ...labels, ...thresholdParts]) {
          el.style.removeProperty("clip-path");
          el.style.removeProperty("opacity");
        }
        for (const { rect, value } of drawn) {
          rect?.style.removeProperty("transform");
          value.style.removeProperty("opacity");
        }
      });
    };

    const stop = inView(
      svg,
      () => {
        stop();
        play();
      },
      { amount: 0.3 },
    );
    return stop;
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
