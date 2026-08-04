"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Clears the admin session — SPEC-CHATBOT §8. */
export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/study/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={busy}
      className="sk-pill text-ink hover:bg-rule px-2 py-0.5 text-xs disabled:opacity-40"
    >
      {busy ? "…" : "log out"}
    </button>
  );
}
