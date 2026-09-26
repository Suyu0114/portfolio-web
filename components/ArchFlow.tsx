import { Fragment } from "react";
import DoodleArrow from "@/components/DoodleArrow";
import Reveal from "@/components/Reveal";

export type ArchStep = {
  label: string;
  note?: string;
};

type ArchFlowProps = {
  /** Ordered pipeline stages, joined by hand-drawn arrows. */
  steps: readonly ArchStep[];
  /** Cross-cutting note under the flow (cron, pre-registration, etc.). */
  rail?: string;
  /** Handwritten caption beneath the diagram. */
  caption: string;
};

/** Sets the --i step for a .mo-rise-in / .mo-arrow-in element (globals.css). */
const step = (i: number) => ({ "--i": i }) as React.CSSProperties;

// Static hand-drawn architecture flow — SPEC §6.3 "What I built".
// Line work only, tokens only; reuses the shared sketch border + the
// DoodleArrow component rather than hand-rolling new wobble per page.
//
// It fades up once as it scrolls in (Reveal, SPEC §4.4, v1.11), and the
// pipeline builds in order as it does: each stage rises, then the arrow to
// the next one draws.
export default function ArchFlow({ steps, rail, caption }: ArchFlowProps) {
  return (
    <Reveal>
      <figure className="my-8">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {steps.map((s, i) => (
            <Fragment key={s.label}>
              <div
                className="mo-rise-in sk-border-a flex-1 bg-card p-3 text-center"
                style={step(2 * i)}
              >
                <p className="text-[13px] font-medium text-ink">{s.label}</p>
                {s.note && (
                  <p className="mt-1 font-mono text-[11px] text-muted">
                    {s.note}
                  </p>
                )}
              </div>
              {i < steps.length - 1 && (
                <DoodleArrow
                  className="mx-auto rotate-90 sm:rotate-0"
                  draw="reveal"
                  style={step(2 * i + 1)}
                />
              )}
            </Fragment>
          ))}
        </div>
        {rail && <p className="mt-3 text-center text-[13px] text-ink-soft">{rail}</p>}
        <figcaption className="mt-2 font-display text-xl text-muted">
          {caption}
        </figcaption>
      </figure>
    </Reveal>
  );
}
