import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { loadGithub, type GithubData } from "@/lib/github"

export type GithubState =
  | { status: "loading" }
  | { status: "ready"; data: GithubData }
  | { status: "error"; message: string }

interface GithubContextValue {
  state: GithubState
  retry: () => void
}

const GithubContext = createContext<GithubContextValue>({ state: { status: "loading" }, retry: () => {} })

// One fetch feeds the raven in the top bar, the sigil, the status bar and the ledger.
export function GithubProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GithubState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    loadGithub(controller.signal, { fresh: attempt > 0 })
      .then((data) => setState({ status: "ready", data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: "error", message: error instanceof Error ? error.message : "Unknown error" })
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: "loading" })
    setAttempt((n) => n + 1)
  }, [])

  return <GithubContext value={{ state, retry }}>{children}</GithubContext>
}

export function useGithub() {
  return useContext(GithubContext)
}
