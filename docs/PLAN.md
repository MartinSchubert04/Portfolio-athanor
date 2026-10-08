# Plan

Plan de construcción del portfolio. Cada fase tiene un objetivo, qué skill la guía, qué entrega y
cómo se verifica. El formato sirve de plantilla para otros proyectos: copiar la tabla de fases y
reemplazar el contenido.

## Objetivo

Rehacer el portfolio de [MartinSchubert04/Portfolio](https://github.com/MartinSchubert04/Portfolio)
con la identidad del tema de terminal athanor, conservando el contenido (carrera, skills, proyectos,
contribuciones de GitHub) y sumándole personalidad.

**Hecho significa:** el sitio corre con `npm run dev`, `lint`, `test` y `build` pasan, se ve bien a
1366x768 y a 390x844, y las dos auditorías de `docs/design/preflight.md` están corridas.

## Insumos

| Insumo | De dónde sale |
|---|---|
| Contenido | CV vigente (`src/assets/MartinSchubert.pdf`) para carrera, skills y descripción de proyectos; `src/data/*.data.ts` del portfolio anterior para links y capturas |
| Paleta, fuente, receta de dithering, lógica del almanaque | `config-files/athanor` (tema de terminal del usuario) |
| Dirección visual | Dos capturas de referencia, en `docs/design/refs/` |
| Reglas de diseño | Skills en `.claude/skills/` |

## Fases

| # | Fase | Skill o guía | Entrega | Verificación | Estado |
|---|---|---|---|---|---|
| 0 | Relevamiento | - | Datos del portfolio viejo, config de athanor, skills leídas | Las APIs de GitHub responden con el usuario real | Hecho |
| 1 | Lectura del brief y diales | `design-taste-frontend` §0-1 | Lectura en una línea, diales 7 / 4 / 3 | Escrita en `docs/design/reference-analysis.md` | Hecho |
| 2 | Análisis de referencias | `image-to-code` §8-9, 21-25 | Tabla "qué se ve / dónde quedó" por imagen | Cada rasgo de las capturas tiene destino en el sitio | Hecho |
| 3 | Sistema de diseño | awesome-design-md | `DESIGN.md`, nueve secciones | Los tokens de `src/index.css` coinciden con la tabla de colores | Hecho |
| 4 | Pipeline de imágenes | receta de athanor | `scripts/make-plates.ps1`, 8 grabados y 6 capturas tramadas | Hoja de contacto revisada a ojo; el hero pesa menos de 11 kB | Hecho |
| 5 | Lógica | - | `src/lib`: almanaque, contribuciones, GitHub, sigilo | 14 tests de vitest | Hecho |
| 6 | Estructura y barras | `DESIGN.md` §4-5 | `TopBar`, `StatusBar`, `Section`, tokens y `.clay` | `tsc -b` y `eslint` limpios | Hecho |
| 7 | Secciones | `DESIGN.md` §5 | Hero, Career, Skills, Projects, Ledger, Contact | Capturas a 1366x768 y 390x844 | Hecho |
| 8 | Estados e interacción | `design-taste-frontend` §4.5 | Skeleton, error con reintento, prompt, tabs con teclado | Probado en headless: comandos del prompt, flechas en tabs, fetch forzado a fallar | Hecho |
| 9 | Auditoría | `design-taste-frontend` §14, `web-design-guidelines` | `docs/design/preflight.md` | Cada fila tiene estado; los desvíos están en `CLAUDE.md` | Hecho |
| 10 | Deploy | - | `.github/workflows/deploy.yml` | `npm run build` genera `dist/` con rutas relativas | Workflow escrito, sin ejecutar |
| 11 | Copy formal | `DESIGN.md` §5 | Ficha de Skills con etiquetas profesionales (`Profile`: Role, Companies, Education, Location); Contact sin párrafo de créditos | `lint`, `test` y `build` pasan | Hecho |
| 12 | Paletas | `DESIGN.md` §2 | Umber, Vellum, Orpiment y Cinnabar de athanor en `src/index.css`; `src/lib/palette.ts`, `usePalette`, botón `Tint` y comando del prompt | `lint`, `test` y `build` pasan; capturas a 1366x768 del hero con las cinco paletas. Sin correr las auditorías de las skills | Hecho, falta auditar |
| 13 | Manos con scroll (prueba) | `DESIGN.md` §4 Plates | `.plate-hands` en `src/index.css` y `Skills.tsx`: el grabado se dibuja dos veces, recortado por mano, y las manos se acercan con `animation-timeline` en 16 pasos. Contact sin la carta del día y con el texto centrado contra el grabado | `lint`, `test` y `build` pasan; capturas en Chrome headless a 1366x768 en tres posiciones de scroll y de Contact. Sin probar en teléfono ni en Firefox (ahí queda fija) | Prueba, a decidir si queda el giro 3D |

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Vite + React 19 + TypeScript + Tailwind v4 | Next.js | Es el stack del portfolio anterior y el sitio es una sola página estática para GitHub Pages |
| Sin router | `react-router` | Una página; las secciones son anclas y el proyecto elegido va en el query string |
| `fetch` nativo | `axios` | Dos pedidos GET no justifican la dependencia |
| Commits por la API de búsqueda de GitHub | API de eventos | Un solo pedido trae mensaje, repo, fecha y SHA de los últimos commits de todos los repos públicos |
| Calendario por `github-contributions-api.jogruber.de` | GraphQL de GitHub | Es la que ya usaba el portfolio anterior y no necesita token |
| Caché de 30 minutos en `localStorage` | Sin caché | La búsqueda anónima permite 10 pedidos por minuto por IP |
| Imágenes pre-tramadas con ImageMagick | Dithering en canvas en el navegador | Cero JavaScript para arte, archivos de menos de 11 kB, misma receta que la terminal |
| Imágenes a tamaño natural, recortadas por el marco | `object-fit: cover` | Escalar un tramado lo ensucia |
| Animación con CSS `steps()` | Motion | El movimiento por pasos es parte de la estética y no necesita librería |
| Sin íconos | Phosphor | Ver desvíos en `CLAUDE.md` |
| Paletas por tokens CSS en `:root[data-palette]` | Un juego de imágenes por paleta | Los PNG son de un color sobre transparente; un filtro SVG los retiñe y no hay que regenerar arte |

## Ideas propias sumadas al contenido original

- **El cuervo.** La barra superior anuncia el último commit público como mensaje de juego de texto.
- **Sigilo del último commit.** El identicon del hero se dibuja con el SHA del commit más reciente.
- **Ledger tramado.** El calendario de contribuciones codifica la intensidad como densidad de dithering.
- **Cifras derivadas.** Días activos, racha actual, racha más larga y día más cargado, calculados de los datos.
- **Prompt.** El campo "speak the word" del lock screen navega el sitio por comandos.
- **Revelar la placa.** Las capturas de proyectos arrancan tramadas y muestran el original al pedirlo.
- **Almanaque.** Hora planetaria y luna, portados de `splash.ps1`. La carta del día se sacó de Contact en la fase 13; `cardOfTheDay` sigue en `src/lib/almanac.ts`.
- **Baraja de grabados.** El grabado del hero rota sin repetir hasta agotar la serie, como en el splash.

## Próximos pasos

1. Crear el repo remoto, hacer push y activar GitHub Pages sobre la rama `build`.
2. Correr Lighthouse y probar en un teléfono real; anotar el resultado en `preflight.md`.
3. Imagen Open Graph (el grabado del hero con el nombre) y `preload` de la fuente.
4. Sumar más grabados: dejar el original en `art/plates/`, correr `npm run plates`, registrarlo en `src/data/plates.ts`.
