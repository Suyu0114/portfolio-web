import ArchFlow from "@/components/ArchFlow";
import { getVisualsCopy } from "@/lib/caseStudyVisuals";
import type { Locale } from "@/lib/i18n";

// Pre-registered study pipeline. The pre-registration (hypotheses.md,
// frozen before any correlation was inspected) gates the whole flow —
// that is the point of the project. The words are in
// lib/caseStudyVisuals.ts, per locale.
export default function StudyArch({ locale }: { locale: Locale }) {
  return <ArchFlow {...getVisualsCopy(locale).studyArch} />;
}
