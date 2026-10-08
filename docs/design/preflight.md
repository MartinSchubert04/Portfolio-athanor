# Auditoría de diseño

Resultado de correr las dos skills de control sobre la versión 0.1.0, el 2026-10-06.
Se revisó en Edge headless a 1366x768 y 390x844. No se probó en Firefox, Safari ni en un teléfono real.

## 1. Pre-flight de `design-taste-frontend` (sección 14)

Solo las filas que aplican a esta página; las de pricing, testimonios, logo wall, bento, GSAP y
formularios largos no tienen contraparte acá.

| Chequeo | Estado | Nota |
|---|---|---|
| Lectura del brief y diales declarados | Pasa | `reference-analysis.md` |
| Sistema de diseño elegido o estética nombrada | Pasa | Estética propia (terminal / pixel), sin librería de componentes. `DESIGN.md` |
| Cero em-dash y en-dash en texto visible | Pasa | Verificado por búsqueda en `src/` e `index.html` |
| Un solo tema en toda la página | Pasa | Oscuro |
| Un solo color de acento | Pasa | Ámbar. `blood` aparece solo en el mensaje de error |
| Un solo sistema de esquinas | Pasa | Escalones de 4px; cero `border-radius` en el código |
| Contraste de botones y texto (WCAG AA) | Pasa | `ink` sobre ámbar 10.6:1; crema sobre clay 12:1; `dim` sobre `ink` 4.6:1. Se corrigieron dos usos de `dim` sobre `clay` (3.9:1) |
| Ningún CTA parte en dos líneas | Pasa | `white-space: nowrap` en `.clay-button` |
| Sin CTAs duplicados por intención | Pasa | "Download Resume" usa la misma etiqueta en hero y contacto |
| Hero entra en el viewport, CTA visible sin scroll | Pasa | 1366x768. El marco del grabado se achica con `100dvh` |
| Padding superior del hero | Pasa | 64px, de los cuales 40 son la barra fija |
| Hero: máximo 4 elementos de texto | **Desvío** | Suma sigilo, almanaque y prompt. Acordado, ver `CLAUDE.md` |
| Conteo de eyebrows | Pasa | 0 etiquetas en mayúsculas con tracking |
| Sin split-header | Pasa | Cada sección es `h2` y contenido debajo |
| Zigzag imagen/texto | Pasa | Solo hero y contacto, no consecutivos |
| Familias de layout sin repetir | Pasa | 6 secciones, 6 familias. `DESIGN.md`, sección 5 |
| Listas largas con el componente correcto | Pasa | Skills agrupadas en 4; proyectos como tabs; el log tiene 6 filas sin divisores |
| Imágenes reales | Pasa | Grabados de dominio público y capturas reales de los proyectos, procesadas |
| Sin pills ni etiquetas sobre imágenes | Pasa | El epígrafe va debajo |
| Epígrafes de crédito | Pasa | Acreditan obras y autores reales. El párrafo de créditos de Contact se quitó; los créditos completos quedan en `README.md` |
| Sin tiras de hora o lugar | **Desvío** | La barra de estado es el rasgo central de la referencia. Acordado |
| Sin footer de versión | Pasa | |
| Sin scroll cues, sin numeración de secciones, sin puntos decorativos | Pasa | |
| Sin barras de progreso con track | Pasa | Las cifras del ledger son números |
| Números inventados | Pasa | Todos salen de la API de GitHub o del cálculo astronómico |
| Autoauditoría de textos | Pasa | Releídos; carrera, skills y proyectos salen del CV, traducidos al inglés |
| Movimiento motivado | Pasa | Impresión del grabado (la terminal imprime por filas), reveal de sección (jerarquía), botón que se hunde (feedback), revelado de captura (cambio de estado) |
| Máximo un marquee | Pasa | No hay |
| Nav en una línea, menos de 80px | Pasa | 40px |
| Sin `window.addEventListener("scroll")` | Pasa | IntersectionObserver |
| Reduced motion | Pasa | Toda animación está dentro de `prefers-reduced-motion: no-preference` |
| Modo claro y oscuro | **Desvío** | Solo oscuro. Acordado |
| Colapso mobile explícito | Pasa | Cada grilla declara su versión de una columna |
| `min-h-[100dvh]`, nunca `h-screen` | Pasa | |
| Limpieza de efectos | Pasa | Observers, timers y fetch se cancelan al desmontar |
| Estados vacío, cargando y error | Pasa | Skeleton del ledger con la misma huella, error con reintento, log vacío si falla solo la búsqueda |
| Tarjetas solo donde hay jerarquía real | Pasa | Una: el panel de proyectos |
| Íconos de librería permitida | **Desvío** | No hay íconos; un glifo `►` de la fuente. Acordado |
| Serif | **Desvío** | Jacquard 24, justificada por la referencia. Acordado |
| Core Web Vitals | **Sin medir** | No se corrió Lighthouse. JS 91 kB gzip, CSS 7 kB, imagen del hero menor a 11 kB |

## 2. `web-design-guidelines`

Reglas vigentes de [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) al 2026-10-06.

| Grupo | Estado | Nota |
|---|---|---|
| Accesibilidad | Pasa | Skip link, un `h1`, jerarquía `h2`/`h3`, `alt` en imágenes, SVG decorativos con `aria-hidden`, tabs con roles y flechas, `aria-live` en el prompt y `role="alert"` en el error |
| Foco | Pasa | `:focus-visible` global en ámbar. El único `outline: none` (campo del prompt) lo reemplaza un cambio de marco a crema. `scroll-padding` evita que las barras tapen el foco |
| Formularios | Pasa | `label` asociado, `name`, `autocomplete="off"`, `spellCheck={false}`, placeholder con `…`, input no controlado |
| Animación | Pasa | Solo `transform` y `opacity`, sin `transition: all`, loops solo en el skeleton y apagados con reduced motion |
| Tipografía | Pasa | `…`, comillas curvas, `tabular-nums`, `text-wrap: balance` en títulos |
| Contenido | Pasa | `truncate` y `min-w-0` en mensajes de commit y stacks; estados vacíos resueltos |
| Imágenes | Pasa | `width` y `height` explícitos, `loading="lazy"` bajo el fold, `fetchpriority="high"` en el grabado del hero |
| Rendimiento | Parcial | `preconnect` a las dos APIs. Falta `preload` de la fuente VGA (se sirve con hash; hay un instante con la fuente de respaldo) |
| Navegación y estado | Pasa | Secciones por hash, proyecto elegido en `?project=`, todos los links son `<a>` |
| Touch | Pasa | `touch-action: manipulation`, tap highlight definido, objetivos de 40px o más |
| Safe areas | Pasa | Barras y contenedor con `env(safe-area-inset-*)`; `overflow-x: hidden` en `body` |
| Tema | Pasa | `color-scheme: dark`, `theme-color` igual al fondo |
| i18n | Pasa | Fechas y números con `Intl`; marcas y hashes con `translate="no"` |
| Hover | Pasa | Todos los links y botones cambian de color o se elevan |
| Copy | Pasa | Title Case en títulos y botones, etiquetas específicas, el error dice qué hacer |
| Anti-patrones | Pasa | Ninguno de la lista |

## 3. Pendientes conocidos

- Medir con Lighthouse y en un teléfono real.
- Fase 13 (manos con scroll): se revisó a mano contra taste §5.D y §6 (sin listener de scroll, solo
  `transform`, dentro de `prefers-reduced-motion: no-preference`, texto alternativo en una sola de las
  dos copias). No se corrió el pre-flight completo ni `web-design-guidelines`. Durante el giro el
  tramado se re-muestrea y se ve blando; en reposo queda exacto. Eso era la variante A; la B (tira de
  cuadros) no re-muestrea nada. La C (`?hands=3d`) se mueve en continuo, contra "motion is stepped" de
  `DESIGN.md` §7, usa un bucle de `requestAnimationFrame` mientras la placa está en pantalla y no
  tiene alternativa si falta WebGL2.
- Con escala de pantalla fraccionaria (Windows al 125 o 150%) los píxeles del tramado y de la fuente
  no caen en píxeles físicos enteros; se ve bien pero no perfecto. Es un límite del medio.
- Falta imagen Open Graph para cuando se comparta el link.
- La búsqueda de commits anónima admite 10 pedidos por minuto por IP; el sitio guarda el resultado
  30 minutos en `localStorage` y degrada a calendario sin log si falla.
- La luna usa la lunación media (igual que `splash.ps1`), así que la edad puede diferir un día de una efeméride.
