# Skills del proyecto

Skills de terceros instaladas a nivel proyecto. Claude Code las descubre solas por estar en
`.claude/skills/<nombre>/SKILL.md`; el nombre de la carpeta coincide con el `name` del frontmatter.

Se copian tal cual, sin editar. Si hace falta cambiar un comportamiento, la regla va en `CLAUDE.md`
(sección "Desvíos acordados"), no dentro de la skill: así actualizar es volver a copiar el archivo.

| Skill | Origen | Versión copiada | Licencia | Cuándo se usa |
|---|---|---|---|---|
| `design-taste-frontend` | [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) `skills/taste-skill/SKILL.md` | commit `ce26fc2` (2026-09-26) | MIT, ver `design-taste-frontend/LICENSE` | Antes de diseñar o tocar UI: lectura del brief, diales, y el pre-flight check antes de dar algo por terminado |
| `image-to-code` | [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) `skills/image-to-code-skill/SKILL.md` | commit `ce26fc2` (2026-09-26) | MIT | Cuando hay imágenes de referencia: análisis profundo de la imagen antes de escribir código |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `skills/web-design-guidelines/SKILL.md` | `main` al 2026-10-06 | la del repo de origen | Auditoría final de accesibilidad y UX. Baja las reglas vigentes cada vez que corre |

## Lo que no es una skill

[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) no trae una skill: es una
colección de archivos `DESIGN.md` y la convención para escribirlos (formato Stitch, nueve secciones).
En este repo se usa como formato: el `DESIGN.md` de la raíz lo sigue sección por sección.

## Actualizar una skill

```powershell
git clone --depth 1 https://github.com/leonxlnx/taste-skill $env:TEMP\taste-skill
Copy-Item $env:TEMP\taste-skill\skills\taste-skill\SKILL.md .claude\skills\design-taste-frontend\SKILL.md
Copy-Item $env:TEMP\taste-skill\skills\image-to-code-skill\SKILL.md .claude\skills\image-to-code\SKILL.md
Invoke-WebRequest https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/web-design-guidelines/SKILL.md `
    -OutFile .claude\skills\web-design-guidelines\SKILL.md
```

Después de actualizar: anotar el commit nuevo en la tabla y volver a correr la auditoría
(`docs/design/preflight.md`), porque las reglas pueden haber cambiado.
