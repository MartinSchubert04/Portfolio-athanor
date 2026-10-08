# CLAUDE.md

Portfolio de Martin Schubert con la estética de su tema de terminal athanor: paleta Srcery, fuente
IBM VGA, grabados de dominio público pasados a dos colores con dithering, y superficies de "pixel clay".

## Dónde está cada decisión

| Pregunta | Archivo |
|---|---|
| Cómo tiene que verse algo (colores, tipografía, componentes, qué no hacer) | `DESIGN.md` |
| Qué se construyó, en qué orden y cómo se verificó cada fase | `docs/PLAN.md` |
| De dónde sale el diseño (análisis de las imágenes de referencia) | `docs/design/reference-analysis.md` |
| Resultado de las auditorías de las skills y los desvíos | `docs/design/preflight.md` |
| Qué skills hay, de dónde vienen y cómo se actualizan | `.claude/skills/README.md` |

`DESIGN.md` manda sobre el código: si un cambio visual contradice ese archivo, primero se cambia el archivo.

## Comandos

```powershell
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # typecheck (tsc -b) + build de producción en dist/
npm run lint     # eslint
npm test         # vitest, tests de src/lib
npm run plates   # regenera las imágenes tramadas desde art/ (necesita ImageMagick)
npm run model    # regenera src/assets/models/hands.bin desde art/models/
```

Antes de dar un cambio por terminado: `npm run lint`, `npm test` y `npm run build` tienen que pasar.

## Estructura

```
art/                 originales: grabados (plates/), capturas de proyectos (screens/) y el modelo 3D (models/)
scripts/             make-plates.ps1, el pipeline de dithering con ImageMagick; make-hands-model.mjs
src/assets/          salida del pipeline, fuente VGA y el CV. No editar imágenes a mano
src/data/            contenido: career, projects, skills, plates, site. Es lo único que cambia al actualizar el CV
src/lib/             lógica pura y testeada: almanac, contributions, github, sigil, plateDeck
src/hooks/           useGithub (un fetch para toda la página), useNow, useActiveSection
src/components/      una sección por archivo, más las piezas compartidas (Section, PlateFigure, Reveal, Sigil)
src/index.css        tokens (@theme) y las clases de componente (.clay, .plate-frame, .dither-band)
```

## Flujo de trabajo con skills

Para cualquier cambio de UI, en este orden:

1. **Leer `DESIGN.md`.** Define tokens, componentes y prohibiciones. No inventar colores ni radios.
2. **`design-taste-frontend`**, sección 0: declarar la lectura del brief en una línea antes de tocar código.
3. **`image-to-code`**, si el cambio parte de una imagen: analizarla (texto, tipografía, espaciado,
   color, componentes) y dejar el análisis en `docs/design/`. Este entorno no genera imágenes; las
   referencias las da el usuario y el "sistema de imágenes" del sitio sale de `scripts/make-plates.ps1`.
4. Implementar.
5. **`design-taste-frontend`**, sección 14: correr el pre-flight check completo.
6. **`web-design-guidelines`**: auditar los archivos tocados.
7. Anotar en `docs/design/preflight.md` lo que cambió en la auditoría, y en `docs/PLAN.md` la fase.

## Desvíos acordados

Reglas de las skills que este proyecto incumple a propósito. No "corregirlas" sin que el usuario lo pida.

| Regla | Qué hace el proyecto | Por qué |
|---|---|---|
| taste 6.C / 8: modo claro y oscuro | Cinco paletas que elige el visitante (tres oscuras, dos claras), sin seguir `prefers-color-scheme` | La identidad es un tema de terminal con paletas propias; Srcery, oscura, es la de entrada |
| taste 9.F: sin tiras de hora, lugar o clima | Barra de estado con hora de Buenos Aires, hora planetaria y luna | Está en las dos imágenes de referencia; es el rasgo que define athanor |
| taste 4.7: máximo 4 elementos de texto en el hero | El hero suma sigilo, almanaque y prompt | Es la composición de la pantalla de bloqueo de referencia |
| taste 4.1: serif muy desaconsejada | Jacquard 24 (blackletter) en títulos | Es la fuente del reloj del splash de athanor; el brief nombra esa estética |
| taste 3.A: Motion para animar | CSS con `steps()` e IntersectionObserver | El movimiento es por pasos, como un redibujado de terminal; no hace falta la librería |
| taste 3.C: librería de íconos | Sin íconos; solo glifos de la fuente VGA | Un ícono vectorial rompe la grilla de píxeles |
| image-to-code 2: generar imágenes primero | Se analizan las referencias del usuario | No hay herramienta de generación de imágenes en el entorno |

## Convenciones de código

- TypeScript estricto, sin `any`. Prettier según `.prettierrc` (sin punto y coma, 120 columnas).
- Imports con el alias `@/` (apunta a `src/`).
- Los textos visibles van en inglés; documentación y comentarios de scripts, en español.
- Nada de em-dash ni en-dash en texto visible. Tres puntos como `…`. Comillas tipográficas.
- Fechas y números con `Intl.*`, nunca formateados a mano.
- Las imágenes tramadas se muestran a tamaño natural (`object-fit: none`) y el marco las recorta. No escalarlas.
- Solo se anima `transform` y `opacity`, siempre dentro de `@media (prefers-reduced-motion: no-preference)`.

## Principios de trabajo

1. **Pensar antes de codear.** Explicitar supuestos; si hay dos lecturas posibles, mostrarlas en vez de elegir en silencio.
2. **Simplicidad primero.** El mínimo código que resuelve lo pedido. Sin abstracciones para un solo uso.
3. **Cambios quirúrgicos.** Tocar solo lo necesario; cada línea cambiada se explica por el pedido.
4. **Ejecución por objetivos.** Cada paso tiene una verificación concreta (ver el formato de `docs/PLAN.md`).
