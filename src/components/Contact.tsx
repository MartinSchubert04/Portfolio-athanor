import { PLATE_SIZE, type Plate } from "@/data/plates"
import { site } from "@/data/site"
import { PlateFigure } from "./PlateFigure"
import { Section } from "./Section"

export function Contact({ plate }: { plate: Plate }) {
  return (
    <Section id="contact" title="Contact">
      <div className="grid items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_512px]">
        {/* As tall as the plate frame on desktop; the two spacers leave the text a quarter of the way down the artwork */}
        <div className="flex min-w-0 flex-col gap-10 lg:h-[560px] lg:before:flex-1 lg:before:content-[''] lg:after:flex-3 lg:after:content-['']">
          <p className="max-w-[52ch] text-cream">
            Open to new work and to good conversations about code. The fastest way to reach me is email.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-5 pr-2 pb-2">
            <a href={`mailto:${site.email}`} className="clay clay-amber clay-button">
              Send an Email
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener" className="clay clay-button text-cream">
              Write on LinkedIn
            </a>
            <a href={site.github} target="_blank" rel="noopener" className="clay clay-button text-cream">
              Follow on GitHub
            </a>
            <a href={site.resume} download={site.resumeFileName} className="clay clay-button text-cream">
              Download Resume
            </a>
          </div>
        </div>

        <PlateFigure plate={plate} {...PLATE_SIZE} frameClassName="h-[320px] w-full max-w-[512px] sm:h-[480px] lg:h-[560px]" />
      </div>
    </Section>
  )
}
