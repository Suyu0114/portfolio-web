import ArchFlow from "@/components/ArchFlow";
import { getVisualsCopy } from "@/lib/caseStudyVisuals";
import type { Locale } from "@/lib/i18n";

// World Cup forecasting architecture. Framing (SPEC §7.1): the model is a
// clearly-labeled experimental layer; de-vigged market odds are the
// benchmark, shown side by side. The words are in lib/caseStudyVisuals.ts,
// per locale.
export default function WorldCupArch({ locale }: { locale: Locale }) {
  return <ArchFlow {...getVisualsCopy(locale).worldCupArch} />;
}
