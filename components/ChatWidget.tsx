"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  clearChat,
  hasStoredTurns,
  subscribeToThread,
} from "@/lib/chatSession";

/**
 * Chat widget entry point — SPEC-CHATBOT §6. Rendered on every page from the
 * root layout.
 *
 * Only the entry button ships in the first-load bundle; the panel and all its
 * streaming logic are imported on first open, so the widget adds no meaningful
 * first-load JS. Both button and panel are `position: fixed`, so neither can
 * contribute to CLS.
 *
 * Hiding and ending are separate actions (§6). Hiding keeps the panel mounted
 * behind `display: none`, so the thread, the draft, and an in-flight reply all
 * survive; ending remounts it through a key bump and clears its storage, which
 * makes the next message open a new session row.
 */

const ChatPanel = dynamic(() => import("@/components/ChatPanel"), {
  ssr: false,
});

const COPY = {
  open: "ask my notes",
  // Tells a visitor their conversation was kept, not thrown away.
  resume: "back to my notes",
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
  // Set on first open and never unset: the panel stays mounted from then on so
  // minimizing keeps its state. The dynamic chunk is still only fetched here.
  const [mounted, setMounted] = useState(false);
  // Bumping this remounts the panel, which is how ending a chat resets it.
  const [threadKey, setThreadKey] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const match = /^\/projects\/([^/]+)$/.exec(pathname ?? "");
  const projectTitle = match ? (projectTitles[match[1]] ?? null) : null;

  // §6 a11y — focus returns to the entry button when the panel is dismissed.
  //
  // The button is unmounted while the panel is open, so it cannot be focused
  // in the handler itself — the ref is still null at that point. Flag the
  // intent instead and focus once the button has re-rendered. The flag starts
  // false so this never steals focus on first mount.
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!open && restoreFocus.current) {
      restoreFocus.current = false;
      buttonRef.current?.focus();
    }
  }, [open]);

  // Whether a minimized conversation is waiting. Read as an external store
  // rather than mirrored into state: this component is statically imported and
  // does render on the server, so the server snapshot is false and the real
  // value lands right after hydration. The cost is that a reload with a stored
  // thread shows "ask my AI notes" for one frame before the swap.
  const hasThread = useSyncExternalStore(
    subscribeToThread,
    hasStoredTurns,
    () => false,
  );

  const hide = useCallback(() => {
    restoreFocus.current = true;
    setOpen(false);
  }, []);

  const end = useCallback(() => {
    // Clear before the remount: the fresh panel reads this storage as it
    // mounts, and the dropped session id is what starts a new server session.
    clearChat();
    setThreadKey((key) => key + 1);
    restoreFocus.current = true;
    setOpen(false);
  }, []);

  return (
    <>
      {mounted && (
        <ChatPanel
          key={threadKey}
          open={open}
          onHide={hide}
          onEnd={end}
          projectTitle={projectTitle}
        />
      )}
      {!open && (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            setMounted(true);
            setOpen(true);
          }}
          // No aria-label: the visible Caveat text is the accessible name. An
          // aria-label that did not contain it would break WCAG 2.5.3 Label in
          // Name, so voice-control users could not say what they can see.
          aria-haspopup="dialog"
          aria-expanded={open}
          // Solid --accent, a frozen token (rule 4). Label is --card rather
          // than --paper: both read as near-white, but card measures 4.79:1 on
          // accent against paper's 4.53:1, and 20px Caveat is normal-size text
          // under WCAG, so it needs the full 4.5:1 rather than large-text 3:1.
          className="sk-border-a bg-accent text-card fixed right-4 bottom-4 z-50 flex rotate-[-1deg] items-center gap-1.5 px-3 py-1.5 sm:right-6 sm:bottom-6"
        >
          <SpeechBubble />
          {/* Caveat is display-only and never below 20px (CLAUDE.md rule 5). */}
          <span className="font-display text-xl leading-none">
            {hasThread ? COPY.resume : COPY.open}
          </span>
        </button>
      )}
    </>
  );
}
