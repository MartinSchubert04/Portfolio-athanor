import { PLATE_SIZE, type Plate } from "@/data/plates"
import { site } from "@/data/site"
import { useGithub } from "@/hooks/useGithub"
import { useNow } from "@/hooks/useNow"
import { longDate, moonLine, planetaryHour } from "@/lib/almanac"
import { GITHUB_USER } from "@/lib/github"
import { PlateFigure } from "./PlateFigure"
import { Prompt } from "./Prompt"
import { Sigil } from "./Sigil"

interface HeroProps {
  plate: Plate
  onNextPlate: () => string
}

export function Hero({ plate, onNextPlate }: HeroProps) {
  const now = useNow()
  const { state } = useGithub()
  const lastCommit = state.status === "ready" ? state.data.commits[0] : undefined
  const { day, hour } = planetaryHour(now)

  return (
    <section id="top" aria-labelledby="top-title">
      <div className="shell grid items-center gap-x-10 gap-y-8 pt-16 pb-14 lg:min-h-[100dvh] lg:grid-cols-[512px_2px_minmax(0,1fr)] xl:gap-x-16">
        <PlateFigure
          plate={plate}
          {...PLATE_SIZE}
          priority
          frameClassName="h-[256px] w-full max-w-[512px] sm:h-[480px] lg:h-[min(640px,calc(100dvh-168px))]"
        />

        <div className="hidden self-stretch bg-rule lg:block" aria-hidden="true" />

        <div className="flex min-w-0 max-w-[592px] flex-col gap-6">
          {/* The sigil is drawn from the latest commit's SHA, so it changes with every push */}
          <div className="flex items-center gap-4">
            <Sigil seed={lastCommit?.sha ?? GITHUB_USER} />
            <p className="min-w-0 text-dim" translate="no">
              {GITHUB_USER.toLowerCase()}
              <br />
              {lastCommit ? "sigil of the last commit" : "host sigil"}
              <br />
              {lastCommit ? `SHA1:${lastCommit.sha.slice(0, 7)}…${lastCommit.sha.slice(-3)}` : "awaiting a raven…"}
            </p>
          </div>

          <div>
            <h1 id="top-title" className="display text-[72px] text-cream sm:text-[96px]" translate="no">
              {site.name}
            </h1>
            <p className="mt-4 max-w-[52ch] text-cream">{site.pitch}</p>
          </div>

          <p>
            <strong className="font-normal text-cream">{longDate(now)}</strong>
            <br />
            <span className="text-amber">
              Day of {day === "Sun" || day === "Moon" ? "the " : ""}
              {day}, hour of {hour}
            </span>
            <br />
            <span className="text-dim">{moonLine(now)}</span>
          </p>

          <Prompt onNextPlate={onNextPlate} />

          <div className="flex flex-wrap gap-x-6 gap-y-5 pr-2 pb-2">
            <a href="#projects" className="clay clay-amber clay-button">
              View Projects
            </a>
            <a href={site.resume} download={site.resumeFileName} className="clay clay-button text-cream">
              Download Resume
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
