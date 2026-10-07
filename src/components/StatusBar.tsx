import { useMemo } from "react"
import { sections, type SectionId } from "@/data/site"
import { useGithub } from "@/hooks/useGithub"
import { useNow } from "@/hooks/useNow"
import { setPalette, usePalette } from "@/hooks/usePalette"
import { moon, planetaryHour, statusClock } from "@/lib/almanac"
import { contributionStats } from "@/lib/contributions"
import { nextPalette, paletteLabel } from "@/lib/palette"

const count = new Intl.NumberFormat("en")

/** NetHack-style bottom line. Every field is live: scroll position, GitHub numbers, the almanac. */
export function StatusBar({ active }: { active: SectionId }) {
  const now = useNow()
  const palette = usePalette()
  const { state } = useGithub()
  const data = state.status === "ready" ? state.data : undefined
  const stats = useMemo(() => (data ? contributionStats(data.days) : undefined), [data])
  const level = sections.findIndex((s) => s.id === active) + 1

  return (
    <aside
      aria-label="Status"
      className="bar fixed inset-x-0 bottom-0 z-(--z-index-bars) border-t-2 border-rule bg-ink pb-[env(safe-area-inset-bottom)] text-tan tabular-nums"
    >
      <div className="shell flex h-8 items-center gap-4 whitespace-nowrap">
        <span>
          Dlvl:{level} <span className="text-cream">{sections[level - 1].label}</span>
        </span>
        {data && stats && (
          <>
            {data.totalCommits > 0 && (
              <span className="hidden md:inline" title="Public commits found on GitHub">
                Commits:{count.format(data.totalCommits)}
              </span>
            )}
            <span className="hidden md:inline" title="Contributions in the last year">
              Year:{count.format(stats.total)}
            </span>
            <span className="hidden lg:inline" title="Current streak of days with contributions">
              Streak:{stats.currentStreak}d
            </span>
          </>
        )}
        <button
          type="button"
          onClick={() => setPalette(nextPalette(palette))}
          className="ml-auto hidden h-8 cursor-pointer hover:text-cream sm:block"
          title="Change the palette"
        >
          Tint:<span className="text-cream">{paletteLabel(palette)}</span>
        </button>
        <span className="ml-auto sm:ml-0" title="Local time in Buenos Aires">
          {statusClock(now)}
        </span>
        <span className="hidden sm:inline">Hour of {planetaryHour(now).hour}</span>
        <span className="hidden sm:inline">Moon: {moon(now).phase}</span>
      </div>
    </aside>
  )
}
