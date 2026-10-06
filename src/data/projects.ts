import algoQuePedirColor from "@/assets/projects/algoQuePedir-color.webp"
import algoQuePedirDither from "@/assets/projects/algoQuePedir-dither.png"
import booklibreColor from "@/assets/projects/booklibre-color.webp"
import booklibreDither from "@/assets/projects/booklibre-dither.png"
import nnColor from "@/assets/projects/nn-color.webp"
import nnDither from "@/assets/projects/nn-dither.png"
import pongColor from "@/assets/projects/pong-color.webp"
import pongDither from "@/assets/projects/pong-dither.png"
import signpointColor from "@/assets/projects/signpoint-color.webp"
import signpointDither from "@/assets/projects/signpoint-dither.png"
import spaceStationColor from "@/assets/projects/space-station-color.webp"
import spaceStationDither from "@/assets/projects/space-station-dither.png"

export interface Project {
  id: string
  name: string
  description: string
  stack: string[]
  sourceLink: string
  webLink?: string
  dither: string
  color: string
}

// Screenshots are 640x400: a two-color plate and the original, cropped identically.
export const projects: Project[] = [
  {
    id: "space-station",
    name: "Space Station",
    description: "Real time solar system explorer using NASA APIs, in a retro style.",
    stack: ["React", "TypeScript"],
    sourceLink: "https://github.com/MartinSchubert04/space-station",
    webLink: "https://martinschubert04.github.io/space-station/",
    dither: spaceStationDither,
    color: spaceStationColor,
  },
  {
    id: "algo-que-pedir",
    name: "Algo que pedir",
    description:
      "Food ordering app for Algorithms II and III at UNSAM. Svelte and React frontends in TypeScript, over a Kotlin REST API with Spring Boot, JPA and PostgreSQL.",
    stack: ["Svelte", "React", "TypeScript", "Kotlin", "Spring Boot", "PostgreSQL"],
    sourceLink: "https://github.com/MartinSchubert04/algoQuePedir-client",
    dither: algoQuePedirDither,
    color: algoQuePedirColor,
  },
  {
    id: "booklibre",
    name: "Book libre",
    description:
      "Book lending app. React and TypeScript frontend, and a Kotlin REST API with Spring Boot and JPA on two databases: PostgreSQL and MongoDB.",
    stack: ["React", "TypeScript", "Kotlin", "Spring Boot", "PostgreSQL", "MongoDB"],
    sourceLink: "https://github.com/MartinSchubert04/Booklibre",
    dither: booklibreDither,
    color: booklibreColor,
  },
  {
    id: "signpoint",
    name: "Signpoint",
    description: "Automated Outlook and Gmail signatures.",
    stack: ["React", "TypeScript", "Python"],
    sourceLink: "https://github.com/MartinSchubert04/Signpoint",
    dither: signpointDither,
    color: signpointColor,
  },
  {
    id: "neural-network",
    name: "Neural Network",
    description: "Multiclass neural network written in C++, with an interactive UI to draw digits and watch it predict.",
    stack: ["C++"],
    sourceLink: "https://github.com/MartinSchubert04/NN",
    dither: nnDither,
    color: nnColor,
  },
  {
    id: "mobile-pong",
    name: "Mobile Pong",
    description: "Mobile game made in C++.",
    stack: ["C++", "Android Studio"],
    sourceLink: "https://github.com/MartinSchubert04/Pong",
    dither: pongDither,
    color: pongColor,
  },
]

export const PROJECT_IMAGE_SIZE = { width: 640, height: 400 }
