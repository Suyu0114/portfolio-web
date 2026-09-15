/**
 * Hand-drawn speech bubble — SPEC-CHATBOT §6. Ink line work only, no fill, no
 * shadow; the stroke is currentColor, so each caller picks the token. Shared by
 * every control that opens the chat, so they all draw the same mark.
 */
export default function SpeechBubble() {
  return (
    <svg
      viewBox="0 0 32 26"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.4 5.2C3 3.6 4.2 2.2 6 2.1c6.6-.5 13.3-.4 20 .1 1.7.1 2.8 1.3 2.7 2.9-.2 3.9-.3 7.7-.1 11.6.1 1.6-1.1 2.9-2.8 3-4 .3-8 .3-12 .2l-6.2 4.4c-.5.4-1.2 0-1.1-.7l.5-3.9c-1.2-.1-2.4-.5-3.2-1.4-.5-.6-.6-1.4-.6-2.2.1-3.6.4-7.2.2-10.9Z" />
    </svg>
  );
}
