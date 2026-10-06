import { sigilCells, SIGIL_SIZE } from "@/lib/sigil"

const CELL = 12
const PAD = 8
const SIZE = SIGIL_SIZE * CELL + PAD * 2

/** Symmetric identicon in an amber frame. Decorative: the caption next to it says what it encodes. */
export function Sigil({ seed }: { seed: string }) {
  const rows = sigilCells(seed)
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="shrink-0 text-amber"
    >
      <rect x="1" y="1" width={SIZE - 2} height={SIZE - 2} fill="none" stroke="currentColor" strokeWidth="2" />
      {rows.map((row, y) =>
        row.map((inked, x) =>
          inked ? (
            <rect key={`${x}-${y}`} x={PAD + x * CELL} y={PAD + y * CELL} width={CELL} height={CELL} fill="currentColor" />
          ) : null,
        ),
      )}
    </svg>
  )
}
