import AnalyzeButton from "@/components/AnalyzeButton";
import { createChatClient } from "@/lib/chatStore";
import { requireSupabaseEnv } from "@/lib/env";

/** Stored insight reports and the Analyze trigger — SPEC-CHATBOT §8. */

export const dynamic = "force-dynamic";

/**
 * Minimal, safe rendering of the model's markdown: headings, list items and
 * paragraphs only, built from React elements.
 *
 * Deliberately not MDX. MDX evaluates JSX and expressions, and this text comes
 * from a model — compiling it would turn a report into an execution surface for
 * no benefit. Anything unrecognised renders as plain text.
 */
function renderReport(markdown: string) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key} className="text-ink-soft my-2 list-disc space-y-1 pl-5 text-sm">
        {list.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  markdown.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trimEnd();
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);

    if (heading) {
      flushList(`l${i}`);
      blocks.push(
        <h3 key={i} className="text-ink mt-5 mb-1 text-sm font-bold">
          {heading[2]}
        </h3>,
      );
    } else if (bullet) {
      list.push(bullet[1]);
    } else if (line.trim() === "") {
      flushList(`l${i}`);
    } else {
      flushList(`l${i}`);
      blocks.push(
        <p key={i} className="text-ink-soft my-1.5 text-sm">
          {line}
        </p>,
      );
    }
  });
  flushList("l-end");

  return blocks;
}

export default async function InsightsPage() {
  const db = createChatClient(requireSupabaseEnv());

  const { data, error } = await db
    .from("chat_insights")
    .select("id, created_at, period_start, period_end, summary_md, model")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Could not load insights: ${error.message}`);
  }

  const insights = data ?? [];

  return (
    <div>
      <div className="sk-border-a bg-card p-4">
        <p className="text-ink text-sm">
          Generate a report on what visitors have been asking since the last
          run.
        </p>
        <p className="text-muted mt-1 text-xs">
          On demand only. Unanswered questions are matched exactly on the
          fallback line, so they are a real content-gap list.
        </p>
        <div className="mt-3">
          <AnalyzeButton />
        </div>
      </div>

      {insights.length === 0 ? (
        <p className="text-muted mt-6 text-sm">No reports yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {insights.map((insight) => (
            <li key={insight.id} className="sk-border-a bg-card p-4">
              <p className="text-muted text-xs">
                {new Date(insight.created_at).toISOString().slice(0, 16).replace("T", " ")} UTC
                {" · covers "}
                {insight.period_start !== null
                  ? new Date(insight.period_start).toISOString().slice(0, 10)
                  : "—"}
                {" → "}
                {insight.period_end !== null
                  ? new Date(insight.period_end).toISOString().slice(0, 10)
                  : "—"}
                {insight.model !== null ? ` · ${insight.model}` : ""}
              </p>
              <div className="mt-2">{renderReport(insight.summary_md ?? "")}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
