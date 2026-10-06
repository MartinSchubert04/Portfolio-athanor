import { useMemo } from "react"
import { useGithub } from "@/hooks/useGithub"
import { contributionStats } from "@/lib/contributions"
import { GITHUB_PROFILE, type Commit, type GithubData } from "@/lib/github"
import { describeDay, Heatmap } from "./Heatmap"
import { Section } from "./Section"

const count = new Intl.NumberFormat("en")
const commitDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" })

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-1">
      <dt className="text-dim">{label}</dt>
      <dd className="display m-0 text-[72px] text-cream tabular-nums">{value}</dd>
    </div>
  )
}

function CommitLog({ commits, totalCommits }: { commits: Commit[]; totalCommits: number }) {
  if (commits.length === 0) {
    return (
      <p className="text-dim">
        The commit log could not be read right now. The full history lives on{" "}
        <a href={GITHUB_PROFILE} target="_blank" rel="noopener" className="link">
          GitHub
        </a>
        .
      </p>
    )
  }
  return (
    <>
      <ol className="m-0 flex list-none flex-col p-0">
        {commits.map((commit) => (
          <li key={commit.sha}>
            <a
              href={commit.url}
              target="_blank"
              rel="noopener"
              className="group grid grid-cols-[8ch_minmax(0,1fr)_auto] gap-x-2 py-1 hover:bg-clay"
            >
              <span className="text-amber" translate="no">
                {commit.sha.slice(0, 7)}
              </span>
              <span className="truncate text-cream group-hover:text-amber">
                <span className="text-tan" translate="no">
                  {commit.repo}:
                </span>{" "}
                {commit.message}
              </span>
              <time dateTime={commit.date} className="text-dim tabular-nums group-hover:text-tan">
                {commitDate.format(new Date(commit.date))}
              </time>
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-4">
        <a href={GITHUB_PROFILE} target="_blank" rel="noopener" className="link">
          All {count.format(totalCommits)} Commits on GitHub
        </a>
      </p>
    </>
  )
}

function LedgerBody({ data }: { data: GithubData }) {
  const stats = useMemo(() => contributionStats(data.days), [data.days])

  if (data.days.length === 0) {
    return <p className="text-dim">The ledger is empty: GitHub returned no contribution days.</p>
  }

  return (
    <>
      <Heatmap days={data.days} total={stats.total} />

      <div className="mt-16 grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <dl className="m-0 grid grid-cols-2 gap-x-8 gap-y-10">
          <Figure value={count.format(stats.total)} label="contributions in the last year" />
          <Figure value={count.format(stats.activeDays)} label="days with at least one" />
          <Figure value={count.format(stats.currentStreak)} label="days in the current streak" />
          <Figure value={count.format(stats.longestStreak)} label="days in the longest streak" />
        </dl>

        <div className="min-w-0">
          <h3 className="mb-4 text-dim">Latest Commits</h3>
          <CommitLog commits={data.commits} totalCommits={data.totalCommits} />
          {stats.busiest && <p className="mt-6 text-dim">Busiest day: {describeDay(stats.busiest)}.</p>}
        </div>
      </div>
    </>
  )
}

// Same footprint as the loaded ledger, so nothing jumps when the data lands
function LedgerSkeleton() {
  return (
    <div role="status" className="skeleton text-rule">
      <p className="text-dim">Reading the ledger…</p>
      <div aria-hidden="true" className="mt-4 overflow-hidden whitespace-nowrap">
        {Array.from({ length: 7 }, (_, row) => (
          <div key={row} className="h-[14px] leading-[14px]">
            {"░".repeat(96)}
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="mt-16 flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, row) => (
          <div key={row} className="truncate">
            {"░".repeat(7)} {"░".repeat(40 + ((row * 7) % 18))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Ledger() {
  const { state, retry } = useGithub()

  return (
    <Section id="ledger" title="Ledger">
      {state.status === "loading" && <LedgerSkeleton />}
      {state.status === "ready" && <LedgerBody data={state.data} />}
      {state.status === "error" && (
        <div role="alert" className="flex max-w-[60ch] flex-col items-start gap-6">
          <p className="text-cream">
            <span className="text-blood">The ravens did not return.</span> GitHub could not be reached ({state.message}).
            Anonymous requests are rate limited, so wait a minute and try again, or read the history on{" "}
            <a href={GITHUB_PROFILE} target="_blank" rel="noopener" className="link">
              GitHub
            </a>
            .
          </p>
          <button type="button" onClick={retry} className="clay clay-button text-cream">
            Try Again
          </button>
        </div>
      )}
    </Section>
  )
}
