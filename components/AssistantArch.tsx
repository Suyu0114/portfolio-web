import ArchFlow from "@/components/ArchFlow";
import { getVisualsCopy } from "@/lib/caseStudyVisuals";
import type { Locale } from "@/lib/i18n";

// Assistant architecture (SPEC §7.4). Every label is traceable to
// SPEC-CHATBOT.md: the widget is lazy-loaded, the route validates and
// fuses, the system prompt is byte-frozen so it stays cacheable, and the
// refusal line is what the /study analysis matches on. The words are in
// lib/caseStudyVisuals.ts, per locale.
export default function AssistantArch({ locale }: { locale: Locale }) {
  return <ArchFlow {...getVisualsCopy(locale).assistantArch} />;
}
