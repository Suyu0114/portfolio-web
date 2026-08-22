import Link from "next/link";
import { notFound } from "next/navigation";
import { createChatClient } from "@/lib/chatStore";
import { requireSupabaseEnv } from "@/lib/env";

/** Full transcript for one session — SPEC-CHATBOT §8. */

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function SessionPage({ params }: Params) {
  const { id } = await params;
  const db = createChatClient(requireSupabaseEnv());

  const [{ data: session, error: sessionError }, { data: messages, error: messagesError }] =
    await Promise.all([
      db
        .from("chat_sessions")
        .select("id, started_at, entry_path, referrer, ip_hash")
        .eq("id", id)
        .maybeSingle(),
      db
        .from("chat_messages")
        .select(
          "id, role, content, created_at, model, input_tokens, output_tokens, humor",
        )
        .eq("session_id", id)
        .order("created_at", { ascending: true }),
    ]);

  if (sessionError) {
    throw new Error(`Could not load session: ${sessionError.message}`);
  }
  if (messagesError) {
    throw new Error(`Could not load transcript: ${messagesError.message}`);
  }
  if (session === null) {
    notFound();
  }

  const totalOut = (messages ?? []).reduce(
    (sum, m) => sum + (m.output_tokens ?? 0),
    0,
  );

  return (
    <div>
      <Link href="/study" className="text-ink text-xs underline underline-offset-4">
        ← all sessions
      </Link>

      <dl className="text-muted mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt>started</dt>
        <dd>{new Date(session.started_at).toISOString()}</dd>
        <dt>entry page</dt>
        <dd>{session.entry_path ?? "—"}</dd>
        <dt>referrer</dt>
        <dd className="break-all">{session.referrer ?? "—"}</dd>
        <dt>ip hash</dt>
        {/* The hash exists only for rate limiting; the raw IP is never stored. */}
        <dd className="break-all">{session.ip_hash ?? "—"}</dd>
        <dt>output tokens</dt>
        <dd>{totalOut}</dd>
      </dl>

      <ul className="mt-6 space-y-2.5">
        {(messages ?? []).map((m) => (
          <li key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
            <div
              className={`${
                m.role === "user" ? "sk-border-b" : "sk-border-a"
              } max-w-[85%] px-3 py-2`}
            >
              <p className="text-muted text-[0.6875rem]">
                {m.role}
                {m.output_tokens !== null ? ` · ${m.output_tokens} out` : ""}
                {/* §6 — which dial setting produced this reply. */}
                {m.humor !== null ? ` · humor ${m.humor}` : ""}
              </p>
              <p className="text-ink mt-1 text-sm whitespace-pre-wrap">
                {m.content}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
