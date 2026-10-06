import type { ReactNode } from "react"
import type { SectionId } from "@/data/site"
import { Reveal } from "./Reveal"

interface SectionProps {
  id: SectionId
  title: string
  children: ReactNode
}

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <div className="dither-band" aria-hidden="true" />
      <div className="shell pt-14 pb-20 md:pt-20 md:pb-28">
        <Reveal>
          <h2 id={`${id}-title`} className="display text-[72px] text-cream md:text-[96px]">
            {title}
          </h2>
          <div className="mt-8 md:mt-12">{children}</div>
        </Reveal>
      </div>
    </section>
  )
}
