import Link from "next/link";
import CalibrationDoodle from "@/components/CalibrationDoodle";
import ContactStrip from "@/components/ContactStrip";
import DoodleArrow from "@/components/DoodleArrow";
import LinkArrow from "@/components/LinkArrow";
import OpenChatButton from "@/components/OpenChatButton";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";
import SketchButtonLink from "@/components/SketchButtonLink";
import SketchCard from "@/components/SketchCard";
import WobblyUnderline from "@/components/WobblyUnderline";
import { getAllProjects } from "@/lib/content";
import { ABOUT, HERO } from "@/lib/siteContent";

export default function Home() {
  // getAllProjects() is already sorted by frontmatter order.
  const featured = getAllProjects()
    .filter((p) => p.frontmatter.featured)
    .slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6">
      {/* Hero — SPEC §6.1.1. Its opening (SPEC §4.4, v1.11) is CSS, so it
          plays at first paint with no JavaScript: the headline and intro are
          there at once, the underline draws, the portrait settles, and the
          sub-line and buttons rise in turn ([--i:n] is the step). */}
      <section className="grid items-center gap-10 py-14 sm:py-20 md:grid-cols-[3fr_2fr]">
        <div>
          <h1 className="font-display text-5xl font-bold sm:text-6xl">
            <WobblyUnderline draw>{HERO.headline}</WobblyUnderline>
          </h1>
          {/* Portrait beside the intro (SPEC §6.1): 112px under the headline
              on mobile, 176px floated left from sm up (v1.7). flow-root
              keeps the float inside this block, so the sub-line starts
              below it. sizes is the photo inside the compact frame. */}
          <div className="mt-7 flow-root">
            <Photo
              image={HERO.portrait.image}
              alt={HERO.portrait.alt}
              sizes="(min-width: 640px) 156px, 92px"
              rotate="cw"
              border="b"
              compact
              load="eager"
              className="mo-settle mb-4 w-28 sm:float-left sm:mr-5 sm:mb-1 sm:w-44"
            />
            <p className="max-w-prose">{HERO.intro}</p>
          </div>
          <p className="mo-rise mt-5 inline-block -rotate-1 font-display text-xl font-medium text-accent-2 [--i:1]">
            {HERO.subline}
          </p>
          {/* The hero's actions (SPEC §6.1, v1.8): a button that opens the
              chat, then two links. On narrow screens they wrap onto a second
              line rather than shrink, because Caveat stays at 20px. */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <OpenChatButton label={HERO.chatCta} className="mo-rise [--i:2]" />
            <SketchButtonLink
              href="/about"
              label={HERO.aboutCta}
              rotate="cw"
              className="mo-rise [--i:3]"
            />
            <SketchButtonLink
              href={`/about#${ABOUT.interestsId}`}
              label={HERO.interestsCta}
              border="b"
              rotate="ccw"
              className="mo-rise [--i:4]"
            />
          </div>
        </div>
        <CalibrationDoodle />
      </section>

      {/* Featured notes — SPEC §6.1.2. Each block fades up once as it
          scrolls in (Reveal, SPEC §4.4); cards arriving together go in
          turn. A card's Reveal is a one-cell grid so the card still
          stretches to its row's height. */}
      <section className="py-10">
        <Reveal>
          <h2 className="font-display text-3xl font-medium">
            featured notes <DoodleArrow className="ml-1" draw="reveal" />
          </h2>
        </Reveal>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(({ frontmatter: fm }, i) => (
            <Reveal key={fm.slug} className="grid">
              <SketchCard
                title={fm.title}
                tags={fm.tags}
                oneLiner={fm.oneLiner}
                href={`/projects/${fm.slug}`}
                variant={i % 2 === 0 ? "a" : "b"}
              />
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-7">
            <Link
              href="/projects"
              className="mo-color text-sm text-muted hover:text-ink"
            >
              all projects <LinkArrow />
            </Link>
          </p>
        </Reveal>
      </section>

      {/* Contact strip — SPEC §6.1.3 */}
      <Reveal>
        <ContactStrip />
      </Reveal>
    </main>
  );
}
