import { useState, type FormEvent } from "react"
import { sections, site } from "@/data/site"

interface PromptProps {
  /** Draws the next plate and returns its caption. */
  onNextPlate: () => string
}

const HELP = `Words I know: ${sections
  .slice(1)
  .map((s) => s.id)
  .join(", ")}, resume, github, linkedin, plate.`

function walkTo(id: string) {
  document.getElementById(id)?.scrollIntoView()
  history.replaceState(null, "", `#${id}`)
}

/** The lock screen's "speak the word" field, turned into a small command line for the page. */
export function Prompt({ onNextPlate }: PromptProps) {
  const [reply, setReply] = useState("Try “help”.")

  const speak = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const word = String(new FormData(form).get("word") ?? "")
      .trim()
      .toLowerCase()
    form.reset()
    if (!word) return

    const section = sections.find((s) => s.id === word || s.label.toLowerCase() === word)
    if (section) {
      walkTo(section.id)
      setReply(`You walk to ${section.label}.`)
    } else if (word === "help" || word === "?") {
      setReply(HELP)
    } else if (word === "resume" || word === "cv") {
      const link = document.createElement("a")
      link.href = site.resume
      link.download = site.resumeFileName
      link.click()
      setReply("The resume is yours.")
    } else if (word === "github" || word === "linkedin") {
      window.open(site[word], "_blank", "noopener")
      setReply(`A door opens to ${word === "github" ? "GitHub" : "LinkedIn"}.`)
    } else if (word === "plate") {
      setReply(`A new plate: ${onNextPlate()}.`)
    } else if (word === "xyzzy") {
      setReply("Nothing happens.")
    } else {
      setReply(`Nothing answers to “${word}”. Try “help”.`)
    }
  }

  return (
    <form onSubmit={speak} className="flex flex-col gap-2">
      <label htmlFor="word">
        <span className="text-amber">@</span> visitor, speak the word:
      </label>
      <input
        id="word"
        name="word"
        type="text"
        className="prompt-input"
        placeholder="projects…"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        maxLength={32}
      />
      <p role="status" aria-live="polite" className="min-h-12 max-w-[48ch] text-dim sm:min-h-6">
        {reply}
      </p>
    </form>
  )
}
