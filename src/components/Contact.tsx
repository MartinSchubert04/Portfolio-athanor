import { PLATE_SIZE, type Plate } from "@/data/plates"
import { site } from "@/data/site"
import { useNow } from "@/hooks/useNow"
import { cardOfTheDay } from "@/lib/almanac"
import { PlateFigure } from "./PlateFigure"
import { Section } from "./Section"

export function Contact({ plate }: { plate: Plate }) {
  const card = cardOfTheDay(useNow())

  return (
    <Section id="contact" title="Contact">
      <div className="grid items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_512px]">
        <div className="flex min-w-0 flex-col gap-10">
          <p className="max-w-[52ch] text-cream">
            Open to new work and to good conversations about code. The fastest way to reach me is LinkedIn.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-5 pr-2 pb-2">
            <a href={site.linkedin} target="_blank" rel="noopener" className="clay clay-amber clay-button">
              Write on LinkedIn
            </a>
            <a href={site.github} target="_blank" rel="noopener" className="clay clay-button text-cream">
              Follow on GitHub
            </a>
            <a href={site.resume} download={site.resumeFileName} className="clay clay-button text-cream">
              Download Resume
            </a>
          </div>

          <p>
            <span className="text-dim">The card of the day</span>
            <br />
            <span className="text-cream">
              {card.numeral}&nbsp;&nbsp;{card.name}
            </span>
            <br />
            <span className="text-amber">{card.attribution}</span>
            <span className="text-dim"> - {card.meaning}</span>
          </p>
        </div>

        <PlateFigure plate={plate} {...PLATE_SIZE} frameClassName="h-[320px] w-full max-w-[512px] sm:h-[480px] lg:h-[560px]" />
      </div>
    </Section>
  )
}
