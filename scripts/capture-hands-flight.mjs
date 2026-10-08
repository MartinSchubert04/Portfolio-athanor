// Captura el vuelo de camara alrededor del modelo "Creation Of Adam" de Fatma Saeed
// (https://sketchfab.com/3d-models/creation-of-adam-b2b79dff2ff74dbaa47ac80bab4f0173), usado con
// permiso de la autora. Abre el visor oficial de Sketchfab en Chrome sin ventana, mueve la camara
// con la Viewer API y guarda un cuadro por paso en art/hands-flight/. No descarga el modelo.
// Necesita Chrome, ImageMagick y conexion. Despues hay que correr `npm run plates` para tramar los cuadros.
//   node scripts/capture-hands-flight.mjs
import { execFileSync, spawn } from "node:child_process"
import { createServer } from "node:http"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const MODEL = "b2b79dff2ff74dbaa47ac80bab4f0173"
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe"
const out = join(dirname(fileURLToPath(import.meta.url)), "../art/hands-flight")
const FRAMES = 48
const VIEW = [1280, 704] // el visor; de cada captura se recorta el centro, de 1024x384
const TARGET = [0.0004, 0.0034, 0.0274] // el hueco entre las yemas, en unidades del modelo

// El recorrido, del primero al ultimo: giro y elevacion en grados alrededor del punto que mira (0 es
// de frente), distancia, corrimiento de ese punto hacia la derecha y hacia arriba, y rolido en grados.
// El ultimo es el encuadre de michelangelo-adam-hands-wide.png: ahi el modelo cae sobre el grabado.
const KEYS = [
  [-38, 14, 0.105, -0.008, 0.004, 0],
  [-14, -8, 0.095, -0.004, 0.004, 2],
  [12, 10, 0.118, -0.004, 0.005, 4],
  [0, 0, 0.146, -0.0053, 0.0058, 5],
]

/** Punto de la spline de Catmull-Rom que pasa por KEYS, con t de 0 a 1. */
function spline(t) {
  const last = KEYS.length - 1
  const i = Math.min(Math.floor(t * last), last - 1)
  const u = t * last - i
  const [p0, p1, p2, p3] = [KEYS[Math.max(i - 1, 0)], KEYS[i], KEYS[i + 1], KEYS[Math.min(i + 2, last)]]
  return p1.map(
    (_, k) =>
      0.5 *
      (2 * p1[k] +
        (p2[k] - p0[k]) * u +
        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u +
        (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * u * u * u),
  )
}

// La Viewer API solo corre desde una pagina servida por http
const page = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}iframe{width:${VIEW[0]}px;height:${VIEW[1]}px;border:0}</style>
<iframe id="frame" allow="autoplay; fullscreen; xr-spatial-tracking"></iframe>
<script src="https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js"></script>
<script>
  window.state = "loading"
  new Sketchfab(document.getElementById("frame")).init("${MODEL}", {
    autostart: 1, preload: 1, camera: 0, autospin: 0, transparent: 1, dnt: 1,
    ui_hint: 0, ui_controls: 0, ui_infos: 0, ui_stop: 0, ui_help: 0, ui_settings: 0, ui_inspector: 0, ui_annotations: 0, ui_loading: 0,
    success(api) {
      api.start()
      api.addEventListener("viewerready", () => { window.state = "ready" })
      window.look = (eye, target) => new Promise((resolve, reject) => api.setCameraLookAt(eye, target, 0, (error) => (error ? reject(error) : resolve())))
    },
    error() { window.state = "error" },
  })
</script>`
const server = createServer((_, response) => response.setHeader("content-type", "text/html").end(page)).listen(5199, "127.0.0.1")

const chrome = spawn(CHROME, [
  "--headless=new",
  "--remote-debugging-port=9334",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "hands-flight-"))}`,
  `--window-size=${VIEW[0] + 120},${VIEW[1] + 120}`,
  "--hide-scrollbars",
  "--enable-gpu",
  "--use-angle=d3d11",
  "--ignore-gpu-blocklist",
  "http://127.0.0.1:5199/",
])
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
await wait(5000)

// Chrome DevTools Protocol, lo minimo: evaluar en la pagina y capturar
const tabs = await (await fetch("http://127.0.0.1:9334/json")).json()
const socket = new WebSocket(tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl)
await new Promise((resolve) => (socket.onopen = resolve))
let id = 0
const pending = new Map()
socket.onmessage = (message) => {
  const data = JSON.parse(message.data)
  pending.get(data.id)?.(data.result)
}
const send = (method, params = {}) =>
  new Promise((resolve) => {
    pending.set(++id, resolve)
    socket.send(JSON.stringify({ id, method, params }))
  })
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.value

for (let second = 0; second < 90 && (await evaluate("window.state")) === "loading"; second++) await wait(1000)
if ((await evaluate("window.state")) !== "ready") throw new Error("El visor de Sketchfab no cargo")
await wait(4000)

mkdirSync(out, { recursive: true })
for (let frame = 0; frame < FRAMES; frame++) {
  const t = frame / (FRAMES - 1)
  const [yaw, pitch, distance, right, up, roll] = spline(t * t * (3 - 2 * t))
  const [a, b] = [(yaw * Math.PI) / 180, (pitch * Math.PI) / 180]
  // En el modelo la camara de frente mira hacia -x, con z hacia arriba e y hacia la derecha
  const target = [TARGET[0], TARGET[1] + right, TARGET[2] + up]
  const eye = [target[0] + distance * Math.cos(b) * Math.cos(a), target[1] + distance * Math.cos(b) * Math.sin(a), target[2] + distance * Math.sin(b)]
  await evaluate(`window.look(${JSON.stringify(eye)}, ${JSON.stringify(target)})`)
  await wait(350)
  const shot = await send("Page.captureScreenshot", { clip: { x: 0, y: 0, width: VIEW[0], height: VIEW[1], scale: 1 } })
  // La API no tiene rolido: se gira la captura y se recorta el centro, al tamaño de la placa
  const raw = join(out, "raw.png")
  writeFileSync(raw, Buffer.from(shot.data, "base64"))
  const crop = ["-alpha", "off", "-virtual-pixel", "black", "-distort", "SRT", roll.toFixed(3), "-gravity", "center", "-crop", "1024x384+0+0", "+repage"]
  execFileSync("magick", [raw, ...crop, "-quality", "90", join(out, `${String(frame).padStart(2, "0")}.jpg`)])
  rmSync(raw)
}

await send("Browser.close")
chrome.kill()
server.close()
console.log(`${FRAMES} cuadros en ${out}`)
process.exit(0)
