import { describe, expect, it } from "vitest"
import { contributionStats, monthLabels, toCells, type ContributionDay } from "./contributions"

const day = (date: string, count: number): ContributionDay => ({
  date,
  count,
  level: Math.min(4, count) as ContributionDay["level"],
})

describe("toCells", () => {
  it("starts the grid on the Sunday before the first day", () => {
    // 2026-10-01 is a Thursday
    const cells = toCells([day("2026-10-01", 1), day("2026-10-03", 0), day("2026-10-04", 2)])
    expect(cells.map((c) => [c.week, c.weekday])).toEqual([
      [0, 4],
      [0, 6],
      [1, 0],
    ])
  })

  it("sorts unordered input", () => {
    const cells = toCells([day("2026-10-04", 2), day("2026-10-01", 1)])
    expect(cells[0].date).toBe("2026-10-01")
  })
})

describe("monthLabels", () => {
  it("labels the first column of each month", () => {
    const days = Array.from({ length: 62 }, (_, i) => {
      const date = new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10)
      return day(date, 0)
    })
    expect(monthLabels(toCells(days)).map((l) => l.label)).toEqual(["Sep", "Oct", "Nov"])
  })
})

describe("contributionStats", () => {
  it("counts totals, streaks and the busiest day", () => {
    const stats = contributionStats([
      day("2026-09-28", 3),
      day("2026-09-29", 1),
      day("2026-09-30", 0),
      day("2026-10-01", 2),
      day("2026-10-02", 7),
      day("2026-10-03", 1),
    ])
    expect(stats.total).toBe(14)
    expect(stats.activeDays).toBe(5)
    expect(stats.longestStreak).toBe(3)
    expect(stats.currentStreak).toBe(3)
    expect(stats.busiest?.date).toBe("2026-10-02")
  })

  it("does not break the current streak on an empty today", () => {
    const stats = contributionStats([day("2026-10-01", 2), day("2026-10-02", 1), day("2026-10-03", 0)])
    expect(stats.currentStreak).toBe(2)
  })

  it("handles an empty year", () => {
    expect(contributionStats([])).toEqual({ total: 0, activeDays: 0, currentStreak: 0, longestStreak: 0, busiest: null })
  })
})
