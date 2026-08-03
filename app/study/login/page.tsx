"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

/** Login form — SPEC-CHATBOT §8. Posts to /api/admin/login. */

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const next = searchParams.get("next");
        router.replace(next !== null && next.startsWith("/study") ? next : "/study");
        router.refresh();
        return;
      }
      const data: unknown = await res.json().catch(() => null);
      const message =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: unknown }).error)
          : "Login failed.";
      setError(message);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="sk-border-a bg-card mx-auto max-w-sm p-5">
      <h1 className="font-display text-ink text-3xl leading-none">the study</h1>
      <p className="text-muted mt-2 text-xs">Private. Password required.</p>

      <label htmlFor="password" className="text-ink mt-5 block text-xs">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="sk-pill text-ink bg-card mt-1 w-full px-2 py-1 text-xs"
      />

      {error !== null && (
        <p className="sk-border-b text-ink mt-3 px-2.5 py-1.5 text-xs">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy || password === ""}
        className="sk-pill text-ink hover:bg-rule mt-4 px-3 py-1 text-xs disabled:opacity-40"
      >
        {busy ? "checking…" : "open the study"}
      </button>
    </form>
  );
}

export default function StudyLoginPage() {
  // useSearchParams needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
