// Convierte art/models/the_creation_of_adam.glb en el binario que carga HandsScene.
// Aplica las transformaciones de los nodos, descarta materiales y texturas, y acomoda la escena
// en pixeles logicos de la placa (512x192, y hacia arriba, z hacia la camara).
//   node scripts/make-hands-model.mjs
//
// Formato de salida (little endian):
//   Uint32 x2   cantidad de vertices, cantidad de indices
//   Int16  x4   por vertice: x, y, z en 1/SCALE de pixel logico, y la mano (-1 izquierda, 1 derecha)
//   Int8   x4   por vertice: normal x, y, z en 1/127, y relleno
//   Uint16      indices de triangulos
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const source = join(root, "art/models/the_creation_of_adam.glb")
const target = join(root, "src/assets/models/hands.bin")

const SCALE = 64 // unidades Int16 por pixel logico
const WIDTH = 300 // ancho de las dos manos juntas, de muñeca a muñeca, en pixeles logicos
// Registro contra el grabado, por mano (-1 izquierda, 1 derecha): corrimiento en x e y, giro en el
// plano en grados y escala, alrededor del centro de esa mano. La camera final mira de frente y el
// modelo tiene que caer sobre las manos de michelangelo-adam-hands-wide.png.
const PLACE = { [-1]: [6, -7, 0, 1.03], 1: [13, -27, 0, 1.12] }

// --- GLB: cabecera de 12 bytes, despues un chunk JSON y uno binario
const file = readFileSync(source)
const jsonLength = file.readUInt32LE(12)
const gltf = JSON.parse(file.subarray(20, 20 + jsonLength).toString("utf8"))
const bin = file.subarray(20 + jsonLength + 8)

function accessor(index) {
  const a = gltf.accessors[index]
  const view = gltf.bufferViews[a.bufferView]
  const size = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type]
  const read = { 5123: ["readUInt16LE", 2], 5125: ["readUInt32LE", 4], 5126: ["readFloatLE", 4] }[a.componentType]
  const stride = view.byteStride ?? size * read[1]
  const start = (view.byteOffset ?? 0) + (a.byteOffset ?? 0)
  const out = []
  for (let i = 0; i < a.count; i++) for (let k = 0; k < size; k++) out.push(bin[read[0]](start + i * stride + k * read[1]))
  return out
}

// --- matrices 4x4 en orden de columnas, como en glTF
const multiply = (a, b) => Array.from({ length: 16 }, (_, i) => [0, 1, 2, 3].reduce((sum, k) => sum + a[(i % 4) + k * 4] * b[k + (i - (i % 4))], 0))
function local(node) {
  if (node.matrix) return node.matrix
  const [x, y, z, w] = node.rotation ?? [0, 0, 0, 1]
  const [sx, sy, sz] = node.scale ?? [1, 1, 1]
  const [tx, ty, tz] = node.translation ?? [0, 0, 0]
  // prettier-ignore
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ]
}

// --- recorre la escena y junta cada malla ya transformada
const parts = []
function walk(index, parent) {
  const node = gltf.nodes[index]
  const world = multiply(parent, local(node))
  if (node.mesh !== undefined) {
    for (const primitive of gltf.meshes[node.mesh].primitives) {
      const position = accessor(primitive.attributes.POSITION)
      const normal = accessor(primitive.attributes.NORMAL)
      const points = []
      const normals = []
      for (let i = 0; i < position.length; i += 3) {
        const [x, y, z] = position.slice(i, i + 3)
        points.push([0, 1, 2].map((r) => world[r] * x + world[r + 4] * y + world[r + 8] * z + world[r + 12]))
        const [nx, ny, nz] = normal.slice(i, i + 3)
        const n = [0, 1, 2].map((r) => world[r] * nx + world[r + 4] * ny + world[r + 8] * nz)
        normals.push(n.map((v) => v / Math.hypot(...n)))
      }
      parts.push({ name: gltf.meshes[node.mesh].name, points, normals, index: accessor(primitive.indices) })
    }
  }
  for (const child of node.children ?? []) walk(child, world)
}
// prettier-ignore
const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
for (const index of gltf.scenes[gltf.scene ?? 0].nodes) walk(index, identity)

const bounds = (points) => [0, 1, 2].map((k) => [Math.min(...points.map((p) => p[k])), Math.max(...points.map((p) => p[k]))])
if (process.argv.includes("--inspect")) {
  for (const part of parts) console.log(part.name, part.points.length, bounds(part.points).map((b) => b.map((v) => v.toFixed(3)).join("..")).join("  "))
  process.exit(0)
}

// --- orientacion: ORIENT lleva los ejes del modelo a los de la placa (x derecha, y arriba, z camara)
// En el modelo los brazos corren por z. Se mira desde -x: la mano caida de Adan queda a la izquierda.
const ORIENT = [
  [0, 0, 1],
  [0, 1, 0],
  [-1, 0, 0],
]
const turn = (v) => ORIENT.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2])
for (const part of parts) {
  part.points = part.points.map(turn)
  part.normals = part.normals.map(turn)
}

// Centrada y escalada para que las dos manos ocupen WIDTH pixeles logicos
const all = bounds(parts.flatMap((part) => part.points))
const center = all.map(([min, max]) => (min + max) / 2)
const factor = WIDTH / (all[0][1] - all[0][0])
for (const part of parts) part.points = part.points.map((p) => p.map((v, k) => (v - center[k]) * factor))

// Cada malla es de una mano: la que queda a la izquierda de la escena es -1
for (const part of parts) {
  const [min, max] = bounds(part.points)[0]
  part.side = (min + max) / 2 < 0 ? -1 : 1
}
for (const side of [-1, 1]) {
  const own = parts.filter((part) => part.side === side)
  const pivot = bounds(own.flatMap((part) => part.points)).map(([min, max]) => (min + max) / 2)
  const [dx, dy, roll, scale] = PLACE[side]
  const [cos, sin] = [Math.cos((roll * Math.PI) / 180), Math.sin((roll * Math.PI) / 180)]
  const spin = ([x, y, z]) => [x * cos - y * sin, x * sin + y * cos, z]
  for (const part of own) {
    part.points = part.points.map((p) => spin(p.map((v, k) => (v - pivot[k]) * scale)).map((v, k) => v + pivot[k] + [dx, dy, 0][k]))
    part.normals = part.normals.map(spin)
  }
}

const vertexCount = parts.reduce((sum, part) => sum + part.points.length, 0)
const indexCount = parts.reduce((sum, part) => sum + part.index.length, 0)
const out = Buffer.alloc(8 + vertexCount * 12 + indexCount * 2)
out.writeUInt32LE(vertexCount, 0)
out.writeUInt32LE(indexCount, 4)
let vertex = 0
let cursor = 8 + vertexCount * 12
for (const part of parts) {
  for (const k of part.index) cursor = out.writeUInt16LE(vertex + k, cursor)
  part.points.forEach((p, i) => {
    p.forEach((v, k) => out.writeInt16LE(Math.round(v * SCALE), 8 + vertex * 8 + k * 2))
    out.writeInt16LE(part.side, 8 + vertex * 8 + 6)
    part.normals[i].forEach((v, k) => out.writeInt8(Math.round(v * 127), 8 + vertexCount * 8 + vertex * 4 + k))
    vertex++
  })
}
mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, out)
console.log(`${target}: ${vertexCount} vertices, ${indexCount / 3} triangulos, ${out.length} bytes`)
