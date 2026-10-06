import { useRef, useState, type KeyboardEvent } from "react"
import { PROJECT_IMAGE_SIZE, projects } from "@/data/projects"
import { Section } from "./Section"

const PARAM = "project"

function initialProject(): string {
  const fromUrl = new URLSearchParams(location.search).get(PARAM)
  return projects.some((p) => p.id === fromUrl) ? fromUrl! : projects[0].id
}

/** A file browser: the list on the left selects, the pane on the right shows the plate and the facts. */
export function Projects() {
  const [selectedId, setSelectedId] = useState(initialProject)
  const [developed, setDeveloped] = useState(false)
  const tabs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const selected = projects.find((p) => p.id === selectedId) ?? projects[0]

  const select = (id: string) => {
    setSelectedId(id)
    setDeveloped(false)
    // The selection is shareable: it lives in the query string, next to the section hash
    const url = new URL(location.href)
    url.searchParams.set(PARAM, id)
    history.replaceState(null, "", url)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = projects.findIndex((p) => p.id === selectedId)
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? (index + 1) % projects.length
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? (index - 1 + projects.length) % projects.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? projects.length - 1
              : -1
    if (next < 0) return
    event.preventDefault()
    select(projects[next].id)
    tabs.current.get(projects[next].id)?.focus()
  }

  return (
    <Section id="projects" title="Projects">
      <div className="grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,664px)]">
        <div role="tablist" aria-label="Projects" aria-orientation="vertical" onKeyDown={onKeyDown} className="flex flex-col">
          {projects.map((project) => {
            const isSelected = project.id === selected.id
            return (
              <button
                key={project.id}
                ref={(element) => {
                  if (element) tabs.current.set(project.id, element)
                  else tabs.current.delete(project.id)
                }}
                type="button"
                role="tab"
                id={`tab-${project.id}`}
                aria-selected={isSelected}
                aria-controls="project-panel"
                tabIndex={isSelected ? 0 : -1}
                onClick={() => {
                  select(project.id)
                  // On one-column layouts the pane sits below the list: bring it into view
                  document.getElementById("project-panel")?.scrollIntoView({ block: "nearest" })
                }}
                className="group grid cursor-pointer grid-cols-[3ch_minmax(0,1fr)] py-2 text-left"
              >
                <span className={isSelected ? "text-amber" : "text-transparent group-hover:text-dim"} aria-hidden="true">
                  ►
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-[32px] leading-10 ${isSelected ? "text-amber" : "text-tan group-hover:text-cream"}`}
                  >
                    {project.name}
                  </span>
                  <span className="block truncate text-dim">{project.stack.join(", ")}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id="project-panel"
          aria-labelledby={`tab-${selected.id}`}
          tabIndex={0}
          className="clay mr-2 mb-2 min-w-0 p-3"
        >
          <div
            className="develop plate-frame w-full bg-ink"
            data-developed={developed}
            style={{ aspectRatio: `${PROJECT_IMAGE_SIZE.width} / ${PROJECT_IMAGE_SIZE.height}`, maxHeight: PROJECT_IMAGE_SIZE.height }}
          >
            <img
              key={selected.dither}
              src={selected.dither}
              alt={`${selected.name}, screenshot as a two-color dithered plate`}
              {...PROJECT_IMAGE_SIZE}
              loading="lazy"
              decoding="async"
            />
            <img
              key={selected.color}
              src={selected.color}
              alt=""
              {...PROJECT_IMAGE_SIZE}
              loading="lazy"
              decoding="async"
              className="develop-color"
            />
            <div key={selected.id} className="plate-cover" aria-hidden="true" />
          </div>

          <div className="flex flex-col gap-4 px-2 pt-5 pb-3">
            <p className="max-w-[60ch] text-cream">{selected.description}</p>
            <p className="text-tan">
              <span className="text-cream">Made with:</span> {selected.stack.join(", ")}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a href={selected.sourceLink} target="_blank" rel="noopener" className="link">
                Source Code
              </a>
              {selected.webLink && (
                <a href={selected.webLink} target="_blank" rel="noopener" className="link">
                  Live Site
                </a>
              )}
              <button
                type="button"
                aria-pressed={developed}
                onClick={() => setDeveloped((d) => !d)}
                className="ml-auto cursor-pointer text-tan underline decoration-2 underline-offset-4 hover:text-cream"
              >
                {developed ? "Show Plate" : "Develop Plate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
