import { describe, expect, it } from "vitest"
import { isPalette, nextPalette, paletteLabel, palettes, type PaletteId } from "./palette"

describe("palette", () => {
  it("recognizes only the known palettes", () => {
    expect(isPalette("umber")).toBe(true)
    expect(isPalette("Umber")).toBe(false)
    expect(isPalette(null)).toBe(false)
  })

  it("cycles through every palette and wraps around", () => {
    let id: PaletteId = palettes[0].id
    const seen = palettes.map(() => (id = nextPalette(id)))
    expect(new Set(seen).size).toBe(palettes.length)
    expect(id).toBe(palettes[0].id)
  })

  it("labels a palette", () => {
    expect(paletteLabel("cinnabar")).toBe("Cinnabar")
  })
})
