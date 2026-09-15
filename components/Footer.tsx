import ContactLinks from "./ContactLinks";
import { FOOTER } from "@/lib/siteContent";

export default function Footer() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-5xl border-t border-rule px-6 py-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
        {/* These links sit in a --muted paragraph and are --muted themselves,
            so color alone distinguishes nothing (1:1). The resting underline
            is what satisfies axe link-in-text-block; the color stays --muted
            per SPEC §4.1 ("captions, nav links, meta"). */}
        <p className="text-sm text-muted">
          <ContactLinks linkClassName="underline hover:text-ink" />
        </p>
        <p className="font-display text-xl text-muted">{FOOTER.handNote}</p>
      </div>
    </footer>
  );
}
