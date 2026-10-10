/* Small WebGL2 plumbing shared by the home ink field and the About path tracer: a context on a fresh canvas, a
   fullscreen triangle, programs and uniforms, sizing with a device-pixel cap, float render targets, and the
   context-loss rebuild the wall uses. Every mount makes its own canvas: a lost context stays lost on its canvas. */

export interface GlCanvas {
  canvas: HTMLCanvasElement
  gl: WebGL2RenderingContext
}

/** Appends a fresh canvas to `host` and gets a WebGL2 context on it; without one the canvas is removed again. */
export function createGl(
  host: HTMLElement,
  o: { alpha: boolean; power?: WebGLPowerPreference },
): GlCanvas | null {
  if (typeof WebGL2RenderingContext === "undefined") return null
  const canvas = document.createElement("canvas")
  canvas.setAttribute("aria-hidden", "true")
  host.appendChild(canvas)
  const gl = canvas.getContext("webgl2", {
    alpha: o.alpha,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: o.power ?? "high-performance",
  })
  if (!gl) {
    host.removeChild(canvas)
    return null
  }
  return { canvas, gl }
}

/** One triangle over the whole screen from gl_VertexID; vUv runs 0..1 across the canvas, y up. */
export const TRI_VS = `#version 300 es
out vec2 vUv;
void main(){
  vec2 p = vec2(float((gl_VertexID & 1) << 2), float((gl_VertexID & 2) << 1)) - 1.0;
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`

function shader(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)
  if (!s) throw new Error("createShader failed")
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s) || "shader compile failed"
    gl.deleteShader(s)
    throw new Error(log)
  }
  return s
}

/** Links a fragment shader against the fullscreen triangle (or the given vertex shader); throws the info log. */
export function program(gl: WebGL2RenderingContext, fs: string, vs = TRI_VS): WebGLProgram {
  const p = gl.createProgram()
  if (!p) throw new Error("createProgram failed")
  const v = shader(gl, gl.VERTEX_SHADER, vs)
  const f = shader(gl, gl.FRAGMENT_SHADER, fs)
  gl.attachShader(p, v)
  gl.attachShader(p, f)
  gl.linkProgram(p)
  gl.deleteShader(v)
  gl.deleteShader(f)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p) || "program link failed"
    gl.deleteProgram(p)
    throw new Error(log)
  }
  return p
}

/** Binds a program (named so the hooks lint does not read a bare `use` as a React hook). */
export function bindProgram(gl: WebGL2RenderingContext, p: WebGLProgram) {
  gl.useProgram(p)
}

export function locs<T extends string>(
  gl: WebGL2RenderingContext,
  p: WebGLProgram,
  names: readonly T[],
): Record<T, WebGLUniformLocation | null> {
  const out = {} as Record<T, WebGLUniformLocation | null>
  for (const n of names) out[n] = gl.getUniformLocation(p, n)
  return out
}

/** Sizes the bitmap to the css box times the device pixel ratio (capped) times `scale`; resizes only on a change. */
export function fit(
  c: HTMLCanvasElement,
  maxDpr: number,
  scale = 1,
): { w: number; h: number; k: number; changed: boolean } {
  const cw = c.clientWidth
  const ch = c.clientHeight
  if (!cw || !ch) return { w: 0, h: 0, k: 1, changed: false }
  const k = Math.min(devicePixelRatio || 1, maxDpr) * scale
  const w = Math.max(1, Math.round(cw * k))
  const h = Math.max(1, Math.round(ch * k))
  const changed = c.width !== w || c.height !== h
  if (changed) {
    c.width = w
    c.height = h
  }
  return { w, h, k, changed }
}

/** An empty 2D texture, clamped, with the given filter (a mipmap min filter gets a linear mag filter). */
export function tex2d(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  internal: GLenum,
  format: GLenum,
  type: GLenum,
  filter: GLenum,
): WebGLTexture {
  const t = gl.createTexture()
  if (!t) throw new Error("createTexture failed")
  gl.bindTexture(gl.TEXTURE_2D, t)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MAG_FILTER,
    filter === gl.NEAREST || filter === gl.NEAREST_MIPMAP_NEAREST ? gl.NEAREST : gl.LINEAR,
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null)
  return t
}

/** A framebuffer drawing into `tex`; throws when the attachment is not renderable. */
export function fbo(gl: WebGL2RenderingContext, tex: WebGLTexture): WebGLFramebuffer {
  const f = gl.createFramebuffer()
  if (!f) throw new Error("createFramebuffer failed")
  gl.bindFramebuffer(gl.FRAMEBUFFER, f)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  const st = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  if (st !== gl.FRAMEBUFFER_COMPLETE) {
    gl.deleteFramebuffer(f)
    throw new Error("framebuffer incomplete: " + st)
  }
  return f
}

export interface FloatTarget {
  internal: GLenum
  type: GLenum
  bits: 32 | 16
}

/** A renderable float format: 32-bit where EXT_color_buffer_float exists (16-bit when asked, which that extension
    also covers), 16-bit from the half-float extension, or null. */
export function floatTarget(gl: WebGL2RenderingContext, prefer16 = false): FloatTarget | null {
  if (gl.getExtension("EXT_color_buffer_float"))
    return prefer16
      ? { internal: gl.RGBA16F, type: gl.HALF_FLOAT, bits: 16 }
      : { internal: gl.RGBA32F, type: gl.FLOAT, bits: 32 }
  if (gl.getExtension("EXT_color_buffer_half_float"))
    return { internal: gl.RGBA16F, type: gl.HALF_FLOAT, bits: 16 }
  return null
}

/** Gives the context back to the browser right away instead of waiting for garbage collection. */
export function release(gl: WebGL2RenderingContext) {
  gl.getExtension("WEBGL_lose_context")?.loseContext()
}

export interface Mounted {
  canvas: HTMLCanvasElement
  destroy(): void
}

/** Builds the effect with `make` and builds it again when its context is lost and comes back (the wall's pattern:
    the lost event is prevented so the browser restores, then the old mount is torn down and a fresh one made). */
export function remountable(make: () => Mounted | null): { destroy(): void } {
  let inner: Mounted | null = null
  let dead = false
  const build = () => {
    inner = make()
    if (!inner) return
    const c = inner.canvas
    c.addEventListener("webglcontextlost", (e) => e.preventDefault())
    c.addEventListener("webglcontextrestored", () => {
      if (dead) return
      inner?.destroy()
      build()
    })
  }
  build()
  return {
    destroy() {
      dead = true
      inner?.destroy()
      inner = null
    },
  }
}
