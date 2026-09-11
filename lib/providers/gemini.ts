import {
  FinishReason,
  GoogleGenAI,
  type Content,
  type GenerateContentResponse,
} from "@google/genai";

import type {
  ChatChunk,
  ChatProvider,
  ChatRequest,
  ChatStream,
  StopReason,
} from "@/lib/chatProvider";

/**
 * Gemini adapter — SPEC-CHATBOT §3 "Provider fallback" (v2.8).
 *
 * Reached only when the Anthropic call fails before its reply starts
 * streaming. It is never used while the primary is healthy, so nothing here
 * changes a normal answer.
 *
 * `generateContentStream`, not the Interactions API: the latter keeps
 * conversation state on Google's servers via `previous_interaction_id`, and
 * this chat is stateless by design with its transcript in Supabase (§3, §5).
 * Handing history to a third party to retain would be a storage decision, not
 * a transport one. Verified against the installed SDK, not recalled: §11.8.
 */

export const GEMINI_MODEL = "gemini-3.5-flash-lite";

/**
 * §11.8 — the finish reasons, narrowed to the route's three outcomes.
 *
 * The safety family maps to `refusal`, which earns the standardized §4 line,
 * matching what §3 already does with an Anthropic refusal. Everything
 * unexplained maps to `other`, which earns the truncation note instead: the §4
 * line is what §8 counts to find content gaps, and a provider-side stop is not
 * a gap in the notes.
 */
function mapStop(reason: FinishReason): StopReason {
  switch (reason) {
    case FinishReason.STOP:
      return "end";
    case FinishReason.MAX_TOKENS:
      return "max_tokens";
    case FinishReason.SAFETY:
    case FinishReason.PROHIBITED_CONTENT:
    case FinishReason.BLOCKLIST:
    case FinishReason.SPII:
    case FinishReason.RECITATION:
      return "refusal";
    default:
      return "other";
  }
}

function mapChunk(response: GenerateContentResponse): ChatChunk[] {
  const chunks: ChatChunk[] = [];

  const text = response.text;
  if (text !== undefined && text.length > 0) {
    chunks.push({ type: "text", text });
  }

  const usage = response.usageMetadata;
  if (usage !== undefined) {
    chunks.push({
      type: "usage",
      usage: {
        inputTokens: usage.promptTokenCount ?? 0,
        outputTokens: usage.candidatesTokenCount ?? 0,
        // Gemini is not sent the cached prefix (§3), so these stay zero rather
        // than borrowing a number that would misreport cache performance.
        cacheWriteTokens: 0,
        cacheReadTokens: 0,
      },
    });
  }

  const finish = response.candidates?.[0]?.finishReason;
  if (finish !== undefined) {
    chunks.push({ type: "stop", reason: mapStop(finish) });
  }

  return chunks;
}

export function geminiProvider(apiKey: string): ChatProvider {
  return {
    id: GEMINI_MODEL,
    async start(request: ChatRequest): Promise<ChatStream> {
      const ai = new GoogleGenAI({ apiKey });

      // The abort path the route already relies on: ending the chat cancels the
      // response body, which reaches this adapter and stops the upstream call
      // rather than paying for tokens nobody will read.
      const controller = new AbortController();
      request.signal?.addEventListener("abort", () => controller.abort(), {
        once: true,
      });

      // §3 — the same replayed window, with `assistant` renamed to Gemini's
      // `model` role. The window already ends on the visitor's turn.
      const contents: Content[] = request.conversation.map((entry) => ({
        role: entry.role === "assistant" ? "model" : "user",
        parts: [{ text: entry.content }],
      }));

      // §6 — the dials join the system instruction here rather than riding as
      // their own turn. There is no cached prefix on this path to protect, and
      // Gemini has no mid-conversation system role to put them in. That makes
      // this a prompt-shape difference from the primary, which is why C10
      // re-runs the C6 and C8 criteria against this provider rather than
      // assuming instruction-following transfers.
      const systemInstruction = `${request.system}\n\n${request.dialInstruction}`;

      const stream = await ai.models.generateContentStream({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: request.maxTokens,
          abortSignal: controller.signal,
        },
      });

      const iterator = stream[Symbol.asyncIterator]();

      // Same contract as the primary adapter: pull the first event so an auth
      // or quota failure throws while a status can still be chosen.
      const first = await iterator.next();
      const buffered = first.done ? [] : mapChunk(first.value);

      async function* chunks(): AsyncGenerator<ChatChunk> {
        yield* buffered;
        if (first.done) return;
        while (true) {
          const next = await iterator.next();
          if (next.done) break;
          yield* mapChunk(next.value);
        }
      }

      return {
        chunks: chunks(),
        abort: async () => {
          controller.abort();
        },
      };
    },
  };
}
