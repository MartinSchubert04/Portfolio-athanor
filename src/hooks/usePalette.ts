import { useSyncExternalStore } from "react"
import { DEFAULT_PALETTE, isPalette, PALETTE_KEY, type PaletteId } from "@/lib/palette"

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// <html data-palette> is the source of truth: the CSS reads it, and index.html sets it before first paint
function current(): PaletteId {
  const value = document.documentElement.dataset.palette
  return isPalette(value) ? value : DEFAULT_PALETTE
}

export function setPalette(id: PaletteId) {
  const root = document.documentElement
  root.dataset.palette = id
  // The browser chrome follows the page color of the new palette
  const page = getComputedStyle(root).getPropertyValue("--color-ink").trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", page)
  try {
    localStorage.setItem(PALETTE_KEY, id)
  } catch {
    // Without storage the choice lasts until the page is closed
  }
  listeners.forEach((listener) => listener())
}

export function usePalette(): PaletteId {
  return useSyncExternalStore(subscribe, current)
}
