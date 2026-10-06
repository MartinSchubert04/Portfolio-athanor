import { sections, type SectionId } from "@/data/site"
import { useGithub } from "@/hooks/useGithub"

/** Message line of the terminal: the latest commit arrives by raven, the rest of the bar is the nav. */
export function TopBar({ active }: { active: SectionId }) {
  const { state } = useGithub()
  const lastCommit = state.status === "ready" ? state.data.commits[0] : undefined

  return (
    <header className="fixed inset-x-0 top-0 z-(--z-index-bars) border-b-2 border-rule bg-ink pt-[env(safe-area-inset-top)]">
      <div className="shell flex h-10 items-center gap-6">
        <a href="#top" className="hidden shrink-0 text-amber hover:text-cream sm:block" translate="no">
          @ martin
        </a>

        <p className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
          {lastCommit ? (
            <>
              <span className="shrink-0 text-dim">A raven arrives:</span>
              <a href={lastCommit.url} target="_blank" rel="noopener" className="min-w-0 truncate text-cream hover:text-amber">
                <span translate="no">{lastCommit.repo}</span>, {lastCommit.message}
              </a>
              <a href="#ledger" className="shrink-0 bg-tan px-1 text-ink hover:bg-cream">
                --More--
              </a>
            </>
          ) : (
            <span className="text-dim">
              {state.status === "loading" ? "Waiting for a raven…" : "No raven today."}
            </span>
          )}
        </p>

        <nav aria-label="Sections" className="ml-auto flex shrink-0 gap-3 sm:gap-5">
          {sections.slice(1).map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              className="text-tan hover:text-cream aria-[current]:text-amber"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
