import { useEffect, useRef } from "react"
import model from "@/assets/models/hands.bin?url"
import plate from "@/assets/plates/michelangelo-adam-hands-wide.png"

// Logical pixels: the canvas is drawn at 512x192 and shown at 2x, like the dithered plates
const WIDTH = 512
const HEIGHT = 192
const SCALE = 64 // model units per logical pixel (see scripts/make-hands-model.mjs)
const FOCAL = 600 // from this far, head on, the plate fills the canvas exactly
const NEAR = 10
const FAR = 3000
// The scroll, in three acts: the camera flies around the fingers, the model dissolves into the plate
// while the camera holds still, and the plate alone pulls back to its full width
const FLIGHT_END = 0.6
const DISSOLVE_END = 0.8
// The model stops at the wrists, so the camera never leaves the fingers. The flight ends head on at
// this zoom, looking at this point of the plate (logical pixels from its center). Both are whole
// numbers so that, during the dissolve, one pixel of the plate is exactly one ZOOM x ZOOM cell.
const ZOOM = 2
const CLOSE_UP: [number, number] = [2, -8]

type Vec3 = [number, number, number]

// The camera's flight, first to last: yaw and pitch in degrees around the point it looks at, its
// distance, and that point on the plate. It ends head on, where the model sits exactly over the
// hands of the plate.
const FLIGHT = [
  [-72, 16, 200, -14, 0],
  [-35, -8, 190, -4, -4],
  [28, 12, 220, 6, -6],
  [0, 0, FOCAL / ZOOM, ...CLOSE_UP],
].map(([yaw, pitch, distance, x, y]) => {
  const [a, b] = [(yaw * Math.PI) / 180, (pitch * Math.PI) / 180]
  const eye: Vec3 = [x + distance * Math.sin(a) * Math.cos(b), y + distance * Math.sin(b), distance * Math.cos(a) * Math.cos(b)]
  return { eye, aim: [x, y, 0] as Vec3 }
})
const EYES = FLIGHT.map((key) => key.eye)
const AIMS = FLIGHT.map((key) => key.aim)

/** A point on the Catmull-Rom spline through `points`, with `t` from 0 to 1. */
function spline(points: Vec3[], t: number): Vec3 {
  const last = points.length - 1
  const i = Math.min(Math.floor(t * last), last - 1)
  const u = t * last - i
  const [p0, p1, p2, p3] = [points[Math.max(i - 1, 0)], points[i], points[i + 1], points[Math.min(i + 2, last)]]
  const axis = (k: number) =>
    0.5 *
    (2 * p1[k] +
      (p2[k] - p0[k]) * u +
      (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u +
      (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * u * u * u)
  return [axis(0), axis(1), axis(2)]
}

const subtract = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const unit = (a: Vec3): Vec3 => {
  const length = Math.hypot(...a)
  return [a[0] / length, a[1] / length, a[2] / length]
}
const smooth = (t: number) => t * t * (3 - 2 * t)

/** Column-major view matrix of a camera at `eye` looking at `aim`. */
function lookAt(eye: Vec3, aim: Vec3): number[] {
  const z = unit(subtract(eye, aim))
  const x = unit(cross([0, 1, 0], z))
  const y = cross(z, x)
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]
}

// prettier-ignore
const PROJECTION = [
  FOCAL / (WIDTH / 2), 0, 0, 0,
  0, FOCAL / (HEIGHT / 2), 0, 0,
  0, 0, (FAR + NEAR) / (NEAR - FAR), -1,
  0, 0, (2 * FAR * NEAR) / (NEAR - FAR), 0,
]

// Shared by both passes. Both draw in cells of ZOOM x ZOOM canvas pixels, the size of one pixel of
// the plate in the close-up, so the grain of the model and of the plate is the same. The plate
// takes over one cell at a time, from the fingertips outward.
const DISSOLVE = `
uniform float u_mix;
float noise(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec2 cell() { return floor(gl_FragCoord.xy / ${ZOOM}.0); }
bool plateOwns() {
  float away = abs(gl_FragCoord.x - ${WIDTH / 2}.0) / ${WIDTH / 2}.0;
  return noise(cell()) < clamp(u_mix * 2.0 - away, 0.0, 1.0);
}`

const MODEL_VERTEX = `#version 300 es
in vec4 a_position; // xyz in model units, w is the hand: -1 left, 1 right
in vec3 a_normal;
uniform mat4 u_projection, u_view;
uniform float u_open;
out vec3 v_normal, v_world;
out float v_fade;
void main() {
  v_normal = a_normal;
  // The model stops at the wrists: each one thins out to nothing instead of showing its cut
  float x = a_position.x / ${SCALE}.0;
  v_fade = a_position.w < 0.0 ? smoothstep(-128.0, -92.0, x) : 1.0 - smoothstep(96.0, 132.0, x);
  v_world = a_position.xyz / ${SCALE}.0 + vec3(a_position.w * 30.0 * u_open, 0.0, 0.0);
  gl_Position = u_projection * u_view * vec4(v_world, 1.0);
}`

// The plate is a negative: shadows and outlines carry the ink, lit skin is almost bare. The model
// is shaded the same way, then dithered with one bit per cell.
const MODEL_FRAGMENT = `#version 300 es
precision highp float;
in vec3 v_normal, v_world;
in float v_fade;
uniform vec3 u_eye;
uniform bool u_depthOnly;
out vec4 color;
${DISSOLVE}
const vec3 LIGHT = normalize(vec3(-0.4, 0.75, 0.5));
void main() {
  vec2 pixel = cell();
  if (plateOwns()) discard;
  if (u_depthOnly) return;
  vec3 normal = normalize(v_normal);
  float shade = 1.0 - max(dot(normal, LIGHT), 0.0);
  float edge = 1.0 - abs(dot(normal, normalize(u_eye - v_world)));
  float tone = (0.12 + 0.75 * smoothstep(0.25, 0.95, shade) + 0.2 * edge * edge) * v_fade;
  // Half interleaved gradient noise, half white noise: an even threshold with no visible pattern,
  // close to the plate's error diffusion
  float threshold = mix(fract(52.9829189 * fract(dot(pixel, vec2(0.06711056, 0.00583715)))), noise(pixel + 71.0), 0.5);
  if (tone <= threshold) discard;
  color = vec4(1.0);
}`

// One triangle that covers the canvas, no buffers needed
const PLATE_VERTEX = `#version 300 es
void main() {
  gl_Position = vec4(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0, 0.0, 1.0);
}`

const PLATE_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D u_plate;
uniform float u_zoom;
uniform vec2 u_center;
out vec4 color;
${DISSOLVE}
void main() {
  if (!plateOwns()) discard;
  // Where the camera is looking on the plate, in logical pixels from its center. At zoom 1 every
  // canvas pixel is exactly one 2x2 block of the PNG
  vec2 point = (gl_FragCoord.xy - vec2(${WIDTH / 2}.0, ${HEIGHT / 2}.0)) / u_zoom + u_center;
  vec2 uv = vec2(point.x / ${WIDTH}.0 + 0.5, 0.5 - point.y / ${HEIGHT}.0);
  if (uv != clamp(uv, 0.0, 1.0) || texture(u_plate, uv).a < 0.5) discard;
  color = vec4(1.0);
}`

function link(gl: WebGL2RenderingContext, vertex: string, fragment: string): WebGLProgram {
  const program = gl.createProgram()
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  return program
}

/**
 * The Skills plate as a live scene: a camera flies around a 3D model of the hands as they close in
 * with the scroll, settles head on, and the model dissolves into the original dithered plate.
 */
export default function HandsScene({ label }: { label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas?.getContext("webgl2")
    if (!canvas || !gl) return

    const hands = link(gl, MODEL_VERTEX, MODEL_FRAGMENT)
    const engraving = link(gl, PLATE_VERTEX, PLATE_FRAGMENT)
    const handsMesh = gl.createVertexArray()
    const noMesh = gl.createVertexArray()
    gl.useProgram(hands)
    gl.uniformMatrix4fv(gl.getUniformLocation(hands, "u_projection"), false, PROJECTION)
    gl.depthFunc(gl.LEQUAL)

    let indexCount = 0
    const draw = (progress: number) => {
      const flight = smooth(Math.min(1, progress / FLIGHT_END))
      // Then the camera holds while the plate takes over, and pulls straight back once it is all plate
      const mix = Math.min(1, Math.max(0, (progress - FLIGHT_END) / (DISSOLVE_END - FLIGHT_END)))
      const back = smooth(Math.max(0, (progress - DISSOLVE_END) / (1 - DISSOLVE_END)))
      const zoom = ZOOM + (1 - ZOOM) * back
      const center = CLOSE_UP.map((v) => v * (1 - back))
      const aim = spline(AIMS, flight)
      const eye = spline(EYES, flight)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      if (mix < 1) {
        gl.useProgram(hands)
        gl.bindVertexArray(handsMesh)
        gl.enable(gl.DEPTH_TEST)
        gl.uniformMatrix4fv(gl.getUniformLocation(hands, "u_view"), false, lookAt(eye, aim))
        gl.uniform3fv(gl.getUniformLocation(hands, "u_eye"), eye)
        gl.uniform1f(gl.getUniformLocation(hands, "u_open"), 1 - flight)
        gl.uniform1f(gl.getUniformLocation(hands, "u_mix"), mix)
        // Depth first, then ink: otherwise the far side of a hand shows through the holes of the dither
        for (const depthOnly of [true, false]) {
          gl.colorMask(!depthOnly, !depthOnly, !depthOnly, !depthOnly)
          gl.uniform1i(gl.getUniformLocation(hands, "u_depthOnly"), Number(depthOnly))
          gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0)
        }
      }
      if (mix > 0) {
        gl.useProgram(engraving)
        gl.bindVertexArray(noMesh)
        gl.disable(gl.DEPTH_TEST)
        gl.uniform1f(gl.getUniformLocation(engraving, "u_mix"), mix)
        gl.uniform1f(gl.getUniformLocation(engraving, "u_zoom"), zoom)
        gl.uniform2fv(gl.getUniformLocation(engraving, "u_center"), center)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }
    }

    // The figure is pinned inside a taller track; progress is how far it has slid down that track
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    const pin = canvas.closest("figure")!
    const track = pin.parentElement!
    let frame = 0
    let drawn = -1
    const tick = () => {
      const [outer, inner] = [track.getBoundingClientRect(), pin.getBoundingClientRect()]
      const progress = still ? 1 : Math.min(1, Math.max(0, (inner.top - outer.top) / (outer.height - inner.height)))
      if (progress !== drawn) draw((drawn = progress))
      if (!still) frame = requestAnimationFrame(tick)
    }

    // The loop only runs while the plate is on screen
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      if (entry.isIntersecting) tick()
    })

    const image = new Image()
    const request = new AbortController()
    const loaded = Promise.all([
      fetch(model, { signal: request.signal }).then((response) => response.arrayBuffer()),
      new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = plate
      }),
    ])
    loaded
      .then(([data]) => {
        // Header, then positions (Int16 x4), normals (Int8 x4) and triangle indices (Uint16)
        const [vertexCount, count] = new Uint32Array(data, 0, 2)
        gl.bindVertexArray(handsMesh)
        const attribute = (name: string, size: number, type: number, normalized: boolean, stride: number, offset: number) => {
          gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
          gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(data, offset, vertexCount * stride), gl.STATIC_DRAW)
          const location = gl.getAttribLocation(hands, name)
          gl.enableVertexAttribArray(location)
          gl.vertexAttribPointer(location, size, type, normalized, stride, 0)
        }
        attribute("a_position", 4, gl.SHORT, false, 8, 8)
        attribute("a_normal", 3, gl.BYTE, true, 4, 8 + vertexCount * 8)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(data, 8 + vertexCount * 12, count * 2), gl.STATIC_DRAW)
        indexCount = count

        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        observer.observe(canvas)
      })
      .catch(() => {})

    return () => {
      request.abort()
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={ref} width={WIDTH} height={HEIGHT} role="img" aria-label={label} />
}
