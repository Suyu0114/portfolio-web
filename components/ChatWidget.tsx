"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Chat widget entry point — SPEC-CHATBOT §6. Rendered on every page from the
 * root layout.
 *
 * Only the entry button ships in the first-load bundle; the panel and all its
 * streaming logic are imported on first open, so the widget adds no meaningful
 * first-load JS. Both button and panel are `position: fixed`, so neither can
 * contribute to CLS.
 */

const ChatPanel = dynamic(() => import("@/components/ChatPanel"), {
  ssr: false,
});

const COPY = {
  open: "ask my AI notes",
} as const;

/** Hand-drawn speech bubble — ink line work only, no fill, no shadow (§6). */
function SpeechBubble() {
  return (
    <svg
      viewBox="0 0 32 26"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.4 5.2C3 3.6 4.2 2.2 6 2.1c6.6-.5 13.3-.4 20 .1 1.7.1 2.8 1.3 2.7 2.9-.2 3.9-.3 7.7-.1 11.6.1 1.6-1.1 2.9-2.8 3-4 .3-8 .3-12 .2l-6.2 4.4c-.5.4-1.2 0-1.1-.7l.5-3.9c-1.2-.1-2.4-.5-3.2-1.4-.5-.6-.6-1.4-.6-2.2.1-3.6.4-7.2.2-10.9Z" />
    </svg>
  );
}

export default function ChatWidget({
  projectTitles,
}: {
  /** slug -> case study title, for the §6 context-aware first turn. */
  projectTitles: Readonly<Record<string, string>>;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const match = /^\/projects\/([^/]+)$/.exec(pathname ?? "");
  const projectTitle = match ? (projectTitles[match[1]] ?? null) : null;

  // §6 a11y — focus returns to the entry button when the panel closes.
  //
  // The button is unmounted while the panel is open, so it cannot be focused
  // in the close handler itself — the ref is still null at that point. Flag the
  // intent instead and focus once the button has re-rendered. The flag starts
  // false so this never steals focus on first mount.
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!open && restoreFocus.current) {
      restoreFocus.current = false;
      buttonRef.current?.focus();
    }
  }, [open]);

  const close = useCallback(() => {
    restoreFocus.current = true;
    setOpen(false);
  }, []);

  if (open) {
    return <ChatPanel onClose={close} projectTitle={projectTitle} />;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => setOpen(true)}
      // No aria-label: the visible Caveat text is the accessible name. An
      // aria-label that did not contain it would break WCAG 2.5.3 Label in
      // Name, so voice-control users could not say what they can see.
      aria-haspopup="dialog"
      aria-expanded={false}
      // Solid --accent, a frozen token (rule 4). Label is --card rather than
      // --paper: both read as near-white, but card measures 4.79:1 on accent
      // against paper's 4.53:1, and 20px Caveat is normal-size text under
      // WCAG, so it needs the full 4.5:1 rather than the large-text 3:1.
      className="sk-border-a bg-accent text-card fixed right-4 bottom-4 z-50 flex rotate-[-1deg] items-center gap-1.5 px-3 py-1.5 sm:right-6 sm:bottom-6"
    >
      <SpeechBubble />
      {/* Caveat is display-only and never below 20px (CLAUDE.md rule 5). */}
      <span className="font-display text-xl leading-none">{COPY.open}</span>
    </button>
  );
}
