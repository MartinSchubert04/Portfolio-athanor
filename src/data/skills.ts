export interface Skill {
  name: string
  link: string
}

export interface SkillGroup {
  name: string
  skills: Skill[]
}

// Source: "Habilidades técnicas" in the resume, same groups and order.
export const skillGroups: SkillGroup[] = [
  {
    name: "Frontend",
    skills: [
      { name: "React", link: "https://react.dev/" },
      { name: "Svelte", link: "https://svelte.dev/" },
      { name: "TypeScript", link: "https://www.typescriptlang.org/" },
    ],
  },
  {
    name: "Backend",
    skills: [
      { name: "Spring Boot", link: "https://spring.io/projects/spring-boot" },
      { name: "FastAPI", link: "https://fastapi.tiangolo.com/" },
    ],
  },
  {
    name: "Languages",
    skills: [
      { name: "Python", link: "https://www.python.org/" },
      { name: "Kotlin", link: "https://kotlinlang.org/" },
      { name: "C/C++", link: "https://en.cppreference.com/" },
      { name: "C#", link: "https://learn.microsoft.com/en-us/dotnet/csharp/" },
    ],
  },
  {
    name: "DevOps & Containers",
    skills: [
      { name: "Docker", link: "https://www.docker.com/" },
      { name: "OpenShift", link: "https://www.redhat.com/en/technologies/cloud-computing/openshift" },
      { name: "Kubernetes", link: "https://kubernetes.io/" },
      { name: "CI/CD", link: "https://docs.github.com/en/actions" },
      { name: "Git", link: "https://git-scm.com/" },
    ],
  },
  {
    name: "Infrastructure",
    skills: [
      { name: "Hyper-V", link: "https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/" },
      { name: "VMware vCenter", link: "https://www.vmware.com/products/cloud-infrastructure/vcenter" },
      { name: "Active Directory", link: "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/" },
      { name: "Fortinet", link: "https://www.fortinet.com/" },
    ],
  },
  {
    name: "Monitoring",
    skills: [
      { name: "Prometheus", link: "https://prometheus.io/" },
      { name: "Grafana", link: "https://grafana.com/" },
      { name: "Elasticsearch", link: "https://www.elastic.co/elasticsearch" },
      { name: "Datadog", link: "https://www.datadoghq.com/" },
      { name: "Zabbix", link: "https://www.zabbix.com/" },
      { name: "Nagios", link: "https://www.nagios.org/" },
    ],
  },
  {
    name: "Databases",
    skills: [
      { name: "PostgreSQL", link: "https://www.postgresql.org/" },
      { name: "MongoDB", link: "https://www.mongodb.com/" },
    ],
  },
]

// Character sheet, in the spirit of the terminal splash. Every value is a plain fact.
export const sheet: { key: string; value: string }[] = [
  { key: "Class", value: "Fullstack developer, SRE" },
  { key: "Guilds", value: "Correo Argentino, DC Solutions" },
  { key: "School", value: "UNSAM" },
  { key: "Realm", value: "Buenos Aires, Argentina" },
]
