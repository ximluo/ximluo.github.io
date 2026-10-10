/* The ink field: a drifting, domain-warped noise field printed as a halftone of mono glyphs, bone with the page
   light in its highlights, like a logo texture run through an ASCII pass. The pointer pushes and pools it like wet
   ink and a press drops a ripple. Given a photo, the print follows the photo's light instead and the pointer melts
   it back to the photograph. Two passes: the field at one texel per cell, then the glyphs at screen resolution, so
   the per-pixel work is two texture reads. */
import { RM } from "../env"
import { readTint } from "../film/tint"
import { createGl, fbo, fit, locs, program, release, remountable, tex2d, bindProgram } from "./core"
import { createLoop } from "./loop"
import { trackPointer } from "./pointer"

const CELL: [number, number] = [11, 14]
const DPR_MAX = 1.5
const RAMP = [" ", ".", ":", "-", "=", "+", ">", "1", "5", "F", "8", "@"]
const RING = 16
const RIPPLES = 4
const SHADES = 6
/** css px over which the print comes back outside a shaded box, so the lightened patch has no visible edge */
const SOFT = 320
const MONO = '"B612 Mono", ui-monospace, Menlo, monospace'
const BONE: [number, number, number] = [236 / 255, 235 / 255, 230 / 255]

/* the field, one fragment per cell. cells are the unit everywhere here: the pointer samples, their speed, the
   ripples. a sample pushes the field along its motion and swirls it across, and pools ink where it lingers */
const DENSITY_FS = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uGrid;
uniform float uT;
uniform vec4 uPtr[${RING}];
uniform float uAge[${RING}];
uniform vec4 uRip[${RIPPLES}];
uniform sampler2D uPhoto;
uniform float uPhotoOn;
uniform vec2 uPhotoMap;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int k = 0; k < 4; k++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
void main(){
  vec2 cell = gl_FragCoord.xy;
  vec2 p = cell / vec2(40.0, 25.0);
  vec2 warp = vec2(0.0);
  float pool = 0.0;
  for (int i = 0; i < ${RING}; i++) {
    if (uAge[i] < 0.0) continue;
    vec2 d = cell - uPtr[i].xy;
    float g = exp(-dot(d, d) / 72.0) * exp(-uAge[i] / 0.9);
    vec2 v = uPtr[i].zw;
    warp += (v * 0.0035 + vec2(-v.y, v.x) * 0.006) * g;
    pool += g * (0.25 + 0.004 * length(v));
  }
  vec2 q = p + warp;
  float n = fbm(q + uT * vec2(0.03, 0.018) + 0.55 * fbm(q * 0.7 - uT * 0.012));
  float d;
  if (uPhotoOn > 0.5) {
    vec2 uv = (cell / uGrid - 0.5) * uPhotoMap + 0.5;
    float lum = dot(texture(uPhoto, uv).rgb, vec3(0.299, 0.587, 0.114));
    d = smoothstep(0.03, 0.55, lum) * (0.82 + 0.3 * n) + 0.6 * pool;
  } else d = 0.09 + smoothstep(0.22, 0.86, n) + 0.6 * pool;
  for (int i = 0; i < ${RIPPLES}; i++) {
    float a = uRip[i].z;
    if (a < 0.0) continue;
    float r = length(cell - uRip[i].xy);
    d += uRip[i].w * sin(1.3 * r - 10.0 * a) * exp(-pow(r - 22.0 * a, 2.0) / 40.0) * exp(-a / 1.1);
  }
  o = vec4(clamp(d, 0.0, 1.0), 0.0, 0.0, 1.0);
}`

/* the print: each cell picks a glyph by its density through a 4x4 Bayer threshold, bone turning to the page light
   in the highlights, dimmed under the boxes the page hands over (the name, the photo, the HUD corners) so words stay
   clear and the face stays a face; the dimming eases back out over uSoft px so no box shows */
const GLYPH_FS = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uDen;
uniform sampler2D uAtlas;
uniform vec2 uCell;
uniform float uN;
uniform vec3 uBone;
uniform vec3 uTint;
uniform vec4 uBox[6];
uniform float uBoxK[6];
uniform int uBoxN;
uniform float uSoft;
uniform sampler2D uPhotoC;
uniform float uPhotoOn;
uniform vec2 uPhotoMap;
uniform vec2 uRes;
uniform vec3 uRev;
const float B[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
void main(){
  vec2 fc = gl_FragCoord.xy / uCell;
  ivec2 cell = ivec2(floor(fc));
  vec2 lc = fract(fc);
  float d = texelFetch(uDen, cell, 0).r;
  float bay = B[(cell.y & 3) * 4 + (cell.x & 3)] / 16.0;
  float idx = floor(clamp(d + (bay - 0.5) / uN, 0.0, 0.999) * uN);
  float a = idx < 1.0 ? 0.0 : texture(uAtlas, vec2((idx + lc.x) / uN, lc.y)).r;
  float rev = uRev.z > 0.0 ? 1.0 - smoothstep(uRev.z * 0.45, uRev.z, distance(gl_FragCoord.xy, uRev.xy)) : 0.0;
  if (a < 0.02 && rev < 0.002) discard;
  vec3 col = mix(uBone, uTint, (uPhotoOn > 0.5 ? 0.3 : 0.7) * smoothstep(0.55, 1.0, d));
  float dim = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= uBoxN) break;
    vec2 q = max(max(uBox[i].xy - gl_FragCoord.xy, gl_FragCoord.xy - uBox[i].zw), 0.0);
    dim *= 1.0 - uBoxK[i] * (1.0 - smoothstep(0.0, uSoft, length(q)));
  }
  float alpha = a * (0.14 + 0.42 * d) * dim;
  vec3 rgb = col * alpha;
  if (uPhotoOn > 0.5) {
    alpha = a * (0.3 + 0.7 * d);
    rgb = col * alpha;
    vec2 uv = (gl_FragCoord.xy / uRes - 0.5) * uPhotoMap + 0.5;
    vec3 ph = texture(uPhotoC, uv).rgb * 0.92;
    rgb = rgb * (1.0 - rev) + ph * rev;
    alpha = alpha * (1.0 - rev) + rev;
  }
  o = vec4(rgb, alpha);
}`

/** The ramp's glyphs in one row, each in a BOX_W x BOX_H cell, white on black, ordered by how much ink they carry. */
const BOX_W = 32
const BOX_H = 40
function makeAtlas(): HTMLCanvasElement | null {
  const probe = document.createElement("canvas")
  probe.width = BOX_W
  probe.height = BOX_H
  const pg = probe.getContext("2d", { willReadFrequently: true })
  if (!pg) return null
  const ink = (ch: string) => {
    pg.fillStyle = "#000"
    pg.fillRect(0, 0, BOX_W, BOX_H)
    pg.fillStyle = "#fff"
    pg.font = "34px " + MONO
    pg.textAlign = "center"
    pg.textBaseline = "middle"
    pg.fillText(ch, BOX_W / 2, BOX_H / 2 + 1)
    const px = pg.getImageData(0, 0, BOX_W, BOX_H).data
    let s = 0
    for (let i = 0; i < px.length; i += 4) s += px[i] ?? 0
    return s
  }
  const order = RAMP.map((ch) => ({ ch, ink: ink(ch) })).sort((a, b) => a.ink - b.ink)
  const c = document.createElement("canvas")
  c.width = BOX_W * order.length
  c.height = BOX_H
  const g = c.getContext("2d")
  if (!g) return null
  g.fillStyle = "#000"
  g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = "#fff"
  g.font = "34px " + MONO
  g.textAlign = "center"
  g.textBaseline = "middle"
  order.forEach((e, i) => {
    if (i) g.fillText(e.ch, i * BOX_W + BOX_W / 2, BOX_H / 2 + 1)
  })
  return c
}

export interface Shade {
  el: Element | null
  /** css px around the element's box (negative to inset) */
  pad: number
  /** how much of the print goes under it, 0..1 */
  k: number
}

export interface InkOptions {
  /** the boxes the print stays light under, measured every frame (up to six) */
  shades?(): Shade[]
  /** a photograph to print instead of the noise field; the pointer reveals it */
  photo?: string
  /** cell size in css px (default 11 by 14) */
  cell?: [number, number]
}

export interface InkHandle {
  destroy(): void
}

function mount(host: HTMLElement, o: InkOptions) {
  const made = createGl(host, { alpha: true, power: "low-power" })
  if (!made) return null
  const { canvas, gl } = made
  let dead = false
  let pDen: WebGLProgram
  let pGlyph: WebGLProgram
  try {
    pDen = program(gl, DENSITY_FS)
    pGlyph = program(gl, GLYPH_FS)
  } catch (e) {
    console.error("ink field:", e)
    release(gl)
    host.removeChild(canvas)
    return null
  }
  const [CELL_W, CELL_H] = o.cell ?? CELL
  const uD = locs(gl, pDen, [
    "uGrid",
    "uT",
    "uPtr",
    "uAge",
    "uRip",
    "uPhoto",
    "uPhotoOn",
    "uPhotoMap",
  ] as const)
  const uG = locs(gl, pGlyph, [
    "uDen",
    "uAtlas",
    "uCell",
    "uN",
    "uBone",
    "uTint",
    "uBox",
    "uBoxK",
    "uBoxN",
    "uSoft",
    "uPhotoC",
    "uPhotoOn",
    "uPhotoMap",
    "uRes",
    "uRev",
  ] as const)

  let atlas: WebGLTexture | null = null
  let photo: WebGLTexture | null = null
  let photoW = 1
  let photoH = 1
  let revR = 0
  let den: WebGLTexture | null = null
  let denFbo: WebGLFramebuffer | null = null
  let cols = 0
  let rows = 0
  let k = 1
  let W = 0
  let H = 0

  const ptr = new Float32Array(RING * 4)
  const age = new Float32Array(RING).fill(-1)
  const rip = new Float32Array(RIPPLES * 4).fill(-1)
  const box = new Float32Array(SHADES * 4)
  const boxK = new Float32Array(SHADES)
  let head = 0
  let ripHead = 0
  let lastSample = 0
  const t0 = performance.now()

  /* the atlas waits for the mono face, so the first frame is set in it and not a fallback */
  const fontReady = document.fonts?.load
    ? document.fonts.load('34px "B612 Mono"').catch(() => undefined)
    : Promise.resolve()
  void fontReady.then(() => {
    if (dead) return
    const c = makeAtlas()
    if (!c) return
    atlas = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, atlas)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    loop.kick()
  })
  if (o.photo) {
    const img = new Image()
    img.decoding = "async"
    img.onload = () => {
      if (dead) return
      photo = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, photo)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      photoW = img.naturalWidth || 1
      photoH = img.naturalHeight || 1
      loop.kick()
    }
    img.src = o.photo
  }
  /* cover-fit: the uv scale that crops the photo to the canvas's shape */
  const photoMap = (): [number, number] => {
    const ca = canvas.clientWidth / Math.max(1, canvas.clientHeight)
    const pa = photoW / photoH
    return ca > pa ? [1, pa / ca] : [ca / pa, 1]
  }

  const resize = () => {
    const f = fit(canvas, DPR_MAX)
    if (!f.w) return false
    k = f.k
    W = f.w
    H = f.h
    const nc = Math.ceil(canvas.clientWidth / CELL_W)
    const nr = Math.ceil(canvas.clientHeight / CELL_H)
    if (nc !== cols || nr !== rows || !den) {
      cols = nc
      rows = nr
      if (den) gl.deleteTexture(den)
      if (denFbo) gl.deleteFramebuffer(denFbo)
      den = tex2d(gl, cols, rows, gl.R8, gl.RED, gl.UNSIGNED_BYTE, gl.NEAREST)
      denFbo = fbo(gl, den)
    }
    return true
  }

  const pointer = trackPointer({
    onMove: () => loop.kick(),
    onDown: (x, y) => {
      if (RM) return
      const rc = canvas.getBoundingClientRect()
      const i = ripHead++ % RIPPLES
      rip[i * 4] = (x - rc.left) / CELL_W
      rip[i * 4 + 1] = (rc.bottom - y) / CELL_H
      rip[i * 4 + 2] = 0
      rip[i * 4 + 3] = 0.9
      loop.kick()
    },
  })

  const anyRipple = () => {
    for (let i = 0; i < RIPPLES; i++) if ((rip[i * 4 + 2] ?? -1) >= 0) return true
    return false
  }

  const draw = (now: number, dt: number) => {
    if (dead || !atlas || !den || !denFbo) return false
    if (!canvas.clientWidth || !canvas.clientHeight) return false
    pointer.tick(dt)
    const t = RM ? 0 : (now - t0) / 1000
    const rc = canvas.getBoundingClientRect()
    const lx = pointer.x - rc.left
    const ly = pointer.y - rc.top
    const over = pointer.inside && lx > -40 && ly > -40 && lx < rc.width + 40 && ly < rc.height + 40
    if (!RM) {
      for (let i = 0; i < RING; i++) {
        const a = age[i] ?? -1
        if (a >= 0) age[i] = a + dt > 1.6 ? -1 : a + dt
      }
      const speed = Math.hypot(pointer.vx, pointer.vy)
      if (over && speed > 20 && now - lastSample > 60) {
        lastSample = now
        const i = head++ % RING
        ptr[i * 4] = lx / CELL_W
        ptr[i * 4 + 1] = (rc.height - ly) / CELL_H
        ptr[i * 4 + 2] = pointer.vx / CELL_W
        ptr[i * 4 + 3] = -pointer.vy / CELL_H
        age[i] = 0
      }
      for (let i = 0; i < RIPPLES; i++) {
        const a = rip[i * 4 + 2] ?? -1
        if (a >= 0) rip[i * 4 + 2] = a + dt > 2 ? -1 : a + dt
      }
    }
    /* pass 1: the field */
    gl.bindFramebuffer(gl.FRAMEBUFFER, denFbo)
    gl.viewport(0, 0, cols, rows)
    gl.disable(gl.BLEND)
    bindProgram(gl, pDen)
    gl.uniform2f(uD.uGrid, cols, rows)
    gl.uniform1f(uD.uT, t)
    gl.uniform4fv(uD.uPtr, ptr)
    gl.uniform1fv(uD.uAge, age)
    gl.uniform4fv(uD.uRip, rip)
    const pm = photoMap()
    gl.uniform1f(uD.uPhotoOn, photo ? 1 : 0)
    gl.uniform2f(uD.uPhotoMap, pm[0], pm[1])
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, photo)
    gl.uniform1i(uD.uPhoto, 2)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    /* pass 2: the print */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, W, H)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    bindProgram(gl, pGlyph)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, den)
    gl.uniform1i(uG.uDen, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, atlas)
    gl.uniform1i(uG.uAtlas, 1)
    gl.uniform2f(uG.uCell, CELL_W * k, CELL_H * k)
    gl.uniform1f(uG.uN, RAMP.length)
    gl.uniform3f(uG.uBone, BONE[0], BONE[1], BONE[2])
    const [tr, tg, tb] = readTint()
    gl.uniform3f(uG.uTint, tr, tg, tb)
    gl.uniform1f(uG.uPhotoOn, photo ? 1 : 0)
    gl.uniform2f(uG.uPhotoMap, pm[0], pm[1])
    gl.uniform2f(uG.uRes, W, H)
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, photo)
    gl.uniform1i(uG.uPhotoC, 2)
    /* the reveal: a soft disc under the pointer that grows in and out over a few frames */
    const want = photo && over && !RM ? 150 : 0
    revR += (want - revR) * (1 - Math.exp(-dt * 9))
    gl.uniform3f(uG.uRev, lx * k, (rc.height - ly) * k, revR * k)
    let nb = 0
    const ch = canvas.clientHeight
    for (const sh of o.shades?.() ?? []) {
      if (nb >= SHADES || !sh.el) continue
      const r = sh.el.getBoundingClientRect()
      if (!r.width || !r.height) continue
      box[nb * 4] = (r.left - sh.pad) * k
      box[nb * 4 + 1] = (ch - r.bottom - sh.pad) * k
      box[nb * 4 + 2] = (r.right + sh.pad) * k
      box[nb * 4 + 3] = (ch - r.top + sh.pad) * k
      boxK[nb] = sh.k
      nb++
    }
    gl.uniform4fv(uG.uBox, box)
    gl.uniform1fv(uG.uBoxK, boxK)
    gl.uniform1i(uG.uBoxN, nb)
    gl.uniform1f(uG.uSoft, SOFT * k)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    return !RM
  }

  const fps = () =>
    performance.now() - pointer.lastMove < 500 || anyRipple() || revR > 0.5 ? 30 : 10
  const loop = createLoop(draw, fps)
  const ro = new ResizeObserver(() => {
    if (resize()) loop.kick()
  })
  ro.observe(host)
  resize()

  return {
    canvas,
    destroy() {
      dead = true
      loop.destroy()
      ro.disconnect()
      pointer.destroy()
      if (atlas) gl.deleteTexture(atlas)
      if (photo) gl.deleteTexture(photo)
      if (den) gl.deleteTexture(den)
      if (denFbo) gl.deleteFramebuffer(denFbo)
      gl.deleteProgram(pDen)
      gl.deleteProgram(pGlyph)
      release(gl)
      canvas.parentNode?.removeChild(canvas)
    },
  }
}

/** Fills `host` with the ink field until destroy(); null when there is no WebGL2. */
export function mountInkField(host: HTMLElement, o: InkOptions): InkHandle | null {
  if (typeof WebGL2RenderingContext === "undefined") return null
  return remountable(() => mount(host, o))
}
