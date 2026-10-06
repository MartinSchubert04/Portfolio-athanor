import type { Plate } from "@/data/plates"

interface PlateFigureProps {
  plate: Plate
  width: number
  height: number
  /** Tailwind classes sizing the frame; the artwork keeps its natural pixels and is cropped. */
  frameClassName: string
  priority?: boolean
}

export function plateCaption(plate: Plate): string {
  return `${plate.artist}, ${plate.title} (${plate.year})`
}

export function PlateFigure({ plate, width, height, frameClassName, priority = false }: PlateFigureProps) {
  return (
    <figure className="m-0 min-w-0">
      <div className={`plate-frame ${frameClassName}`}>
        <img
          src={plate.src}
          alt={`${plate.title}, by ${plate.artist}, as a two-color dithered plate`}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
        {/* Remounting on plate change replays the print-in animation */}
        <div key={plate.id} className="plate-cover" aria-hidden="true" />
      </div>
      <figcaption className="mt-2 text-dim">{plateCaption(plate)}</figcaption>
    </figure>
  )
}
