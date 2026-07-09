import { CONTACT } from "@/lib/siteContent";

// SPEC §6.1.3 — one line: availability + email + GitHub/LinkedIn text
// links, no form. Availability is still a §10 blocker → visible TODO.
export default function ContactStrip() {
  return (
    <section className="border-t border-rule py-10">
      <p className="text-sm">
        <span className="text-muted">{CONTACT.availabilityTodo}</span>
        {" · "}
        <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">
          {CONTACT.email}
        </a>
        {" · "}
        <a
          href={CONTACT.github}
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline"
        >
          GitHub
        </a>
        {" · "}
        <a
          href={CONTACT.linkedin}
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline"
        >
          LinkedIn
        </a>
      </p>
    </section>
  );
}
