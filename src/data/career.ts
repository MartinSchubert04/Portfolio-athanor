export interface CareerEntry {
  id: string
  name: string
  title: string
  period: string
  place: string
  achievements: string[]
  stack: string[]
  exits: { label: string; href: string }[]
}

// Source: the resume in src/assets/MartinSchubert.pdf. Keep both in sync.
export const career: CareerEntry[] = [
  {
    id: "correo-argentino",
    name: "Correo Argentino",
    title: "Site Reliability Engineer (external)",
    period: "Jan 2026 - Today",
    place: "Buenos Aires, Argentina",
    achievements: [
      "Administer OpenShift (Kubernetes) clusters in production: namespaces, RBAC, network policies, secrets and configmaps.",
      "Run observability and monitoring with Prometheus, Grafana and Nagios, and analyze centralized logs with Elasticsearch.",
    ],
    stack: ["OpenShift", "Kubernetes", "Prometheus", "Grafana", "Nagios", "Elasticsearch"],
    exits: [{ label: "Website", href: "https://www.correoargentino.com.ar/" }],
  },
  {
    id: "dc-solutions",
    name: "DC Solutions",
    title: "Software Developer",
    period: "Jan 2025 - Today",
    place: "Buenos Aires, Argentina",
    achievements: [
      "Build web apps that integrate with Microsoft Exchange: a React frontend and a Python (FastAPI) API for automated Outlook signature management.",
      "Automate processes and service administration with PowerShell and Python.",
      "Administer corporate infrastructure and networks: Active Directory, GPO, Fortinet devices (firewall, VPN, NAT) and managed switches.",
      "Monitor services and infrastructure with Zabbix, Nagios and Datadog.",
    ],
    stack: ["React", "TypeScript", "Python", "FastAPI", "PowerShell"],
    exits: [
      { label: "Website", href: "https://dcs.ar" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/dc-solutions" },
    ],
  },
  {
    id: "unsam-electronics",
    name: "UNSAM, Engineering",
    title: "Electronic Engineering",
    period: "2026 - Today, in progress",
    place: "San Martín, Buenos Aires",
    achievements: [
      "Currently studying Electronic Engineering at Universidad Nacional de San Martín, started right after graduating in programming.",
    ],
    stack: [],
    exits: [
      { label: "Website", href: "https://www.unsam.edu.ar/" },
      { label: "Course notes", href: "https://github.com/MartinSchubert04/Ingenieria-Electronica" },
    ],
  },
  {
    id: "unsam-programming",
    name: "UNSAM, Programming",
    title: "Technical Degree in Computer Programming",
    period: "2022 - 2026, graduated",
    place: "San Martín, Buenos Aires",
    achievements: [
      "Graduated from the programming degree at Universidad Nacional de San Martín, with two full-stack team projects along the way: a food ordering app and a book lending app.",
    ],
    stack: ["Kotlin", "Spring Boot", "React", "Svelte", "TypeScript", "PostgreSQL", "MongoDB"],
    exits: [{ label: "Website", href: "https://www.unsam.edu.ar/" }],
  },
]
