import ArchFlow from "@/components/ArchFlow";

// Assistant architecture (SPEC §7.4). Every label is traceable to
// SPEC-CHATBOT.md: the widget is lazy-loaded, the route validates and
// fuses, the system prompt is byte-frozen so it stays cacheable, and the
// refusal line is what the /study analysis matches on.
export default function AssistantArch() {
  return (
    <ArchFlow
      caption="one model call per turn, and the misses become a to-do list"
      rail="every exchange is logged to Supabase → /study matches the refusal line to find the gaps"
      steps={[
        { label: "chat widget", note: "lazy-loaded · streams deltas" },
        { label: "/api/chat", note: "zod · per-IP and daily fuses" },
        { label: "Claude Opus 5", note: "byte-frozen cached prompt · 1,024 max tokens" },
        { label: "streamed reply", note: "chunked plain text" },
      ]}
    />
  );
}
