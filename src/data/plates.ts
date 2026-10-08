import blake from "@/assets/plates/blake-ancient-of-days.png"
import cabanel from "@/assets/plates/cabanel-fallen-angel.png"
import doreIsraelites from "@/assets/plates/dore-angel-israelites.png"
import dorePaleHorse from "@/assets/plates/dore-death-pale-horse.png"
import doreAngels from "@/assets/plates/dore-satan-angels.png"
import doreDespair from "@/assets/plates/dore-satan-despair.png"
import doreFalls from "@/assets/plates/dore-satan-falls.png"
import doreProfile from "@/assets/plates/dore-satan-profile.png"
import doreRises from "@/assets/plates/dore-satan-rises.png"
import friedrich from "@/assets/plates/friedrich-wanderer.png"
import hands from "@/assets/plates/michelangelo-adam-hands-strip.png"

export interface Plate {
  id: string
  src: string
  artist: string
  title: string
  year: string
}

// Public domain works, dithered to two colors by scripts/make-plates.ps1. All are 512x640.
export const plates: Plate[] = [
  { id: "dore-despair", src: doreDespair, artist: "Gustave Doré", title: "Paradise Lost, Satan in despair", year: "1866" },
  { id: "friedrich", src: friedrich, artist: "Caspar David Friedrich", title: "Wanderer above the Sea of Fog", year: "c. 1818" },
  { id: "dore-angels", src: doreAngels, artist: "Gustave Doré", title: "Paradise Lost, Satan and the angels", year: "1866" },
  { id: "cabanel", src: cabanel, artist: "Alexandre Cabanel", title: "The Fallen Angel", year: "1847" },
  { id: "dore-profile", src: doreProfile, artist: "Gustave Doré", title: "Paradise Lost, Satan on the rock", year: "1866" },
  { id: "blake", src: blake, artist: "William Blake", title: "The Ancient of Days", year: "1794" },
  { id: "dore-falls", src: doreFalls, artist: "Gustave Doré", title: "Paradise Lost, the fall of Satan", year: "1866" },
  { id: "dore-pale-horse", src: dorePaleHorse, artist: "Gustave Doré", title: "Death on the Pale Horse", year: "1865" },
  { id: "dore-rises", src: doreRises, artist: "Gustave Doré", title: "Paradise Lost, Satan rises from the lake", year: "1866" },
  { id: "dore-israelites", src: doreIsraelites, artist: "Gustave Doré", title: "An Angel Appears to the Israelites", year: "1866" },
]

// 60 frames of 512x192 stacked in one strip and shown at twice their size: a camera flight around
// the hands that dissolves into the plate. The last frame is the plate at rest
export const handsPlate: Plate = {
  id: "hands",
  src: hands,
  artist: "Michelangelo",
  title: "The Creation of Adam, detail",
  year: "c. 1512",
}

export const PLATE_SIZE = { width: 512, height: 640 }
export const HANDS_SIZE = { width: 1024, height: 384 * 60 }
export const HANDS_MODEL = "https://sketchfab.com/3d-models/creation-of-adam-b2b79dff2ff74dbaa47ac80bab4f0173"
