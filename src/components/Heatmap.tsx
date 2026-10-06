import { useMemo, useState, type PointerEvent } from "react"
import { monthLabels, toCells, type ContributionDay } from "@/lib/contributions"

const PIXEL = 4
const CELL = 16
const PITCH = 20
const TOP = 24
const LEFT = 40
const LEVELS = [0, 1, 2, 3, 4] as const

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
const count = new Intl.NumberFormat("en")

export function describeDay(day: ContributionDay): string {
  const noun = day.count === 1 ? "contribution" : "contributions"
  return `${count.format(day.count)} ${noun} on ${dayFormat.format(new Date(`${day.date}T00:00:00Z`))}`
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

function CellStamps() {
  const blocks = CELL / (PIXEL * 2)
  return (
    <defs>
      {LEVELS.map((level) => (
        <g key={level} id={`day-${level}`}>
          <rect width={CELL} height={CELL} className={level === 4 ? "fill-amber" : "fill-clay"} />
          {level < 4 &&
            Array.from({ length: blocks * blocks }, (_, block) =>
              INKED[level].map(([x, y]) => (
                <rect
                  key={`${block}-${x}-${y}`}
                  x={((block % blocks) * 2 + x) * PIXEL}
                  y={(Math.floor(block / blocks) * 2 + y) * PIXEL}
                  width={PIXEL}
                  height={PIXEL}
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

  const weeks = cells.length > 0 ? cells[cells.length - 1].week + 1 : 0
  const width = LEFT + weeks * PITCH
  const height = TOP + 7 * PITCH

  const onPointerOver = (event: PointerEvent<SVGSVGElement>) => {
    const index = (event.target as Element).getAttribute("data-index")
    setHoveredIndex(index === null ? null : Number(index))
  }

  return (
    <div>
      <div
        className="overflow-x-auto pb-2"
        tabIndex={0}
        role="group"
        aria-label="Contribution calendar, scrollable"
        // The newest weeks are on the right; start there on narrow screens
        ref={(element) => {
          if (element) element.scrollLeft = element.scrollWidth
        }}
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
          <CellStamps />
          <g className="fill-dim" fontSize="16">
            {labels.map(({ week, label }) => (
              <text key={`${week}-${label}`} x={LEFT + week * PITCH} y={14}>
                {label}
              </text>
            ))}
            <text x={0} y={TOP + PITCH * 1 + 13}>Mon</text>
            <text x={0} y={TOP + PITCH * 3 + 13}>Wed</text>
            <text x={0} y={TOP + PITCH * 5 + 13}>Fri</text>
          </g>
          {cells.map((cell, index) => (
            <use
              key={cell.date}
              href={`#day-${cell.level}`}
              data-index={index}
              x={LEFT + cell.week * PITCH}
              y={TOP + cell.weekday * PITCH}
            >
              <title>{describeDay(cell)}</title>
            </use>
          ))}
          {hovered && (
            <rect
              x={LEFT + hovered.week * PITCH - 1}
              y={TOP + hovered.weekday * PITCH - 1}
              width={CELL + 2}
              height={CELL + 2}
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
          <svg width={LEVELS.length * PITCH - (PITCH - CELL)} height={CELL} shapeRendering="crispEdges" aria-hidden="true">
            {LEVELS.map((level) => (
              <use key={level} href={`#day-${level}`} x={level * PITCH} />
            ))}
          </svg>
          More
        </p>
      </div>
    </div>
  )
}
