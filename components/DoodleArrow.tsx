// Small hand-drawn arrow used next to section heads — SPEC.md §4.3.
export default function DoodleArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 24"
      fill="none"
      className={`inline-block h-5 w-10 align-middle ${className}`}
    >
      <path
        d="M3 7 C 13 15 27 17 41 13"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M33 8 L 42 12.5 L 33.5 18"
        stroke="var(--color-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
