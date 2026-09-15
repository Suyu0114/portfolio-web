// Small hand-drawn glyphs beside the contact links (Footer, ContactStrip,
// /about). Decorative only — the link text already names the platform, so
// every icon is aria-hidden. Stroke-only, currentColor, so each inherits
// whatever token its link already uses (--muted, --accent, --ink on hover)
// per CLAUDE.md rule 4 — no new colors, no fills, no brand marks.
type IconProps = { className?: string };

const BASE = "inline-block h-4 w-4 align-text-bottom";

export function MailIcon({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`${BASE} ${className}`}
    >
      <path
        d="M4.5 6.5 C4.5 5.5 5.3 5 6.2 5 H17.8 C18.7 5 19.5 5.5 19.5 6.5 V17 C19.5 18 18.7 18.5 17.8 18.5 H6.2 C5.3 18.5 4.5 18 4.5 17 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 6.5 L12 13 L19 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GithubIcon({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`${BASE} ${className}`}
    >
      <path
        d="M8 6.5 C8 4.5 9.6 3.2 12 3.2 C14.4 3.2 16 4.5 16 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12.5" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.3 12.3 V13.6 M14.7 12.3 V13.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.7 16.7 C9.7 17.7 14.3 17.7 15.3 16.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LinkedinIcon({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`${BASE} ${className}`}
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 10.5 V16.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8" cy="7.7" r="0.9" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M12 16.5 V12.3 C12 10.9 13 10.1 14.1 10.1 C15.3 10.1 16 10.9 16 12.3 V16.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MediumIcon({ className = "" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`${BASE} ${className}`}
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.5 15.5 V8.5 L11 13.2 L14.5 8.5 V15.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
