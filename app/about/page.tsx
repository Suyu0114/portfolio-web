import type { Metadata } from "next";
import ContactLinks from "@/components/ContactLinks";
import Photo from "@/components/Photo";
import WobblyUnderline from "@/components/WobblyUnderline";
import { ABOUT, CONTACT } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "about",
  description:
    "Suyu — Toronto-based full-stack engineer: six years of ERP, CRM, and business systems, now integrating AI.",
};

// `sizes` below is the photo's own width, not its frame's: the frame adds
// 2px of border and p-3 (or compact p-2) on each side. Sizing to the frame
// made next/image pick the next width up, and on mobile those extra bytes
// start loading before the bio paints and push Lighthouse's simulated LCP
// back.
const PAIR_SIZES = "(min-width: 672px) 274px, calc(50vw - 60px)";
const SINGLE_SIZES = "(min-width: 432px) 356px, calc(100vw - 76px)";

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">
        <WobblyUnderline draw>{ABOUT.headline}</WobblyUnderline>
      </h1>

      {/* Portrait beside the bio (SPEC §6.4, v1.6 P7): centered above it on
          mobile, floated right from sm up; flow-root contains the float. */}
      <section className="mt-8 flow-root">
        <Photo
          image={ABOUT.portrait.image}
          alt={ABOUT.portrait.alt}
          sizes="(min-width: 640px) 156px, 172px"
          rotate="cw"
          border="b"
          compact
          load="eager"
          className="mx-auto mb-6 w-48 sm:float-right sm:mb-3 sm:ml-6 sm:w-44"
        />
        <div className="space-y-4">
          {ABOUT.bio.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
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

      {/* Volunteering (SPEC §6.4, v1.10): the same card treatment as "how I
          work", with no photos. */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-medium">
          {ABOUT.volunteering.heading}
        </h2>
        <p className="mt-3">{ABOUT.volunteering.intro}</p>
        <ul className="mt-5 space-y-4">
          {ABOUT.volunteering.roles.map((role) => (
            <li key={role.title} className="sk-border-a bg-card p-4">
              <p className="text-[15px] font-semibold text-ink">{role.title}</p>
              {role.detail && <p className="mt-1 text-[15px]">{role.detail}</p>}
              <p className="mt-1 text-sm text-ink-soft">{role.when}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Interests as blocks of a paragraph plus a row of photos (SPEC §6.4,
          v1.6). A pair stays two-up at every width; a single photo is capped
          so a low-resolution still isn't stretched across the column. The id
          is the target of the home hero's interests link (v1.8). */}
      <section id={ABOUT.interestsId} className="mt-12">
        <h2 className="font-display text-2xl font-medium">interests</h2>
        <div className="mt-3 space-y-8">
          {ABOUT.interests.map((block) => (
            <div key={block.body.slice(0, 24)}>
              <p>{block.body}</p>
              {block.photos.length > 0 && (
                <div
                  className={
                    block.photos.length === 1
                      ? "mt-5 max-w-sm"
                      : "mt-5 grid grid-cols-2 items-start gap-4 sm:gap-5"
                  }
                >
                  {block.photos.map((photo, i) => (
                    <Photo
                      key={photo.image.src}
                      image={photo.image}
                      alt={photo.alt}
                      caption={photo.caption}
                      sizes={block.photos.length === 1 ? SINGLE_SIZES : PAIR_SIZES}
                      border={i % 2 === 0 ? "a" : "b"}
                      rotate={i % 2 === 0 ? "ccw" : "cw"}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-rule pt-6">
        <h2 className="font-display text-2xl font-medium">contact</h2>
        <p className="mt-3 text-sm">
          <span className="text-ink-soft">{CONTACT.availability}</span>
          {" · "}
          {/* Resting underline, matching ContactStrip — see the note there. */}
          <ContactLinks linkClassName="text-accent underline" />
        </p>
      </section>
    </main>
  );
}
