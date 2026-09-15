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

import { OPEN_CHAT_SELECTOR } from "@/components/OpenChatButton";
import SpeechBubble from "@/components/SpeechBubble";
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
 * The corner button is not the only way in. Anything matching
 * `OPEN_CHAT_SELECTOR` (the home hero's `OpenChatButton`) opens the same panel
 * through one click listener on the document, which is what lets those
 * triggers stay server-rendered and keeps the first-load claim above true.
 *
 * Hiding and ending are separate actions (§6). Hiding keeps the panel mounted
 * behind `display: none`, so the thread, the draft, and an in-flight reply all
 * survive; ending remounts it through a key bump and clears its storage, which
 * makes the next message open a new session row.
 */

const ChatPanel = dynamic(() => import("@/components/ChatPanel"), {
  ssr: false,
});

/**
 * §6 (v2.4) — the button carries the verb *and* the name, so PATS is
 * discoverable without opening anything. This knowingly reverses C5, which had
 * restored "ask my notes" after the shipped string drifted to "ask my AI
 * notes"; Suyu's call is that the name belongs on the button. Caveat at 20px
 * cannot shrink (rule 5), so the longer label is a layout constraint: it is
 * padding, not type size, that gives way at narrow widths.
 */
const COPY = {
  open: "ask my AI notes - PATS",
  // Tells a visitor their conversation was kept, not thrown away.
  resume: "back to my AI notes - PATS",
} as const;

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
  // Bumped by every open request. The panel moves focus to its input when this
  // changes, so a hero trigger pressed while the panel is already open still
  // puts the visitor in the chat instead of appearing to do nothing.
  const [focusRequest, setFocusRequest] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // The in-page trigger that opened the panel, or null for the corner button.
  const openerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  const match = /^\/projects\/([^/]+)$/.exec(pathname ?? "");
  const projectTitle = match ? (projectTitles[match[1]] ?? null) : null;

  // §6 a11y — focus returns to the control that opened the panel when the
  // panel is dismissed.
  //
  // The corner button is unmounted while the panel is open, so it cannot be
  // focused in the handler itself — the ref is still null at that point. Flag
  // the intent instead and focus once the button has re-rendered. The flag
  // starts false so this never steals focus on first mount.
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!open && restoreFocus.current) {
      restoreFocus.current = false;
      const opener = openerRef.current;
      openerRef.current = null;
      // An in-page trigger only gets focus back while it is still in the
      // document: a client-side navigation since opening will have unmounted
      // it, and the corner button is always there. preventScroll because
      // hiding costs nothing (§6), so a visitor who kept reading while they
      // chatted is not pulled back up to the hero.
      if (opener?.isConnected) {
        opener.focus({ preventScroll: true });
      } else {
        buttonRef.current?.focus();
      }
    }
  }, [open]);

  // Whether a minimized conversation is waiting. Read as an external store
  // rather than mirrored into state: this component is statically imported and
  // does render on the server, so the server snapshot is false and the real
  // value lands right after hydration. The cost is that a reload with a stored
  // thread shows the "ask" label for one frame before the swap.
  const hasThread = useSyncExternalStore(
    subscribeToThread,
    hasStoredTurns,
    () => false,
  );

  const openPanel = useCallback((opener: HTMLElement | null) => {
    openerRef.current = opener;
    setMounted(true);
    setOpen(true);
    setFocusRequest((request) => request + 1);
  }, []);

  // Triggers rendered outside this component. One delegated listener instead
  // of a handler per trigger is what keeps them plain server-rendered HTML.
  // Enter and Space on a button dispatch click as well, so keyboard use
  // arrives here too.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest<HTMLElement>(OPEN_CHAT_SELECTOR);
      if (trigger !== null) openPanel(trigger);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openPanel]);

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
          focusRequest={focusRequest}
          onHide={hide}
          onEnd={end}
          projectTitle={projectTitle}
        />
      )}
      {!open && (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => openPanel(null)}
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
          <span className="font-display text-xl leading-none whitespace-nowrap">
            {hasThread ? COPY.resume : COPY.open}
          </span>
        </button>
      )}
    </>
  );
}
