import { CONTACT } from "@/lib/siteContent";

// SPEC §6.1.3 — one line: availability + email + GitHub/LinkedIn text
// links, no form.
export default function ContactStrip() {
  return (
    <section className="border-t border-rule py-10">
      <p className="text-sm">
        <span className="text-ink-soft">{CONTACT.availability}</span>
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
