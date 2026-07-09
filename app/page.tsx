import Link from "next/link";
import CalibrationDoodle from "@/components/CalibrationDoodle";
import ContactStrip from "@/components/ContactStrip";
import DoodleArrow from "@/components/DoodleArrow";
import SketchCard from "@/components/SketchCard";
import WobblyUnderline from "@/components/WobblyUnderline";
import { getAllProjects } from "@/lib/content";
import { HERO } from "@/lib/siteContent";

export default function Home() {
  // getAllProjects() is already sorted by frontmatter order.
  const featured = getAllProjects()
    .filter((p) => p.frontmatter.featured)
    .slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6">
      {/* Hero — SPEC §6.1.1 */}
      <section className="grid items-center gap-10 py-14 sm:py-20 md:grid-cols-[3fr_2fr]">
        <div>
          <h1 className="font-display text-5xl font-bold sm:text-6xl">
            <WobblyUnderline>{HERO.headline}</WobblyUnderline>
          </h1>
          <p className="mt-7 max-w-prose">{HERO.intro}</p>
          <p className="mt-5 inline-block -rotate-1 font-display text-xl font-medium text-accent-2">
            {HERO.subline}
          </p>
        </div>
        <CalibrationDoodle />
      </section>

      {/* Featured notes — SPEC §6.1.2 */}
      <section className="py-10">
        <h2 className="font-display text-3xl font-medium">
          featured notes <DoodleArrow className="ml-1" />
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(({ frontmatter: fm }, i) => (
            <SketchCard
              key={fm.slug}
              title={fm.title}
              tags={fm.tags}
              oneLiner={fm.oneLiner}
              href={`/projects/${fm.slug}`}
              variant={i % 2 === 0 ? "a" : "b"}
            />
          ))}
        </div>
        <p className="mt-7">
          <Link
            href="/projects"
            className="text-sm text-muted hover:text-ink"
          >
            all projects →
          </Link>
        </p>
      </section>

      {/* Contact strip — SPEC §6.1.3 */}
      <ContactStrip />
    </main>
  );
}
