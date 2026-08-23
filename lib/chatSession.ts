/**
 * Client-side chat session storage — SPEC-CHATBOT §3/§6.
 *
 * Both halves of the widget need these keys: the panel reads and writes the
 * thread, the widget clears them when a visitor ends the conversation. Keeping
 * the keys in one module is what stops the two from disagreeing about where
 * one conversation stops and the next begins — the client thread and the
 * server's `chat_sessions` row now start and end together.
 *
 * Browser-only: every function touches `sessionStorage`. Never import this
 * from a server component or a route handler. The dial's domain (steps,
 * default, validation) lives in `lib/chatPersonality.ts` instead, because the
 * route handler needs it too and must not import this file.
 */

import {
  DEFAULT_CONCISENESS,
  DEFAULT_HUMOR,
  isConcisenessLevel,
  isHumorLevel,
  type ConcisenessLevel,
  type HumorLevel,
} from "@/lib/chatPersonality";

const SESSION_KEY = "suyu-chat-session";
const THREAD_KEY = "suyu-chat-thread";
/** §6 — the two adjustable dials. Honesty has no key: it is a constant. */
const HUMOR_KEY = "suyu-chat-humor";
const CONCISENESS_KEY = "suyu-chat-conciseness";

/**
 * Mirrors the server-side history truncation in app/api/chat/route.ts (§3).
 *
 * Since v2.5 this counts notice markers too, so a visitor who spins the dials
 * a lot keeps slightly less conversation across a reload. Harmless: the server
 * truncates the real messages to its own limit regardless, and markers are
 * filtered out before the post, so this can only ever cost reload history,
 * never context the model sees.
 */
const PERSISTED_TURNS = 20;

/** A real message, the only kind that may be sent to the model. */
export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * §6 (v2.5) — a transcript marker saying a dial changed here. Display only:
 * it is written by the panel, never by a person or the model, and it must be
 * filtered out before the thread is posted. `isChatTurn` below is that filter,
 * written as a type guard so the compiler narrows the array for the caller
 * rather than leaving it to a comment nobody reads.
 */
export type NoticeTurn = { role: "notice"; content: string };

export type Turn = ChatTurn | NoticeTurn;

export function isChatTurn(turn: Turn): turn is ChatTurn {
  return turn.role !== "notice";
}

/**
 * §6 — a dial setting, restored per tab like the thread beside it.
 *
 * Same narrow exception to fail-loud as `readTurns` below: the value is
 * visitor-editable, so a bad one resets to the default and says so rather
 * than throwing and taking the widget down site-wide.
 */
function readLevel<T extends number>(
  key: string,
  name: string,
  guard: (value: unknown) => value is T,
  fallback: T,
): T {
  const raw = sessionStorage.getItem(key);
  if (raw === null) return fallback;

  const parsed = Number(raw);
  if (!guard(parsed)) {
    console.warn(
      `[chat] stored ${name} level was not one of the five steps; using the default.`,
    );
    sessionStorage.removeItem(key);
    return fallback;
  }
  return parsed;
}

function saveLevel(key: string, name: string, level: number): void {
  try {
    sessionStorage.setItem(key, String(level));
  } catch (error) {
    // Same reasoning as saveTurns: losing the preference across a reload is
    // not worth interrupting a conversation over.
    console.warn(`[chat] could not persist the ${name} level:`, error);
  }
}

export function readHumor(): HumorLevel {
  return readLevel(HUMOR_KEY, "humor", isHumorLevel, DEFAULT_HUMOR);
}

export function saveHumor(level: HumorLevel): void {
  saveLevel(HUMOR_KEY, "humor", level);
}

export function readConciseness(): ConcisenessLevel {
  return readLevel(
    CONCISENESS_KEY,
    "conciseness",
    isConcisenessLevel,
    DEFAULT_CONCISENESS,
  );
}

export function saveConciseness(level: ConcisenessLevel): void {
  saveLevel(CONCISENESS_KEY, "conciseness", level);
}

/**
 * Subscription so the entry button can track whether a thread is waiting
 * without a second copy of that state. Storage is the one source of truth:
 * the panel writes it on every turn, the widget reads it through
 * `useSyncExternalStore`, and neither can drift from the other.
 *
 * Same-tab writes only — the `storage` event does not fire in the tab that
 * wrote, and sessionStorage is per-tab anyway, so there is nothing else to
 * listen to.
 */
const listeners = new Set<() => void>();

export function subscribeToThread(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

/** §3 — the client generates the session id and keeps it in sessionStorage. */
export function getSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing !== null) return existing;
  // Must be a v4 UUID: the API validates with zod's strict uuid check.
  const fresh = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, fresh);
  return fresh;
}

function isTurn(value: unknown): value is Turn {
  if (typeof value !== "object" || value === null) return false;
  const turn = value as Record<string, unknown>;
  return (
    (turn.role === "user" ||
      turn.role === "assistant" ||
      turn.role === "notice") &&
    typeof turn.content === "string"
  );
}

/**
 * Restores the thread a visitor minimized or left behind on a reload.
 *
 * A malformed value is recovered from rather than swallowed: this string is
 * visitor-editable and shape-fragile across deploys, so a bad one resets the
 * conversation and says so in the console. That is a deliberate, narrow
 * exception to rule 2 — throwing here would take the widget down on every
 * page of the site for a value the visitor can edit by hand.
 */
export function readTurns(): Turn[] {
  const raw = sessionStorage.getItem(THREAD_KEY);
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn("[chat] stored thread was not valid JSON; starting fresh.");
    clearChat();
    return [];
  }

  if (!Array.isArray(parsed) || !parsed.every(isTurn)) {
    console.warn(
      "[chat] stored thread had an unexpected shape; starting fresh.",
    );
    clearChat();
    return [];
  }

  return parsed;
}

/** True when a minimized conversation is waiting, without parsing it. */
export function hasStoredTurns(): boolean {
  return sessionStorage.getItem(THREAD_KEY) !== null;
}

export function saveTurns(turns: Turn[]): void {
  if (turns.length === 0) {
    sessionStorage.removeItem(THREAD_KEY);
    emit();
    return;
  }
  try {
    sessionStorage.setItem(
      THREAD_KEY,
      JSON.stringify(turns.slice(-PERSISTED_TURNS)),
    );
  } catch (error) {
    // Quota, or a browser configured to block storage. Only survival across a
    // reload is lost, not the live conversation, so this warns instead of
    // interrupting a visitor mid-chat.
    console.warn("[chat] could not persist the thread:", error);
  }
  emit();
}

/**
 * Ends the conversation. Dropping the id as well as the thread is the point:
 * the next message mints a new id, so the server opens a fresh
 * `chat_sessions` row instead of appending to the finished one (§5).
 *
 * The dial keys are deliberately left alone. They are preferences about how a
 * visitor wants to be spoken to, not part of the conversation being ended, so
 * resetting them here would silently undo a setting they chose on purpose.
 */
export function clearChat(): void {
  sessionStorage.removeItem(THREAD_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  emit();
}
