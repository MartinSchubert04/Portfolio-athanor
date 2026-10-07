// The palettes of the terminal theme. Their colors live in index.css, keyed by `data-palette` on <html>.
export const palettes = [
  { id: "srcery", label: "Srcery" },
  { id: "umber", label: "Umber" },
  { id: "vellum", label: "Vellum" },
  { id: "orpiment", label: "Orpiment" },
  { id: "cinnabar", label: "Cinnabar" },
] as const

export type PaletteId = (typeof palettes)[number]["id"]

export const DEFAULT_PALETTE: PaletteId = "srcery"
// Also read by the inline script in index.html, which applies the palette before first paint
export const PALETTE_KEY = "athanor:palette"

export function isPalette(value: unknown): value is PaletteId {
  return palettes.some((p) => p.id === value)
}

export function paletteLabel(id: PaletteId): string {
  return palettes.find((p) => p.id === id)!.label
}

export function nextPalette(id: PaletteId): PaletteId {
  return palettes[(palettes.findIndex((p) => p.id === id) + 1) % palettes.length].id
}
