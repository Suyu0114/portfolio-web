import { CONTACT } from "@/lib/siteContent";

// SPEC §6.1.3 — one line: availability + email + GitHub/LinkedIn text
// links, no form.
// Links carry a resting underline, not hover-only: --accent on --ink-soft
// body text is 1.51:1, below the 3:1 axe link-in-text-block needs from
// color alone. SPEC §4.1 lists --accent as serving "links … underlines".
export default function ContactStrip() {
  return (
    <section className="border-t border-rule py-10">
      <p className="text-sm">
        <span className="text-ink-soft">{CONTACT.availability}</span>
        {" · "}
        <a href={`mailto:${CONTACT.email}`} className="text-accent underline">
          {CONTACT.email}
        </a>
        {" · "}
        <a
          href={CONTACT.github}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline"
        >
          GitHub
        </a>
        {" · "}
        <a
          href={CONTACT.linkedin}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline"
        >
          LinkedIn
        </a>
      </p>
    </section>
  );
}
