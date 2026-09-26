import { CONTACT } from "@/lib/siteContent";

// SPEC §6.1.3 — the availability sentence that closes the home page. Its
// email/GitHub/LinkedIn/Medium links moved into the hero at v1.12 (SPEC
// §6.1), so the page no longer repeats the footer's links just above it.
export default function ContactStrip() {
  return (
    <section className="border-t border-rule py-10">
      <p className="text-sm text-ink-soft">{CONTACT.availability}</p>
    </section>
  );
}
