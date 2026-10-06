import { fnv1a } from "./almanac"

export const SIGIL_SIZE = 5

// Columns mirror around the middle, like the host sigil in the terminal splash
const MIRROR = [0, 1, 2, 1, 0]

function bytesFromHex(hex: string): number[] {
  const bytes: number[] = []
  for (let i = 0; i + 1 < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16))
  return bytes
}

function bytesFromText(text: string): number[] {
  return Array.from({ length: SIGIL_SIZE * 3 }, (_, i) => fnv1a(`${text}:${i}`) & 0xff)
}

/**
 * Symmetric 5x5 identicon. A commit SHA is used byte by byte; any other seed is hashed first.
 * Returns rows of booleans, true meaning an inked cell.
 */
export function sigilCells(seed: string): boolean[][] {
  const isSha = /^[0-9a-f]{30,}$/i.test(seed)
  const bytes = isSha ? bytesFromHex(seed) : bytesFromText(seed)
  return Array.from({ length: SIGIL_SIZE }, (_, y) => MIRROR.map((x) => (bytes[y * 3 + x] & 1) === 1))
}
