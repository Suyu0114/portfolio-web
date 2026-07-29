import { Fragment } from "react";
import DoodleArrow from "@/components/DoodleArrow";

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

// Static hand-drawn architecture flow — SPEC §6.3 "What I built".
// Line work only, tokens only; reuses the shared sketch border + the
// DoodleArrow component rather than hand-rolling new wobble per page.
export default function ArchFlow({ steps, rail, caption }: ArchFlowProps) {
  return (
    <figure className="my-8">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {steps.map((step, i) => (
          <Fragment key={step.label}>
            <div className="sk-border-a flex-1 bg-card p-3 text-center">
              <p className="text-[13px] font-medium text-ink">{step.label}</p>
              {step.note && (
                <p className="mt-1 font-mono text-[11px] text-muted">
                  {step.note}
                </p>
              )}
            </div>
            {i < steps.length - 1 && (
              <DoodleArrow className="mx-auto rotate-90 sm:rotate-0" />
            )}
          </Fragment>
        ))}
      </div>
      {rail && <p className="mt-3 text-center text-[13px] text-ink-soft">{rail}</p>}
      <figcaption className="mt-2 font-display text-xl text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
