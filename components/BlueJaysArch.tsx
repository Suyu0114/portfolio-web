import ArchFlow from "@/components/ArchFlow";
import { getVisualsCopy } from "@/lib/caseStudyVisuals";
import type { Locale } from "@/lib/i18n";

// BlueJaysFanWeb architecture — data note (SPEC §7.3): Savant + MLB Stats
// API are the primary self-built sources; FanGraphs CSV is a manual,
// membership-gated side input (not republished on this site). The words
// are in lib/caseStudyVisuals.ts, per locale.
export default function BlueJaysArch({ locale }: { locale: Locale }) {
  return <ArchFlow {...getVisualsCopy(locale).bluejaysArch} />;
}
