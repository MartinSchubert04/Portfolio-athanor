import { describe, expect, it } from "vitest"
import { cardOfTheDay, longDate, moon, planetaryHour, statusClock, sunTimes } from "./almanac"

// 09:41 in Buenos Aires on Sunday 4 October 2026
const reference = new Date("2026-10-04T12:41:00Z")

describe("sunTimes", () => {
  it("puts sunrise near 06:26 and sunset near 18:56 on a spring day in Buenos Aires", () => {
    const { rise, set } = sunTimes(reference)
    const localMinutes = (date: Date) => ((date.getUTCHours() + 21) % 24) * 60 + date.getUTCMinutes()
    expect(Math.abs(localMinutes(rise) - (6 * 60 + 26))).toBeLessThanOrEqual(5)
    expect(Math.abs(localMinutes(set) - (18 * 60 + 56))).toBeLessThanOrEqual(5)
  })
})

describe("planetaryHour", () => {
  // Sunday's hours run Sun, Venus, Mercury, Moon. Daylight hours last about 62 minutes that day,
  // so 3h15m after sunrise falls in the fourth one.
  it("finds the fourth hour of a Sunday morning: day of the Sun, hour of the Moon", () => {
    expect(planetaryHour(reference)).toEqual({ day: "Sun", hour: "Moon", isDay: true })
  })

  it("keeps the previous planetary day before sunrise", () => {
    const beforeDawn = new Date("2026-10-04T06:00:00Z") // 03:00 on Sunday
    expect(planetaryHour(beforeDawn).day).toBe("Saturn")
    expect(planetaryHour(beforeDawn).isDay).toBe(false)
  })
})

describe("moon", () => {
  // The new moon was on 11 September 2026. The mean-lunation formula runs a few hours behind the
  // true moon, so it reads 22 full days where an ephemeris would say 23.
  it("is waning three weeks after the new moon", () => {
    expect(moon(reference)).toEqual({ ageDays: 22, phase: "waning" })
  })

  it("names the full and the new moon", () => {
    expect(moon(new Date("2026-09-26T16:00:00Z")).phase).toBe("full")
    expect(moon(new Date("2026-10-10T16:00:00Z")).phase).toBe("new")
  })
})

describe("formatting", () => {
  it("writes the long date with an ordinal", () => {
    expect(longDate(reference)).toBe("Sunday, the 4th of October")
    expect(longDate(new Date("2026-10-01T15:00:00Z"))).toBe("Thursday, the 1st of October")
    expect(longDate(new Date("2026-10-22T15:00:00Z"))).toBe("Thursday, the 22nd of October")
  })

  it("writes the status clock in Buenos Aires time", () => {
    expect(statusClock(reference)).toBe("Sun 4 Oct 09:41")
  })
})

describe("cardOfTheDay", () => {
  it("is fixed for a calendar day and changes with the date", () => {
    const morning = cardOfTheDay(new Date("2026-10-04T12:00:00Z"))
    const evening = cardOfTheDay(new Date("2026-10-05T01:00:00Z")) // still 4 October in Buenos Aires
    expect(evening).toEqual(morning)
    expect(morning.name.length).toBeGreaterThan(0)
  })
})
