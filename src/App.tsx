import { useCallback, useState } from "react"
import { Career } from "@/components/Career"
import { Contact } from "@/components/Contact"
import { Hero } from "@/components/Hero"
import { Ledger } from "@/components/Ledger"
import { plateCaption } from "@/components/PlateFigure"
import { Projects } from "@/components/Projects"
import { Skills } from "@/components/Skills"
import { StatusBar } from "@/components/StatusBar"
import { TopBar } from "@/components/TopBar"
import { plates } from "@/data/plates"
import { useActiveSection } from "@/hooks/useActiveSection"
import { GithubProvider } from "@/hooks/useGithub"
import { drawPlate } from "@/lib/plateDeck"

export function App() {
  const [plateIndex, setPlateIndex] = useState(() => drawPlate(plates.length))
  const active = useActiveSection()

  const nextPlate = useCallback(() => {
    const next = drawPlate(plates.length)
    setPlateIndex(next)
    return plateCaption(plates[next])
  }, [])

  // The closing plate is always a different one from the hero's
  const closingPlate = plates[(plateIndex + Math.ceil(plates.length / 2)) % plates.length]

  return (
    <GithubProvider>
      <a
        href="#main"
        className="fixed top-2 left-2 z-(--z-index-skip) -translate-y-16 bg-amber px-3 py-2 text-ink focus-visible:translate-y-0"
      >
        Skip to Content
      </a>
      {/* Re-inks the one-color plate PNGs in the palette's plate color (see .plate-frame in index.css) */}
      <svg aria-hidden="true" className="absolute size-0">
        <filter id="plate-ink" colorInterpolationFilters="sRGB">
          <feFlood style={{ floodColor: "var(--color-plate)" }} />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
      </svg>
      <TopBar active={active} />
      <main id="main" className="pb-8">
        <Hero plate={plates[plateIndex]} onNextPlate={nextPlate} />
        <Career />
        <Skills />
        <Projects />
        <Ledger />
        <Contact plate={closingPlate} />
      </main>
      <StatusBar active={active} />
    </GithubProvider>
  )
}
