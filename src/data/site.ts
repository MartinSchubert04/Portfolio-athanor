import resume from "@/assets/MartinSchubert.pdf?url"
import { GITHUB_PROFILE } from "@/lib/github"

export const site = {
  name: "Martin Schubert",
  pitch: "Fullstack developer in Buenos Aires. I build web apps end to end, and neural networks in C++ for fun.",
  resume,
  resumeFileName: "MartinSchubert.pdf",
  email: "tinchoschubert04429@gmail.com",
  linkedin: "https://www.linkedin.com/in/martin-schubert-44b842240/",
  github: GITHUB_PROFILE,
}

// Order here is the order on the page; the status bar reports it as the dungeon level.
export const sections = [
  { id: "top", label: "Scriptorium" },
  { id: "career", label: "Career" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "ledger", label: "Ledger" },
  { id: "contact", label: "Contact" },
] as const

export type SectionId = (typeof sections)[number]["id"]
