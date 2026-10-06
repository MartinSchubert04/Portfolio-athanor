import { HANDS_SIZE, handsPlate } from "@/data/plates"
import { site } from "@/data/site"
import { sheet, skillGroups } from "@/data/skills"
import { PlateFigure } from "./PlateFigure"
import { Section } from "./Section"

export function Skills() {
  return (
    <Section id="skills" title="Skills">
      <PlateFigure plate={handsPlate} {...HANDS_SIZE} frameClassName="h-[224px] w-full md:h-[320px]" />

      <div className="mt-14 grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <div>
          <h3 className="text-cream">
            <span translate="no">{site.name.split(" ")[0]}</span> the {site.role}
          </h3>
          <dl className="mt-4 grid grid-cols-[8ch_minmax(0,1fr)] gap-y-1">
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
