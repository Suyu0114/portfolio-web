import type { Metadata } from "next";
import WobblyUnderline from "@/components/WobblyUnderline";
import { ABOUT, CONTACT } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "about — Suyu",
  description:
    "Suyu — Toronto-based, building data products end-to-end across data engineering, BI analytics, and full-stack development.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">
        <WobblyUnderline>{ABOUT.headline}</WobblyUnderline>
      </h1>

      <section className="mt-8 space-y-4">
        {ABOUT.bio.map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-medium">
          {ABOUT.howIWork.heading}
        </h2>
        <p className="mt-3">{ABOUT.howIWork.intro}</p>
        <dl className="mt-5 space-y-4">
          {ABOUT.howIWork.points.map((point) => (
            <div key={point.title} className="sk-border-a bg-card p-4">
              <dt className="text-[15px] font-semibold text-ink">
                {point.title}
              </dt>
              <dd className="mt-1 text-[15px]">{point.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-medium">interests</h2>
        <div className="mt-3 space-y-4">
          {ABOUT.interests.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-rule pt-6">
        <h2 className="font-display text-2xl font-medium">contact</h2>
        <p className="mt-3 text-sm">
          <span className="text-muted">{CONTACT.availabilityTodo}</span>
          {" · "}
          <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">
            {CONTACT.email}
          </a>
          {" · "}
          <a
            href={CONTACT.github}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            GitHub
          </a>
          {" · "}
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            LinkedIn
          </a>
        </p>
      </section>
    </main>
  );
}
