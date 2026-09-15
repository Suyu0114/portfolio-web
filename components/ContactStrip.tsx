import ContactLinks from "./ContactLinks";
import { CONTACT } from "@/lib/siteContent";

// SPEC §6.1.3 — one line: availability + email + GitHub/LinkedIn/Medium
// icons-as-text links, no form.
// Links carry a resting underline, not hover-only: --accent on --ink-soft
// body text is 1.51:1, below the 3:1 axe link-in-text-block needs from
// color alone. SPEC §4.1 lists --accent as serving "links … underlines".
export default function ContactStrip() {
  return (
    <section className="border-t border-rule py-10">
      <p className="text-sm">
        <span className="text-ink-soft">{CONTACT.availability}</span>
        {" · "}
        <ContactLinks linkClassName="text-accent underline" />
      </p>
    </section>
  );
}
