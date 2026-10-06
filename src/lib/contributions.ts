export interface ContributionDay {
  date: string // YYYY-MM-DD
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface HeatmapCell extends ContributionDay {
  week: number
  weekday: number // 0 = Sunday
}

export interface MonthLabel {
  week: number
  label: string
}

const DAY_MS = 86_400_000

// Dates are plain calendar days; parsing them as UTC keeps weekdays stable in every time zone.
const utc = (date: string) => new Date(`${date}T00:00:00Z`)

export function sortDays(days: ContributionDay[]): ContributionDay[] {
  return [...days].sort((a, b) => a.date.localeCompare(b.date))
}

/** Places each day on a week column / weekday row grid, the first column starting on Sunday. */
export function toCells(days: ContributionDay[]): HeatmapCell[] {
  const sorted = sortDays(days)
  if (sorted.length === 0) return []
  const first = utc(sorted[0].date)
  const gridStart = first.getTime() - first.getUTCDay() * DAY_MS
  return sorted.map((day) => {
    const date = utc(day.date)
    return { ...day, week: Math.floor((date.getTime() - gridStart) / (7 * DAY_MS)), weekday: date.getUTCDay() }
  })
}

const monthFormat = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" })

/** One label per month, on the first week column where that month appears. */
export function monthLabels(cells: HeatmapCell[]): MonthLabel[] {
  const labels: MonthLabel[] = []
  let lastMonth = -1
  for (const cell of cells) {
    const date = utc(cell.date)
    const month = date.getUTCMonth()
    if (month === lastMonth) continue
    lastMonth = month
    // A month that starts on the grid's last days of a column would crowd the previous label
    if (labels.length > 0 && cell.week - labels[labels.length - 1].week < 3) continue
    labels.push({ week: cell.week, label: monthFormat.format(date) })
  }
  return labels
}

export interface ContributionStats {
  total: number
  activeDays: number
  currentStreak: number
  longestStreak: number
  busiest: ContributionDay | null
}

export function contributionStats(days: ContributionDay[]): ContributionStats {
  const sorted = sortDays(days)
  let total = 0
  let activeDays = 0
  let longestStreak = 0
  let run = 0
  let busiest: ContributionDay | null = null
  for (const day of sorted) {
    total += day.count
    if (day.count > 0) {
      activeDays++
      run++
      longestStreak = Math.max(longestStreak, run)
      if (!busiest || day.count > busiest.count) busiest = day
    } else {
      run = 0
    }
  }

  // Today may simply not have happened yet: an empty last day does not break the streak.
  let end = sorted.length - 1
  if (end >= 0 && sorted[end].count === 0) end--
  let currentStreak = 0
  while (end >= 0 && sorted[end].count > 0) {
    currentStreak++
    end--
  }

  return { total, activeDays, currentStreak, longestStreak, busiest }
}
