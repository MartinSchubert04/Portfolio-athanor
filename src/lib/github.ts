import type { ContributionDay } from "./contributions"

export const GITHUB_USER = "MartinSchubert04"
export const GITHUB_PROFILE = `https://github.com/${GITHUB_USER}`

export interface Commit {
  sha: string
  message: string // first line only
  repo: string
  url: string
  date: string // ISO
}

export interface GithubData {
  days: ContributionDay[]
  commits: Commit[]
  totalCommits: number
}

// The commit search API allows 10 anonymous requests per minute per IP, so results are kept for a while.
const CACHE_KEY = "athanor:github:v1"
const CACHE_TTL_MS = 30 * 60_000

interface CacheEntry {
  savedAt: number
  data: GithubData
}

function readCache(): GithubData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    return Date.now() - entry.savedAt < CACHE_TTL_MS ? entry.data : null
  } catch {
    return null
  }
}

function writeCache(data: GithubData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data } satisfies CacheEntry))
  } catch {
    // Storage can be full or blocked; the page works without it
  }
}

async function getJson<T>(url: string, signal: AbortSignal, headers?: HeadersInit): Promise<T> {
  const response = await fetch(url, { signal, headers })
  if (!response.ok) throw new Error(`${new URL(url).hostname} answered ${response.status}`)
  return response.json() as Promise<T>
}

interface ContributionsResponse {
  contributions: ContributionDay[]
}

async function fetchContributions(signal: AbortSignal): Promise<ContributionDay[]> {
  const data = await getJson<ContributionsResponse>(
    `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
    signal,
  )
  return data.contributions
}

interface CommitSearchResponse {
  total_count: number
  items: {
    sha: string
    html_url: string
    commit: { message: string; author: { date: string } }
    repository: { name: string }
  }[]
}

async function fetchCommits(signal: AbortSignal): Promise<{ commits: Commit[]; totalCommits: number }> {
  const query = new URLSearchParams({ q: `author:${GITHUB_USER}`, sort: "author-date", order: "desc", per_page: "6" })
  const data = await getJson<CommitSearchResponse>(`https://api.github.com/search/commits?${query}`, signal, {
    Accept: "application/vnd.github+json",
  })
  return {
    totalCommits: data.total_count,
    commits: data.items.map((item) => ({
      sha: item.sha,
      message: item.commit.message.split("\n")[0],
      repo: item.repository.name,
      url: item.html_url,
      date: item.commit.author.date,
    })),
  }
}

export async function loadGithub(signal: AbortSignal, { fresh = false } = {}): Promise<GithubData> {
  if (!fresh) {
    const cached = readCache()
    if (cached) return cached
  }
  // The calendar is the core of the ledger. The commit search has the tighter rate limit, so when
  // only that one fails the page still shows the calendar, with an empty log, and nothing is cached.
  const [days, commitSearch] = await Promise.all([
    fetchContributions(signal),
    fetchCommits(signal).catch(() => null),
  ])
  const data = { days, commits: commitSearch?.commits ?? [], totalCommits: commitSearch?.totalCommits ?? 0 }
  if (commitSearch) writeCache(data)
  return data
}
