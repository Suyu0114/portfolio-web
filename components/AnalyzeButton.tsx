"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Triggers on-demand insight generation — SPEC-CHATBOT §8. */
export default function AnalyzeButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/admin/analyze", { method: "POST" });
      const data: Record<string, unknown> = await res.json().catch(() => ({}));

      if (!res.ok) {
        setNote(String(data.error ?? `Failed (HTTP ${res.status}).`));
        return;
      }
      if (data.status === "no-new-messages") {
        setNote(String(data.message));
        return;
      }
      setNote(
        `Analysed ${String(data.messages)} messages, ${String(data.gaps)} gap(s) found.`,
      );
      router.refresh();
    } catch {
      setNote("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="sk-pill text-ink hover:bg-rule px-3 py-1 text-xs disabled:opacity-40"
      >
        {busy ? "analysing…" : "Analyze"}
      </button>
      {note !== null && (
        <p className="sk-border-b text-ink mt-3 px-2.5 py-1.5 text-xs">{note}</p>
      )}
    </div>
  );
}
