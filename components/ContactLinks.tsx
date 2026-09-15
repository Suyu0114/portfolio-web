import { CONTACT } from "@/lib/siteContent";
import { GithubIcon, LinkedinIcon, MailIcon, MediumIcon } from "./ContactIcons";

// Email + GitHub/LinkedIn/Medium, icons-as-text (SPEC.md §6.1.3), shared by
// Footer, ContactStrip and /about's contact block (SPEC §6.4: "same links
// as footer") so the four links and their icons live in one place.
const LINKS = [
  { key: "email", href: `mailto:${CONTACT.email}`, label: CONTACT.email, Icon: MailIcon, external: false },
  { key: "github", href: CONTACT.github, label: "GitHub", Icon: GithubIcon, external: true },
  { key: "linkedin", href: CONTACT.linkedin, label: "LinkedIn", Icon: LinkedinIcon, external: true },
  { key: "medium", href: CONTACT.medium, label: "Medium", Icon: MediumIcon, external: true },
] as const;

// Anchors stay plain inline elements (no flex) so the resting underline —
// load-bearing for axe link-in-text-block, see Footer/ContactStrip — keeps
// rendering under the text rather than being dropped by a flex box.
export default function ContactLinks({ linkClassName }: { linkClassName: string }) {
  return (
    <>
      {LINKS.map(({ key, href, label, Icon, external }, i) => (
        <span key={key}>
          {i > 0 ? " · " : null}
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className={linkClassName}
          >
            <Icon className="mr-1" />
            {label}
          </a>
        </span>
      ))}
    </>
  );
}
