import Link from "next/link";
import { createChatClient } from "@/lib/chatStore";
import { requireSupabaseEnv } from "@/lib/env";

/**
 * Session list — SPEC-CHATBOT §8. Newest first: started_at, entry page,
 * message count, and the first user question as a preview.
 */

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

type SessionRow = {
  id: string;
  started_at: string;
  entry_path: string | null;
  /** §7 — 'handle' | 'intent' when contact detection fired, else null. */
  signal_kind: string | null;
  /** §5 — set only if the alert email actually left. */
  alerted_at: string | null;
  chat_messages: { role: string; content: string; created_at: string }[];
};

function formatWhen(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export default async function StudyPage() {
  const db = createChatClient(requireSupabaseEnv());

  const { data, error } = await db
    .from("chat_sessions")
    .select(
      "id, started_at, entry_path, signal_kind, alerted_at, chat_messages(role, content, created_at)",
    )
    .order("started_at", { ascending: false })
    .limit(PAGE_SIZE);

  // Fail loud — an empty list and a broken query must not look the same.
  if (error) {
    throw new Error(`Could not load sessions: ${error.message}`);
  }

  // §7 — flagged conversations first. A lead is the reason this page gets
  // opened, so it should not sit four screens down because it arrived on a
  // Tuesday. Sorted here rather than in the query: it is a hundred rows, and
  // ordering on a partial-index column would need a nulls-last clause that
  // says less than this does.
  const sessions = ((data ?? []) as SessionRow[]).sort((a, b) => {
    const flagged =
      Number(b.signal_kind !== null) - Number(a.signal_kind !== null);
    return flagged !== 0 ? flagged : b.started_at.localeCompare(a.started_at);
  });

  if (sessions.length === 0) {
    return <p className="text-muted text-sm">No conversations recorded yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {sessions.map((s) => {
        const messages = s.chat_messages ?? [];
        const firstQuestion = messages
          .filter((m) => m.role === "user")
          .sort((a, b) => a.created_at.localeCompare(b.created_at))[0]?.content;

        return (
          <li key={s.id}>
            <Link
              href={`/study/session/${s.id}`}
              className="sk-border-a bg-card hover:bg-rule block p-3"
            >
              <div className="text-muted flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <span>{formatWhen(s.started_at)}</span>
                <span>{s.entry_path ?? "—"}</span>
                <span>
                  {messages.length} message{messages.length === 1 ? "" : "s"}
                </span>
                {s.signal_kind !== null && (
                  <span className="sk-pill text-ink px-1.5 py-0.5">
                    {s.signal_kind === "handle"
                      ? "contact details"
                      : "says hiring"}
                    {/* Distinguishes flagged from delivered (§5). */}
                    {s.alerted_at === null ? " · not emailed" : ""}
                  </span>
                )}
              </div>
              <p className="text-ink mt-1.5 text-sm">
                {firstQuestion !== undefined
                  ? firstQuestion.length > 140
                    ? `${firstQuestion.slice(0, 140)}…`
                    : firstQuestion
                  : "(no visitor message)"}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
