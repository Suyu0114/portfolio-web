import { CONTACT } from "@/lib/siteContent";

// SPEC §6.1.3 — one line: availability + email + GitHub/LinkedIn text
// links, no form. All inputs are §10 blockers, so this renders a
// visible TODO until Suyu supplies them (CLAUDE.md rule 1).
export default function ContactStrip() {
  return (
    <section className="border-t border-rule py-10">
      <p className="text-sm text-muted">{CONTACT.todo}</p>
    </section>
  );
}
