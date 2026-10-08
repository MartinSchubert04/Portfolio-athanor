import { lazy, Suspense } from "react"
import { HANDS_SIZE, handsPlate } from "@/data/plates"
import { sheet, skillGroups } from "@/data/skills"
import { plateCaption } from "./PlateFigure"
import { Section } from "./Section"

// Trial: ?hands=3d swaps the frame strip for the live 3D model
const HandsScene = lazy(() => import("./HandsScene"))
const live = new URLSearchParams(location.search).get("hands") === "3d"

export function Skills() {
  const alt = live
    ? "Two hands about to touch, after Michelangelo’s The Creation of Adam, as a dithered 3D model"
    : `${handsPlate.title}, by ${handsPlate.artist}, as a two-color dithered plate`

  return (
    <Section id="skills" title="Skills">
      {/* As wide as the artwork, so the caption starts at the plate's left edge */}
      {/* In the WebGL trial the figure stays pinned mid-screen while the scroll drives the camera */}
      <div className={`mx-auto ${live ? "motion-safe:h-[240dvh]" : ""}`} style={{ maxWidth: HANDS_SIZE.width }}>
        <figure className={`m-0 min-w-0 ${live ? "sticky top-[calc(50dvh-176px)]" : ""}`}>
          {/* A strip of frames; the scroll steps through them (see .plate-hands) */}
          <div className="plate-frame plate-hands h-[224px] w-full md:h-[320px]">
            {live ? (
              <Suspense>
                <HandsScene label={alt} />
              </Suspense>
            ) : (
              <img src={handsPlate.src} alt={alt} {...HANDS_SIZE} loading="lazy" decoding="async" />
            )}
            <div className="plate-cover" aria-hidden="true" />
          </div>
          {live ? (
            // The model is CC BY 4.0: the license asks for the author, the source and a note that it was adapted
            <figcaption className="mt-2 text-dim">
              After Michelangelo, The Creation of Adam (c. 1512). Model by{" "}
              <a href="https://sketchfab.com/3d-models/the-creation-of-adam-4d1727c7b83e4e6284bbadb63dbb537e" target="_blank" rel="noopener" className="link">
                Loïc Norgeot
              </a>
              , from a scan by Artec 3D and a base mesh by Jeremy E. Grayson, adapted,{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" className="link">
                CC BY 4.0
              </a>
              .
            </figcaption>
          ) : (
            <figcaption className="mt-2 text-dim">{plateCaption(handsPlate)}</figcaption>
          )}
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
