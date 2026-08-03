"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Chat panel — SPEC-CHATBOT §6. Loaded only when the widget is opened, so its
 * JS never lands in the first-load bundle.
 *
 * User and bot turns are distinguished by border treatment and alignment
 * (`.sk-border-b` vs `.sk-border-a`), never by a new colour — tokens are frozen
 * (CLAUDE.md rule 4).
 */

/** Widget microcopy — component-level constant (CLAUDE.md conventions). */
const COPY = {
  title: "ask my notes",
  close: "Close the notebook",
  inputLabel: "Ask about Suyu",
  placeholder: "Ask about Suyu…",
  send: "Send",
  thinking: "Looking through the notes",
  /**
   * §5/§6 privacy disclosure. Extended past the spec's one sentence to state
   * the IP hashing, which is a genuine positive worth claiming.
   *
   * It deliberately does NOT say "no personal data is collected". Nothing
   * identifying is *asked for*, and the raw IP is never stored — but the
   * transcript keeps whatever a visitor types, and recruiters routinely type
   * their name, company, and email. Claiming otherwise would be a false
   * privacy promise on a site whose whole argument is epistemic honesty.
   */
  disclosure:
    "Chats are recorded so Suyu can improve these notes. No sign-in, and your IP is only ever stored as a hash — but whatever you type is saved, so please don't share personal details.",
  emptyLead: "Ask me about Suyu's work. A few places to start:",
  /** §6 error states — honest and specific, never a silent retry. */
  errorGeneric: "the notebook hit a snag — try again in a minute",
  errorResting:
    "the notebook is resting — back tomorrow. Email works too: suyu0229@gmail.com",
} as const;

/** Suggested chips — SPEC-CHATBOT §6, confirmed by Suyu 2026-08-02. */
const CHIPS = [
  "What has Suyu built?",
  "Is Suyu authorized to work in Canada?",
  "How does Suyu approach data quality?",
  "What is Suyu looking for?",
] as const;

const PROJECT_CHIP = "Ask about this project";

type Turn = { role: "user" | "assistant"; content: string };

/** §3 — client generates the session id and keeps it in sessionStorage. */
function getSessionId(): string {
  const KEY = "suyu-chat-session";
  const existing = sessionStorage.getItem(KEY);
  if (existing !== null) return existing;
  // Must be a v4 UUID: the API validates with zod's strict uuid check.
  const fresh = crypto.randomUUID();
  sessionStorage.setItem(KEY, fresh);
  return fresh;
}

export default function ChatPanel({
  onClose,
  projectTitle,
}: {
  onClose: () => void;
  /** Title of the case study being read, when on /projects/[slug] (§6). */
  projectTitle: string | null;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // §6 a11y — focus moves into the panel on open; ChatWidget returns it to the
  // entry button on close.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // §6 a11y — Esc closes. Bound to the document, not the panel: the panel is
  // non-modal and does not trap focus, so a visitor who has tabbed back out to
  // the page would otherwise lose the shortcut.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Keep the newest turn in view as tokens stream in.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns, streaming]);

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (message === "" || streaming) return;

      setInput("");
      setError(null);
      setStreaming(true);

      const history = turns;
      setTurns([...history, { role: "user", content: message }]);

      // §6 context awareness — the page context rides in the *user* turn, never
      // in `system`, so the cached prefix stays byte-identical. Only the first
      // turn carries it, and the visitor never sees it.
      const outbound =
        history.length === 0 && projectTitle !== null
          ? `Visitor is currently reading the ${projectTitle} case study.\n\n${message}`
          : message;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getSessionId(),
            message: outbound,
            history,
            // §5 — the page the chat was opened on. The server records it once
            // per session and ignores it on later turns.
            entryPath: window.location.pathname,
          }),
        });

        if (res.status === 429) {
          setError(COPY.errorResting);
          return;
        }
        if (!res.ok || res.body === null) {
          setError(COPY.errorGeneric);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        let started = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          if (!started) {
            started = true;
            setTurns((t) => [...t, { role: "assistant", content: acc }]);
          } else {
            setTurns((t) => {
              const next = [...t];
              next[next.length - 1] = { role: "assistant", content: acc };
              return next;
            });
          }
        }

        if (!started) setError(COPY.errorGeneric);
      } catch {
        // No silent catch, no retry loop — the visitor sees an honest note.
        setError(COPY.errorGeneric);
      } finally {
        setStreaming(false);
      }
    },
    [projectTitle, streaming, turns],
  );

  const chips = projectTitle !== null ? [PROJECT_CHIP, ...CHIPS.slice(1)] : CHIPS;

  return (
    <div
      role="dialog"
      aria-label={COPY.title}
      className="sk-border-a bg-card fixed right-4 bottom-4 z-50 flex w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden sm:right-6 sm:bottom-6"
      style={{ maxHeight: "min(32rem, calc(100dvh - 2rem))" }}
    >
      <div className="border-rule flex items-center justify-between border-b-2 px-3 py-2">
        <h2 className="font-display text-ink text-xl leading-none">
          {COPY.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={COPY.close}
          className="text-ink hover:bg-rule sk-pill px-2 py-0.5 text-xs"
        >
          close
        </button>
      </div>

      <div
        ref={logRef}
        aria-live="polite"
        aria-atomic="false"
        className="flex-1 overflow-y-auto px-3 py-3"
      >
        {turns.length === 0 && (
          <div>
            <p className="text-muted text-xs">{COPY.emptyLead}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => void send(chip)}
                  className="sk-pill text-ink hover:bg-rule px-2 py-0.5 text-left text-xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        <ul className="space-y-2.5">
          {turns.map((turn, i) => (
            <li
              key={i}
              className={turn.role === "user" ? "flex justify-end" : ""}
            >
              <div
                className={`${
                  turn.role === "user" ? "sk-border-b" : "sk-border-a"
                } max-w-[85%] px-2.5 py-1.5 text-xs whitespace-pre-wrap ${
                  turn.role === "user" ? "text-ink-soft" : "text-ink"
                }`}
              >
                {turn.content}
              </div>
            </li>
          ))}
        </ul>

        {streaming && turns.at(-1)?.role === "user" && (
          <p className="text-muted mt-2.5 flex items-center gap-1 text-xs">
            <span className="sr-only">{COPY.thinking}</span>
            <span aria-hidden="true" className="chat-think">
              <span />
              <span />
              <span />
            </span>
          </p>
        )}

        {error !== null && (
          <p className="sk-border-b text-ink mt-2.5 px-2.5 py-1.5 text-xs">
            {error}
          </p>
        )}
      </div>

      <form
        className="border-rule border-t-2 px-3 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          {COPY.inputLabel}
        </label>
        <div className="flex items-end gap-1.5">
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            maxLength={1000}
            placeholder={COPY.placeholder}
            className="text-ink placeholder:text-muted bg-card focus-visible:outline-accent max-h-24 min-h-8 flex-1 resize-none text-xs"
          />
          <button
            type="submit"
            disabled={streaming || input.trim() === ""}
            className="sk-pill text-ink hover:bg-rule px-2 py-0.5 text-xs disabled:opacity-40"
          >
            {COPY.send}
          </button>
        </div>
        <p className="text-muted mt-1.5 text-[0.6875rem] leading-snug">
          {COPY.disclosure}
        </p>
      </form>
    </div>
  );
}
