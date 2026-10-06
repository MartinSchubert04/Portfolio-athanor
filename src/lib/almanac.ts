// Port of the athanor terminal splash (splash.ps1): planetary hours, moon and the card of the day.
// Everything is computed for Buenos Aires, where the site's owner lives.

export const HOME = { lat: -34.6, lon: -58.38, timeZone: "America/Argentina/Buenos_Aires", utcOffsetHours: -3 }

// Chaldean order, slowest planet to swiftest
const CHALDEAN = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"] as const
export type Planet = (typeof CHALDEAN)[number]

// CHALDEAN index ruling each weekday's first hour, Sunday first
const DAY_RULER = [3, 6, 2, 5, 1, 4, 0]

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS
const SYNODIC_DAYS = 29.530588853
const NEW_MOON_2000 = Date.UTC(2000, 0, 6, 18, 14)

// Argentina has no daylight saving, so the wall clock is a fixed offset from UTC.
function homeWallClock(at: Date): Date {
  return new Date(at.getTime() + HOME.utcOffsetHours * HOUR_MS)
}

function dayOfYear(wall: Date): number {
  return Math.floor((Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate()) - Date.UTC(wall.getUTCFullYear(), 0, 0)) / DAY_MS)
}

/** Sunrise and sunset for the Buenos Aires calendar day that contains `at`. */
export function sunTimes(at: Date): { rise: Date; set: Date } {
  const wall = homeWallClock(at)
  const n = dayOfYear(wall)
  const rad = Math.PI / 180
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (n + 10)) * rad
  const x = -Math.tan(HOME.lat * rad) * Math.tan(declination)
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, x))) / rad
  const b = (2 * Math.PI * (n - 81)) / 364
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  const noonUtcHours = 12 - HOME.lon / 15 - equationOfTime / 60
  const midnightUtc = Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate())
  return {
    rise: new Date(midnightUtc + (noonUtcHours - hourAngle / 15) * HOUR_MS),
    set: new Date(midnightUtc + (noonUtcHours + hourAngle / 15) * HOUR_MS),
  }
}

export interface PlanetaryHour {
  day: Planet
  hour: Planet
  isDay: boolean
}

/** The planetary day runs from sunrise to sunrise; each half is split into twelve unequal hours. */
export function planetaryHour(now: Date): PlanetaryHour {
  let sun = sunTimes(now)
  // Before sunrise the previous planetary day is still running
  if (now < sun.rise) sun = sunTimes(new Date(now.getTime() - DAY_MS))
  const isDay = now < sun.set
  const daylightMs = sun.set.getTime() - sun.rise.getTime()
  const spanMs = (isDay ? daylightMs : DAY_MS - daylightMs) / 12
  const start = isDay ? sun.rise : sun.set
  const index = Math.min(11, Math.floor((now.getTime() - start.getTime()) / spanMs)) + (isDay ? 0 : 12)
  const ruler = DAY_RULER[homeWallClock(sun.rise).getUTCDay()]
  return { day: CHALDEAN[ruler], hour: CHALDEAN[(ruler + index) % 7], isDay }
}

export type MoonPhase = "new" | "waxing" | "full" | "waning"

export function moon(now: Date): { ageDays: number; phase: MoonPhase } {
  const age = (((now.getTime() - NEW_MOON_2000) / DAY_MS) % SYNODIC_DAYS + SYNODIC_DAYS) % SYNODIC_DAYS
  const phase: MoonPhase =
    age < 1 || age > SYNODIC_DAYS - 1
      ? "new"
      : Math.abs(age - SYNODIC_DAYS / 2) < 1
        ? "full"
        : age < SYNODIC_DAYS / 2
          ? "waxing"
          : "waning"
  return { ageDays: Math.floor(age), phase }
}

export function moonLine(now: Date): string {
  const { ageDays, phase } = moon(now)
  return phase === "new" || phase === "full" ? `Moon ${phase}` : `Moon ${phase}, ${ageDays} days old`
}

const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" })
const ORDINAL_SUFFIX: Record<string, string> = { one: "st", two: "nd", few: "rd", other: "th" }

/** "Sunday, the 4th of October", in Buenos Aires time. */
export function longDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: HOME.timeZone,
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const day = Number(get("day"))
  return `${get("weekday")}, the ${day}${ORDINAL_SUFFIX[ordinalRules.select(day)]} of ${get("month")}`
}

const statusFormat = new Intl.DateTimeFormat("en", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: HOME.timeZone,
})

/** "Sun 4 Oct 09:41", in Buenos Aires time. */
export function statusClock(now: Date): string {
  const parts = statusFormat.formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("hour")}:${get("minute")}`
}

// Major arcana with their Golden Dawn attributions
const ARCANA = [
  "0|The Fool|Air|beginnings, a leap",
  "I|The Magician|Mercury|will, craft",
  "II|The High Priestess|Moon|secrets, intuition",
  "III|The Empress|Venus|abundance",
  "IV|The Emperor|Aries|order, authority",
  "V|The Hierophant|Taurus|tradition, teaching",
  "VI|The Lovers|Gemini|choice, union",
  "VII|The Chariot|Cancer|drive, victory",
  "VIII|Strength|Leo|courage, patience",
  "IX|The Hermit|Virgo|solitude, search",
  "X|Wheel of Fortune|Jupiter|turning luck",
  "XI|Justice|Libra|balance, truth",
  "XII|The Hanged Man|Water|surrender, a new view",
  "XIII|Death|Scorpio|endings, change",
  "XIV|Temperance|Sagittarius|mixing, measure",
  "XV|The Devil|Capricorn|bondage, appetite",
  "XVI|The Tower|Mars|upheaval",
  "XVII|The Star|Aquarius|hope, renewal",
  "XVIII|The Moon|Pisces|illusion, dreams",
  "XIX|The Sun|Sun|joy, clarity",
  "XX|Judgement|Fire|awakening",
  "XXI|The World|Saturn|completion",
]

export function fnv1a(text: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

export interface Card {
  numeral: string
  name: string
  attribution: string
  meaning: string
}

/** One major arcanum per Buenos Aires calendar day, fixed for that date. */
export function cardOfTheDay(now: Date): Card {
  const wall = homeWallClock(now)
  const [numeral, name, attribution, meaning] = ARCANA[fnv1a(wall.toISOString().slice(0, 10)) % ARCANA.length].split("|")
  return { numeral, name, attribution, meaning }
}
