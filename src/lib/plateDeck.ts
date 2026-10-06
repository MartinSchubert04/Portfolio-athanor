// Playlist-style shuffle, as in the terminal splash: no plate repeats until all have been shown,
// and a new round never starts with the plate seen last.
const SEEN_KEY = "athanor:plates-seen"

function readSeen(): number[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter((n): n is number => Number.isInteger(n)) : []
  } catch {
    return []
  }
}

function writeSeen(seen: number[]) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch {
    // Without storage the shuffle is simply memoryless
  }
}

export function drawPlate(count: number, random: () => number = Math.random): number {
  let seen = readSeen().filter((n) => n >= 0 && n < count)
  let pool = Array.from({ length: count }, (_, i) => i).filter((i) => !seen.includes(i))
  if (pool.length === 0) {
    const last = seen[seen.length - 1]
    seen = []
    pool = Array.from({ length: count }, (_, i) => i).filter((i) => i !== last || count === 1)
  }
  const pick = pool[Math.floor(random() * pool.length)]
  writeSeen([...seen, pick])
  return pick
}
