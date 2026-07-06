import Link from "next/link";

// P0 placeholder — the real home page (hero, featured notes, contact
// strip) is built in P1 per SPEC.md §6.1.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="font-display text-4xl font-bold">field notes</h1>
      <p>
        TODO(P1): home page per SPEC.md §6.1 — hero, featured notes,
        contact strip.
      </p>
      <p>
        <Link href="/dev/tokens" className="text-accent underline">
          /dev/tokens
        </Link>{" "}
        — P0 token page, font samples, and spikes.
      </p>
    </main>
  );
}
