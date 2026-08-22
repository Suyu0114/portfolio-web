import Anthropic from "@anthropic-ai/sdk";
import { FALLBACK_LINE } from "@/lib/chatbotKnowledge";
import { createChatClient } from "@/lib/chatStore";
import { MissingEnvError, requireChatEnv } from "@/lib/env";

/**
 * On-demand insight generation — SPEC-CHATBOT §8.
 *
 * Covers everything since the last insight, or the last 30 days if there has
 * never been one. If nothing new has arrived it says so rather than spending a
 * model call (fail loud beats burning tokens).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-5";
const LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;
/** Keeps one analysis bounded; the newest exchanges are the ones that matter. */
const MAX_TRANSCRIPT_CHARS = 120_000;

type Row = {
  session_id: string;
  role: string;
  content: string;
  created_at: string;
};

/**
 * D3 — gaps are found by exact-matching the standardized fallback line. Done
 * here in code rather than left to the model, so the gap list is deterministic
 * and cannot be paraphrased away.
 */
function findGaps(rows: Row[]): { question: string; at: string }[] {
  const gaps: { question: string; at: string }[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.role !== "assistant" || !row.content.includes(FALLBACK_LINE)) continue;
    // The visitor turn immediately before it, in the same session.
    for (let j = i - 1; j >= 0; j--) {
      if (rows[j].session_id !== row.session_id) break;
      if (rows[j].role === "user") {
        gaps.push({ question: rows[j].content, at: rows[j].created_at });
        break;
      }
    }
  }
  return gaps;
}

export async function POST(): Promise<Response> {
  let env;
  try {
    env = requireChatEnv();
  } catch (error) {
    if (error instanceof MissingEnvError) {
      console.error("[api/admin/analyze] env misconfigured:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }

  const db = createChatClient(env);

  const { data: previous, error: previousError } = await db
    .from("chat_insights")
    .select("period_end, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (previousError) {
    return Response.json(
      { error: `Could not read previous insights: ${previousError.message}` },
      { status: 500 },
    );
  }

  const periodEnd = new Date();
  const periodStart = new Date(
    previous?.period_end ?? previous?.created_at ?? periodEnd.getTime() - LOOKBACK_MS,
  );

  const { data, error } = await db
    .from("chat_messages")
    .select("session_id, role, content, created_at")
    .gt("created_at", periodStart.toISOString())
    .lte("created_at", periodEnd.toISOString())
    .order("session_id", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    return Response.json(
      { error: `Could not read transcripts: ${error.message}` },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as Row[];
  if (rows.length === 0) {
    // §8 — say so instead of calling the API.
    return Response.json({
      status: "no-new-messages",
      message: `No messages since ${periodStart.toISOString()}. Nothing to analyze, so no model call was made.`,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    });
  }

  const gaps = findGaps(rows);

  let transcript = "";
  let currentSession = "";
  for (const row of rows) {
    if (row.session_id !== currentSession) {
      currentSession = row.session_id;
      transcript += `\n\n--- session ${currentSession} ---\n`;
    }
    transcript += `${row.role}: ${row.content}\n`;
  }
  const truncated = transcript.length > MAX_TRANSCRIPT_CHARS;
  if (truncated) transcript = transcript.slice(-MAX_TRANSCRIPT_CHARS);

  const gapBlock =
    gaps.length === 0
      ? "(none: no reply in this period contained the fallback line)"
      : gaps.map((g) => `- ${g.question.replace(/\n/g, " ")}`).join("\n");

  const prompt = `You are analysing visitor conversations with the chatbot on Suyu Cheng's portfolio site, to help Suyu decide what to add to its notes.

Period: ${periodStart.toISOString()} to ${periodEnd.toISOString()}
Messages: ${rows.length}${truncated ? " (transcript truncated to the most recent exchanges)" : ""}

The following visitor questions were answered with the bot's "not in my notes" fallback line. This list was matched exactly in code, so reproduce it faithfully and do not add to it or drop from it:

${gapBlock}

Full transcript:
${transcript}

Write a markdown report with exactly these four sections, in this order and with these headings:

## Top themes visitors ask about
Group the questions into themes and give a count for each. Order by count.

## Unanswered questions
Quote every question from the pre-matched list above, verbatim. If the list was empty, say so plainly. Do not add questions that were actually answered.

## Notable questions and quotes
Anything surprising, unusually specific, or worth Suyu reading in full.

## Suggested additions to the knowledge pack
Concrete additions, each naming which file it belongs in: profile.md, projects.md, how-i-work.md, interests.md, or faq.md.

Base every statement on the transcript. If the data is too thin to support a section, say that rather than inventing a trend.`;

  let summary: string;
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      output_config: { effort: "high" },
      messages: [{ role: "user", content: prompt }],
    });

    if (message.stop_reason === "refusal") {
      return Response.json(
        { error: "The model declined to produce this analysis." },
        { status: 502 },
      );
    }
    summary = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (summary === "") {
      return Response.json({ error: "The model returned no text." }, { status: 502 });
    }
  } catch (cause) {
    console.error("[api/admin/analyze] model call failed:", cause);
    return Response.json({ error: "The analysis call failed." }, { status: 502 });
  }

  const { error: insertError } = await db.from("chat_insights").insert({
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    summary_md: summary,
    model: MODEL,
  });
  if (insertError) {
    return Response.json(
      { error: `Analysis succeeded but could not be saved: ${insertError.message}` },
      { status: 500 },
    );
  }

  return Response.json({
    status: "created",
    messages: rows.length,
    gaps: gaps.length,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  });
}
