import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

/**
 * Shell for the authenticated study pages — SPEC-CHATBOT §8.
 * The route group keeps /study/login outside this layout so the login form is
 * reachable without a session.
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <header className="border-rule flex flex-wrap items-baseline justify-between gap-3 border-b-2 pb-3">
        <h1 className="font-display text-ink text-3xl leading-none">the study</h1>
        <nav className="flex items-center gap-3 text-xs">
          <Link href="/study" className="text-ink underline underline-offset-4">
            sessions
          </Link>
          <Link
            href="/study/insights"
            className="text-ink underline underline-offset-4"
          >
            insights
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <main className="mt-6">{children}</main>
    </div>
  );
}
