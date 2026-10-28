import ContactLinks from "./ContactLinks";
import type { Locale } from "@/lib/i18n";
import { getSiteCopy } from "@/lib/siteContent";

export default function Footer({ locale }: { locale: Locale }) {
  const { footer } = getSiteCopy(locale);
  return (
    <footer className="mx-auto mt-16 w-full max-w-5xl border-t border-rule px-6 py-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
        {/* These links sit in a --muted paragraph and are --muted themselves,
            so color alone distinguishes nothing (1:1). The resting underline
            is what satisfies axe link-in-text-block; the color stays --muted
            per SPEC §4.1 ("captions, nav links, meta"). */}
        <p className="text-sm text-muted">
          <ContactLinks linkClassName="mo-color underline hover:text-ink" />
        </p>
        <p className="font-display text-xl text-muted">{footer.handNote}</p>
      </div>
    </footer>
  );
}
