import Anthropic from "@anthropic-ai/sdk";

import type {
  ChatChunk,
  ChatProvider,
  ChatRequest,
  ChatStream,
} from "@/lib/chatProvider";

/**
 * Anthropic adapter — SPEC-CHATBOT §3. The primary provider, unchanged in
 * behaviour from the version that lived inline in `app/api/chat/route.ts`:
 * same model, same effort, same cache breakpoint, same placement of the dial
 * instruction. The only new thing is that its events are translated into the
 * neutral chunk type so a second provider can exist beside it (v2.8).
 */

export const ANTHROPIC_MODEL = "claude-opus-5";

/**
 * §3 — Anthropic's stop reasons, narrowed. `end_turn` and `stop_sequence` are
 * both ordinary completions; `refusal` is the one §3 singles out.
 */
function mapStop(reason: Anthropic.StopReason): ChatChunk {
  if (reason === "refusal") return { type: "stop", reason: "refusal" };
  if (reason === "max_tokens") return { type: "stop", reason: "max_tokens" };
  if (reason === "end_turn" || reason === "stop_sequence") {
    return { type: "stop", reason: "end" };
  }
  return { type: "stop", reason: "other" };
}

/**
 * One raw event to zero or more chunks. Thinking deltas are never forwarded
 * (Opus 5 runs adaptive thinking by default) and only visible text reaches the
 * visitor, exactly as before.
 */
function mapEvent(event: Anthropic.MessageStreamEvent): ChatChunk[] {
  if (
    event.type === "content_block_delta" &&
    event.delta.type === "text_delta"
  ) {
    return event.delta.text.length > 0
      ? [{ type: "text", text: event.delta.text }]
      : [];
  }
  if (event.type === "message_start") {
    const u = event.message.usage;
    return [
      {
        type: "usage",
        usage: {
          inputTokens: u.input_tokens,
          cacheWriteTokens: u.cache_creation_input_tokens ?? 0,
          cacheReadTokens: u.cache_read_input_tokens ?? 0,
        },
      },
    ];
  }
  if (event.type === "message_delta") {
    const chunks: ChatChunk[] = [
      { type: "usage", usage: { outputTokens: event.usage.output_tokens } },
    ];
    if (event.delta.stop_reason !== null) {
      chunks.push(mapStop(event.delta.stop_reason));
    }
    return chunks;
  }
  return [];
}

export function anthropicProvider(apiKey: string): ChatProvider {
  return {
    id: ANTHROPIC_MODEL,
    async start(request: ChatRequest): Promise<ChatStream> {
      const client = new Anthropic({ apiKey });

      // §6 — the dials ride in a mid-conversation system turn rather than in
      // `system`, which is byte-frozen and carries the only cache breakpoint.
      // Folding them into the system prompt would forfeit that cache every
      // request instead. Placement satisfies the API's rules by construction:
      // `conversation` always ends with the visitor's turn, so this follows a
      // user message and is last.
      const messages: Anthropic.MessageParam[] = [
        ...request.conversation.map((entry) => ({
          role: entry.role,
          content: entry.content,
        })),
        { role: "system", content: request.dialInstruction },
      ];

      const stream = client.messages.stream(
        {
          model: ANTHROPIC_MODEL,
          max_tokens: request.maxTokens,
          output_config: { effort: "low" },
          system: [
            {
              type: "text",
              text: request.system,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        },
        { signal: request.signal },
      );

      const iterator = stream[Symbol.asyncIterator]();

      // The pull that makes auth, quota and billing failures throw from
      // `start()` while a status can still be chosen (§3, §7).
      const first = await iterator.next();
      const buffered = first.done ? [] : mapEvent(first.value);

      async function* chunks(): AsyncGenerator<ChatChunk> {
        yield* buffered;
        if (first.done) return;
        while (true) {
          const next = await iterator.next();
          if (next.done) break;
          yield* mapEvent(next.value);
        }
      }

      return {
        chunks: chunks(),
        abort: async () => {
          await stream.abort();
        },
      };
    },
  };
}
