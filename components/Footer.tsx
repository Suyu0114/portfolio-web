import { CONTACT, FOOTER } from "@/lib/siteContent";

export default function Footer() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-5xl border-t border-rule px-6 py-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
        <p className="text-sm text-muted">
          <a href={`mailto:${CONTACT.email}`} className="hover:text-ink">
            {CONTACT.email}
          </a>
          {" · "}
          <a
            href={CONTACT.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            GitHub
          </a>
          {" · "}
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            LinkedIn
          </a>
        </p>
        <p className="font-display text-xl text-muted">{FOOTER.handNote}</p>
      </div>
    </footer>
  );
}
