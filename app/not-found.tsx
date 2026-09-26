import Link from "next/link";
import LinkArrow from "@/components/LinkArrow";

// Hand-drawn empty state — copy from SPEC §5.
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-24">
      <div className="sk-border-a max-w-md bg-card p-10 text-center">
        <p className="font-mono text-xs text-muted">404</p>
        <h1 className="mt-2 font-display text-3xl font-medium">
          this page isn&apos;t in the notebook
        </h1>
        <p className="mt-4 text-sm">
          <Link href="/" className="text-accent underline">
            back to the front page <LinkArrow />
          </Link>
        </p>
      </div>
    </main>
  );
}
