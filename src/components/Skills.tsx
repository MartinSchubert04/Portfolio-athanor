import { HANDS_SIZE, handsPlate } from "@/data/plates"
import { sheet, skillGroups } from "@/data/skills"
import { plateCaption } from "./PlateFigure"
import { Section } from "./Section"

export function Skills() {
  return (
    <Section id="skills" title="Skills">
      {/* As wide as the artwork, so the caption starts at the plate's left edge */}
      <div className="mx-auto" style={{ maxWidth: HANDS_SIZE.width }}>
        <figure className="m-0 min-w-0">
          {/* The same plate twice, each clipped to one hand, so the two can move apart (see .plate-hands) */}
          <div className="plate-frame plate-hands h-[224px] w-full md:h-[320px]">
            <img
              className="hand-left"
              src={handsPlate.src}
              alt={`${handsPlate.title}, by ${handsPlate.artist}, as a two-color dithered plate`}
              {...HANDS_SIZE}
              loading="lazy"
              decoding="async"
            />
            <img className="hand-right" src={handsPlate.src} alt="" aria-hidden="true" {...HANDS_SIZE} loading="lazy" decoding="async" />
            <div className="plate-cover" aria-hidden="true" />
          </div>
          <figcaption className="mt-2 text-dim">{plateCaption(handsPlate)}</figcaption>
        </figure>
      </div>

      <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <div>
          <h3 className="text-cream">Profile</h3>
          <dl className="mt-4 grid grid-cols-[10ch_minmax(0,1fr)] gap-y-1">
            {sheet.map(({ key, value }) => (
              <div key={key} className="contents">
                <dt className="text-amber">{key}</dt>
                <dd className="m-0 text-cream">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {skillGroups.map((group) => (
            <div key={group.name}>
              <h3 className="text-dim">{group.name}</h3>
              <ul className="m-0 mt-4 flex list-none flex-wrap gap-x-5 gap-y-5 p-0 pr-2 pb-2">
                {group.skills.map((skill) => (
                  <li key={skill.name}>
                    <a href={skill.link} target="_blank" rel="noopener" className="clay clay-chip text-cream" translate="no">
                      {skill.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
