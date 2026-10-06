import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react"
import { monthLabels, toCells, type ContributionDay } from "@/lib/contributions"

const TOP = 24
const LEFT = 40
const MIN_GAP = 2
const LEVELS = [0, 1, 2, 3, 4] as const

// When the calendar cannot fill its container with cells of at least 12px, it keeps this size and scrolls
const SCROLLING = { cell: 16, pitch: 20 }

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
const count = new Intl.NumberFormat("en")

export function describeDay(day: ContributionDay): string {
  const noun = day.count === 1 ? "contribution" : "contributions"
  return `${count.format(day.count)} ${noun} on ${dayFormat.format(new Date(`${day.date}T00:00:00Z`))}`
}

/**
 * Fits the calendar to the available width. A cell is a 4x4 grid of whole pixels, so it only comes
 * in 12, 16 or 20px; the leftover width goes into the gaps, which is why the pitch is fractional.
 */
function fit(available: number, weeks: number): { cell: number; pitch: number } {
  if (weeks < 2) return SCROLLING
  const room = (available - LEFT) / weeks
  const cell = Math.min(20, Math.floor((room - MIN_GAP) / 4) * 4)
  if (cell < 12) return SCROLLING
  return { cell, pitch: (available - LEFT - cell) / (weeks - 1) }
}

// Intensity is drawn as dither density instead of as five shades: 0, 25, 50, 75 and 100% ink.
// Which pixels of each 2x2 block are inked, per level:
const INKED: Record<number, [number, number][]> = {
  0: [],
  1: [[0, 0]],
  2: [
    [0, 0],
    [1, 1],
  ],
  3: [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
}

function CellStamps({ cell }: { cell: number }) {
  const pixel = cell / 4
  return (
    <defs>
      {LEVELS.map((level) => (
        <g key={level} id={`day-${level}`}>
          <rect width={cell} height={cell} className={level === 4 ? "fill-amber" : "fill-clay"} />
          {level < 4 &&
            Array.from({ length: 4 }, (_, block) =>
              INKED[level].map(([x, y]) => (
                <rect
                  key={`${block}-${x}-${y}`}
                  x={((block % 2) * 2 + x) * pixel}
                  y={(Math.floor(block / 2) * 2 + y) * pixel}
                  width={pixel}
                  height={pixel}
                  className="fill-amber"
                />
              )),
            )}
        </g>
      ))}
    </defs>
  )
}

export function Heatmap({ days, total }: { days: ContributionDay[]; total: number }) {
  const cells = useMemo(() => toCells(days), [days])
  const labels = useMemo(() => monthLabels(cells), [cells])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const hovered = hoveredIndex === null ? undefined : cells[hoveredIndex]

  const scroller = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState(0)

  useLayoutEffect(() => {
    const element = scroller.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setAvailable(Math.floor(entry.contentRect.width)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const weeks = cells.length > 0 ? cells[cells.length - 1].week + 1 : 0
  const { cell, pitch } = fit(available, weeks)
  const rowPitch = cell + Math.max(MIN_GAP, Math.round(pitch - cell))
  const columnX = (week: number) => LEFT + Math.round(week * pitch)
  const rowY = (weekday: number) => TOP + weekday * rowPitch
  const width = columnX(weeks - 1) + cell
  const height = TOP + 6 * rowPitch + cell

  // When it scrolls, the newest weeks are on the right: start there
  useLayoutEffect(() => {
    const element = scroller.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [width])

  const onPointerOver = (event: PointerEvent<SVGSVGElement>) => {
    const index = (event.target as Element).getAttribute("data-index")
    setHoveredIndex(index === null ? null : Number(index))
  }

  return (
    <div>
      <div
        ref={scroller}
        className="overflow-x-auto pb-2"
        tabIndex={0}
        role="group"
        aria-label="Contribution calendar, scrollable"
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          shapeRendering="crispEdges"
          role="img"
          aria-label={`${count.format(total)} contributions in the last year, one square per day`}
          onPointerOver={onPointerOver}
          onPointerLeave={() => setHoveredIndex(null)}
          className="block"
        >
          <CellStamps cell={cell} />
          <g className="fill-dim" fontSize="16">
            {labels.map(({ week, label }) => (
              <text key={`${week}-${label}`} x={columnX(week)} y={14}>
                {label}
              </text>
            ))}
            {["Mon", "Wed", "Fri"].map((label, i) => (
              <text key={label} x={0} y={rowY(i * 2 + 1) + cell / 2 + 5}>
                {label}
              </text>
            ))}
          </g>
          {cells.map((day, index) => (
            <use key={day.date} href={`#day-${day.level}`} data-index={index} x={columnX(day.week)} y={rowY(day.weekday)}>
              <title>{describeDay(day)}</title>
            </use>
          ))}
          {hovered && (
            <rect
              x={columnX(hovered.week) - 1}
              y={rowY(hovered.weekday) - 1}
              width={cell + 2}
              height={cell + 2}
              fill="none"
              strokeWidth="2"
              className="pointer-events-none stroke-cream"
            />
          )}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
        <p className="text-tan tabular-nums" aria-hidden="true">
          {hovered ? describeDay(hovered) : `${count.format(total)} contributions in the last year`}
        </p>
        <p className="flex items-center gap-2 text-dim">
          Less
          <svg width={LEVELS.length * (cell + 4) - 4} height={cell} shapeRendering="crispEdges" aria-hidden="true">
            {LEVELS.map((level) => (
              <use key={level} href={`#day-${level}`} x={level * (cell + 4)} />
            ))}
          </svg>
          More
        </p>
      </div>
    </div>
  )
}
