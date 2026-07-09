import { FOOTER } from "@/lib/siteContent";

export default function Footer() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-5xl border-t border-rule px-6 py-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
        <p className="text-sm text-muted">{FOOTER.linksTodo}</p>
        <p className="font-display text-xl text-muted">{FOOTER.handNote}</p>
      </div>
    </footer>
  );
}
