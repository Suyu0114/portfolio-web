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
 * from a server component or a route handler.
 */

const SESSION_KEY = "suyu-chat-session";
const THREAD_KEY = "suyu-chat-thread";

/** Mirrors the server-side history truncation in app/api/chat/route.ts (§3). */
const PERSISTED_TURNS = 20;

export type Turn = { role: "user" | "assistant"; content: string };

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
    (turn.role === "user" || turn.role === "assistant") &&
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
 */
export function clearChat(): void {
  sessionStorage.removeItem(THREAD_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  emit();
}
