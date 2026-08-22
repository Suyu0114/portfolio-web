"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  HONESTY,
  HUMOR_LEVELS,
  type HumorLevel,
} from "@/lib/chatPersonality";
import {
  getSessionId,
  readHumor,
  readTurns,
  saveHumor,
  saveTurns,
  type Turn,
} from "@/lib/chatSession";

/**
 * Chat panel — SPEC-CHATBOT §6. Loaded only when the widget is opened, so its
 * JS never lands in the first-load bundle.
 *
 * User and bot turns are distinguished by border treatment and alignment
 * (`.sk-border-b` vs `.sk-border-a`), never by a new colour — tokens are frozen
 * (CLAUDE.md rule 4).
 *
 * Once opened, the panel stays mounted and hides itself with `display: none`
 * while minimized (§6): that is what keeps the thread, the draft input, and an
 * in-flight reply alive. Ending the conversation unmounts it instead, so the
 * reset path is the mount path.
 */

/** Widget microcopy — component-level constant (CLAUDE.md conventions). */
const COPY = {
  /**
   * The panel introduces the assistant; the entry button stays the call to
   * action. A visitor scanning the page wants the verb ("ask my notes"), and
   * a visitor who has already opened the panel wants to know who is
   * answering. Splitting the two is why the header no longer echoes the
   * button.
   */
  title: "STET",
  /** Name and purpose together, so the dialog announces both at once. */
  dialogLabel: "STET, ask my notes",
  /**
   * Two dismiss actions, deliberately unequal (§6). Hiding is the reflex
   * action and costs nothing; ending is the one that throws the conversation
   * away, so it sits down in the footer rather than under the same thumb.
   *
   * Both aria-labels contain their visible word, so voice-control users can
   * say what they see (WCAG 2.5.3 Label in Name).
   */
  hide: "hide",
  hideLabel: "Hide the notebook",
  end: "end chat",
  endLabel: "End chat and clear this conversation",
  settings: "settings",
  honesty: "honesty",
  humor: "humor",
  honestyLocked: "locked",
  /**
   * The sighted joke is a dial that will not turn. A screen reader gets the
   * same fact as a sentence, which is faster than making someone arrow across
   * five inert steps to discover it.
   */
  honestyNote: "Honesty is fixed at 100 percent and cannot be changed.",
  humorLabel: "Humor level, percent",
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
   *
   * v2.3 widened "improve these notes" to "read them and improve these
   * notes". Contact details now trigger a notification, and a purpose clause
   * that only mentions improving the notes would not have covered that. Same
   * sentence, still one line, no new promise.
   */
  disclosure:
    "Chats are recorded so Suyu can read them and improve these notes.",
  emptyLead: "Ask me about Suyu's work. A few places to start:",
  /**
   * §6 error states: honest and specific, never a silent retry. Reworded off
   * the spec's em dashes; nothing matches on these strings (unlike the frozen
   * fallback line, which §8 counts), so they are safe to phrase differently.
   */
  errorGeneric: "the notebook hit a snag. Try again in a minute.",
  errorResting:
    "the notebook is resting, back tomorrow. Email works too: suyu0229@gmail.com",
} as const;

/** Suggested chips — SPEC-CHATBOT §6, confirmed by Suyu 2026-08-02. */
const CHIPS = [
  "What has Suyu built?",
  "Is Suyu authorized to work in Canada?",
  "How does Suyu approach data quality?",
  "What is Suyu looking for?",
] as const;

const PROJECT_CHIP = "Ask about this project";

/**
 * The humor dial: a real radiogroup, with roving tabindex and arrow keys so
 * it behaves the way a keyboard user expects a group of options to behave.
 */
function HumorDial({
  value,
  onChange,
}: {
  value: HumorLevel;
  onChange: (next: HumorLevel) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(from: number, delta: number) {
    const next = (from + delta + HUMOR_LEVELS.length) % HUMOR_LEVELS.length;
    onChange(HUMOR_LEVELS[next]);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={COPY.humorLabel} className="flex gap-1">
      {HUMOR_LEVELS.map((level, i) => {
        const selected = level === value;
        return (
          <button
            key={level}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            // Roving tabindex: one stop for the group, then arrows within it.
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(level)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(i, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(i, -1);
              }
            }}
            className={`sk-pill px-1.5 py-0.5 text-[0.6875rem] ${
              selected ? "bg-ink text-card" : "text-ink hover:bg-rule"
            }`}
          >
            {level}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The honesty dial, which is not a dial. Drawn to match the humor row step
 * for step so the difference reads at a glance, but marked up as a readout:
 * five disabled radios would announce an interaction that does not exist.
 * The steps are the same five as humor because it is the same scale, not
 * because anything here can be set.
 */
function HonestyDial() {
  return (
    <div className="flex items-center gap-1">
      <p className="sr-only">{COPY.honestyNote}</p>
      {HUMOR_LEVELS.map((level) => (
        <span
          key={level}
          aria-hidden="true"
          className={`sk-pill px-1.5 py-0.5 text-[0.6875rem] ${
            level === HONESTY ? "bg-ink text-card" : "text-muted opacity-40"
          }`}
        >
          {level}
        </span>
      ))}
      <span aria-hidden="true" className="text-muted ml-1 text-[0.6875rem]">
        {COPY.honestyLocked}
      </span>
    </div>
  );
}

export default function ChatPanel({
  open,
  onHide,
  onEnd,
  projectTitle,
}: {
  /** False while minimized: the panel stays mounted but display: none (§6). */
  open: boolean;
  onHide: () => void;
  onEnd: () => void;
  /** Title of the case study being read, when on /projects/[slug] (§6). */
  projectTitle: string | null;
}) {
  // Restoring in the initializer is safe because the panel is `ssr: false`, so
  // it only ever renders on the client — no hydration mismatch to avoid here.
  const [turns, setTurns] = useState<Turn[]>(() => readTurns());
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [humor, setHumor] = useState<HumorLevel>(() => readHumor());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // §6 — the thread survives a reload, not just a minimize, so the visible
  // conversation and the logged one stay the same conversation. This write is
  // also what tells the entry button a conversation is waiting.
  useEffect(() => {
    saveTurns(turns);
  }, [turns]);

  // §6 — the dial is a preference, so it outlives the conversation it was
  // set during. `clearChat` deliberately leaves this key alone.
  useEffect(() => {
    saveHumor(humor);
  }, [humor]);

  // Ending the conversation unmounts the panel; drop the in-flight reply with
  // it rather than paying for tokens nobody will read. Cancelling the body
  // reaches the route's cancel() hook, which aborts the Anthropic stream.
  // Minimizing deliberately does not abort — the panel stays mounted.
  useEffect(() => () => abortRef.current?.abort(), []);

  // §6 a11y — focus moves into the panel on open; ChatWidget returns it to the
  // entry button when the panel is hidden or ended.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  // §6 a11y — Esc minimizes. Bound to the document, not the panel: the panel is
  // non-modal and does not trap focus, so a visitor who has tabbed back out to
  // the page would otherwise lose the shortcut. Only while visible, so a
  // minimized panel does not swallow Esc from the rest of the page.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onHide();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onHide]);

  // Keep the newest turn in view as tokens stream in. `open` is a dependency
  // because scrollHeight is 0 while the panel is display: none — without it a
  // restored thread would reopen scrolled to the top.
  useEffect(() => {
    if (!open) return;
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns, streaming, open]);

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

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getSessionId(),
            message: outbound,
            history,
            // §5 — the page the chat was opened on. The server records it once
            // per session and ignores it on later turns.
            entryPath: window.location.pathname,
            // §6 — sent per turn, so changing the dial mid-conversation takes
            // effect on the next reply rather than the next session.
            humor,
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
      } catch (err) {
        // An abort is the visitor ending the chat, not a failure — showing an
        // error note for it would be dishonest in the other direction.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // No silent catch, no retry loop — the visitor sees an honest note.
        setError(COPY.errorGeneric);
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setStreaming(false);
      }
    },
    [humor, projectTitle, streaming, turns],
  );

  const chips = projectTitle !== null ? [PROJECT_CHIP, ...CHIPS.slice(1)] : CHIPS;

  return (
    <div
      role="dialog"
      aria-label={COPY.dialogLabel}
      // sk-edge-accent-2 recolours the shared frame to --accent-2 so the panel
      // separates from the near-identical --paper page behind it (card and
      // paper differ by very little on their own).
      //
      // Exactly one display utility is emitted. Shipping `flex` and `hidden`
      // together would be an equal-specificity coin flip, and the `hidden`
      // *attribute* would lose to `.flex` outright (UA sheet vs author rule).
      // display: none also takes the minimized panel out of the a11y tree.
      className={`${open ? "flex" : "hidden"} sk-border-a sk-edge-accent-2 bg-card fixed right-4 bottom-4 z-50 w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden sm:right-6 sm:bottom-6`}
      // A fixed height, not just a cap: with max-height the panel collapsed to
      // fit the chips on an empty thread and then jumped taller on the first
      // reply. The calc keeps it inside short viewports.
      style={{ height: "min(36rem, calc(100dvh - 2rem))" }}
    >
      {/* Solid --accent bar, matching the entry button it replaces on open.
          Both the title and the close label are --card: --ink measures only
          3.07:1 on accent and would fail. */}
      <div className="bg-accent flex items-center justify-between px-3 py-2">
        {/* Inline colour, not a text-* utility: the unlayered
            `h1,h2,h3,h4 { color: ink }` rule in globals.css outranks Tailwind's
            layered utilities, so text-card would silently do nothing here. */}
        <h2
          className="font-display text-xl leading-none"
          style={{ color: "var(--color-card)" }}
        >
          {COPY.title}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-expanded={settingsOpen}
            aria-controls="chat-settings"
            className="sk-pill text-card px-2 py-0.5 text-xs"
          >
            {COPY.settings}
          </button>
          <button
            type="button"
            onClick={onHide}
            aria-label={COPY.hideLabel}
            className="sk-pill text-card px-2 py-0.5 text-xs"
          >
            {COPY.hide}
          </button>
        </div>
      </div>

      {/*
        Always rendered, shown with a single display utility, for the same
        reason the panel itself is: emitting both `block` and `hidden` would be
        an equal-specificity coin flip. Keeping it mounted also means
        aria-controls always points at something real, and display: none takes
        the collapsed strip out of the a11y tree.
      */}
      <div
        id="chat-settings"
        className={`${settingsOpen ? "block" : "hidden"} border-rule bg-card border-b-2 px-3 py-2`}
      >
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1">
          <span className="text-muted text-[0.6875rem]">{COPY.honesty}</span>
          <HonestyDial />
          <span className="text-muted text-[0.6875rem]">{COPY.humor}</span>
          <HumorDial value={humor} onChange={setHumor} />
        </div>
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
        <div className="mt-1.5 flex items-start justify-between gap-2">
          <p className="text-muted text-[0.6875rem] leading-snug">
            {COPY.disclosure}
          </p>
          {/* Only rendered once there is a conversation to end, so an empty
              thread offers one dismiss action rather than two. Sized like the
              panel's other pills, but --muted rather than --ink so it does not
              compete with Send; muted on card still passes 4.5:1 per §6. */}
          {turns.length > 0 && (
            <button
              type="button"
              onClick={onEnd}
              aria-label={COPY.endLabel}
              className="sk-pill text-muted hover:bg-rule shrink-0 px-2 py-0.5 text-xs"
            >
              {COPY.end}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
