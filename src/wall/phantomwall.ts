/* PhantomWall: an endless draggable cell grid wrapped on a curved surface (WebGL2), phantom.land style.
   Every cell (hairlines, tiny mono text, chips) is drawn analytically or into a per-cell canvas texture, so it all
   curves with the surface. The thumbnail inside a cell is sampled from its own true-colour layer (never tinted,
   only faded at the far edge). Without WebGL2, or under reduced motion, a static scrolling grid takes its place.
   Styles live in styles/phantomwall.css; colours come through the --pw-* variables set on the host. */

export interface WallItem {
  id: string
  title: string
  group: string
  year: string
  award: string
  /** Thumbnail URL. */
  thumb: string
}

export interface WallRect {
  x: number
  y: number
  w: number
  h: number
}

export interface WallTheme {
  bg: string
  line: string
  ink: string
  accent: string
  mono: string
}

export interface WallOptions {
  items: readonly WallItem[]
  theme?: Partial<WallTheme>
  hint?: boolean
  captureWheel?: boolean
  onOpen?(id: string): void
  onHover?(id: string | null, rect: WallRect | null): void
}

export interface WallApi {
  destroy(): void
  /** Glides the wall so the piece sits at the centre. */
  focus(id: string): void
  resize(): void
  readonly mode: "webgl" | "static"
}

const TH: WallTheme = {
  bg: "#0e0f12",
  line: "rgba(255,255,255,.16)",
  ink: "#e9e6e1",
  accent: "#d4201c",
  mono: '"B612 Mono", ui-monospace, Menlo, monospace',
}

type RGBA = [number, number, number, number]

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)

function parseColor(c: string | undefined, fb: RGBA): RGBA {
  let m: RegExpMatchArray | null
  if (typeof c !== "string") return fb
  if ((m = c.match(/^#([0-9a-f]{3})$/i))) {
    const h = m[1]!
    return [
      parseInt(h[0]! + h[0], 16) / 255,
      parseInt(h[1]! + h[1], 16) / 255,
      parseInt(h[2]! + h[2], 16) / 255,
      1,
    ]
  }
  if ((m = c.match(/^#([0-9a-f]{6})/i))) {
    const v = m[1]!
    return [
      parseInt(v.slice(0, 2), 16) / 255,
      parseInt(v.slice(2, 4), 16) / 255,
      parseInt(v.slice(4, 6), 16) / 255,
      1,
    ]
  }
  if ((m = c.match(/rgba?\(([^)]+)\)/i))) {
    const p = m[1]!
      .split(/[ ,/]+/)
      .filter(Boolean)
      .map(parseFloat)
    return [p[0]! / 255, p[1]! / 255, p[2]! / 255, p.length > 3 ? p[3]! : 1]
  }
  return fb
}

const rgba = (c: RGBA, a: number) =>
  `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`

/* chips: the medium bottom left; a real award (medal, key, prize) gets its own pill bottom right */
const chipsOf = (w: WallItem) => (w.group ? [w.group] : [])
const awardOf = (w: WallItem) => {
  const a = w.award || ""
  return /medal|key|prize|winner|award/i.test(a)
    ? a.replace(/^Scholastic Art & Writing Awards\s*/i, "")
    : ""
}

const VS =
  "#version 300 es\nprecision highp float;\nuniform vec2 uView;out vec2 vP;\n" +
  "void main(){vec2 q=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vec2 n=q*2.0-1.0;gl_Position=vec4(n,0.0,1.0);vP=vec2(n.x*uView.x*0.5,-n.y*uView.y*0.5);}"
const FS =
  "#version 300 es\nprecision highp float;precision highp sampler2DArray;\n" +
  "in vec2 vP;out vec4 o;\n" +
  "uniform sampler2DArray uC,uI;uniform vec2 uView,uOff,uTilt,uHov,uCell,uBox;\n" +
  "uniform float uR,uD,uZoom,uHovT,uIntro,uKv;uniform int uN;uniform float uFade[32];\n" +
  "uniform vec3 uBg,uLine,uInk;uniform float uLineA;\n" +
  "void main(){\n" +
  " vec2 s=vP/uZoom;\n" +
  " vec3 dir=vec3(s-uTilt,-uD);vec3 m=vec3(uTilt,uD-uR);\n" +
  " float a=dot(dir,dir),b=2.0*dot(m,dir),cc=dot(m,m)-uR*uR;float disc=b*b-4.0*a*cc;\n" +
  " if(disc<0.0){o=vec4(uBg,1.0);return;}\n" +
  " float t=(-b+sqrt(disc))/(2.0*a);vec3 P=m+t*dir;\n" +
  " float ax=atan(P.x,-P.z),ay=asin(clamp(P.y/uR,-1.0,1.0));\n" +
  " vec2 w=(vec2(ax,ay*uKv)*uR+uOff)/uCell;\n" +
  " vec2 ij=floor(w),lc=w-ij;vec2 dx=dFdx(w),dy=dFdy(w);\n" +
  " int N=uN;int idx=((int(ij.x)*3+int(ij.y)*5)%N+N)%N;\n" +
  " vec3 col=uBg;\n" +
  " float hv=(abs(ij.x-uHov.x)<0.5&&abs(ij.y-uHov.y)<0.5)?uHovT:0.0;\n" +
  " float gx=length(vec2(dx.x,dy.x)),gy=length(vec2(dx.y,dy.y));\n" +
  " float d=min(min(lc.x,1.0-lc.x)/max(gx,1e-6),min(lc.y,1.0-lc.y)/max(gy,1e-6));\n" +
  " float la=1.0-smoothstep(0.3,0.3+1.0+hv*0.8,d);\n" +
  " vec3 lcol=mix(uLine,uInk,hv*0.7);float lal=mix(uLineA,min(1.0,uLineA+0.55),hv);\n" +
  " col=mix(col,lcol,la*lal);\n" +
  " vec4 ch=textureGrad(uC,vec3(lc,float(idx)),dx,dy);col=col*(1.0-ch.a)+ch.rgb;\n" +
  " float sc=1.0+0.07*hv;vec2 li=(lc-0.5)/(uBox*sc)+0.5;\n" +
  " if(li.x>0.0&&li.x<1.0&&li.y>0.0&&li.y<1.0){vec2 g=1.0/(uBox*sc);vec4 im=textureGrad(uI,vec3(li,float(idx)),dx*g.x,dy*g.y);float f=uFade[idx];col=col*(1.0-im.a*f)+im.rgb*f;}\n" +
  " float ang=length(vec2(ax,ay));float fe=(1.0-smoothstep(0.95,1.3,ang))*uIntro;\n" +
  " o=vec4(mix(uBg,col,fe),1.0);\n}"

type CanvasEvents = HTMLElementEventMap & {
  webglcontextlost: WebGLContextEvent
  webglcontextrestored: WebGLContextEvent
}

const UNIFORMS = [
  "uC",
  "uI",
  "uView",
  "uOff",
  "uTilt",
  "uHov",
  "uCell",
  "uBox",
  "uR",
  "uD",
  "uZoom",
  "uHovT",
  "uIntro",
  "uKv",
  "uN",
  "uFade",
  "uBg",
  "uLine",
  "uInk",
  "uLineA",
] as const
type UniformName = (typeof UNIFORMS)[number]

interface Cell {
  i: number
  j: number
  k: number
  key: string
}

interface Piece {
  state: number
  ar: number
  t0: number
  im: HTMLImageElement | null
}

interface Sample {
  x: number
  y: number
  t: number
}

/** Mounts the wall into `el`. The returned handle keeps working across a lost-and-restored WebGL context. */
export function mountPhantomWall(el: HTMLElement, opts: WallOptions): WallApi {
  let inner = mount(el, opts, () => {
    inner = mount(el, opts, remount)
  })
  const remount = () => {
    inner = mount(el, opts, remount)
  }
  return {
    destroy: () => inner.destroy(),
    focus: (id) => inner.focus(id),
    resize: () => inner.resize(),
    get mode() {
      return inner.mode
    },
  }
}

function mount(el: HTMLElement, opts: WallOptions, onRestore: () => void): WallApi {
  const theme: WallTheme = {
    ...TH,
    ...Object.fromEntries(Object.entries(opts.theme ?? {}).filter(([, v]) => v != null)),
  }
  const cBg = parseColor(theme.bg, [0.02, 0.02, 0.024, 1])
  const cLine = parseColor(theme.line, [1, 1, 1, 0.16])
  const cInk = parseColor(theme.ink, [0.9, 0.9, 0.88, 1])
  const cAcc = parseColor(theme.accent, [0.83, 0.13, 0.11, 1])
  const items = opts.items.slice(0, 32)
  const onOpen = opts.onOpen ?? (() => {})
  const onHover = opts.onHover ?? (() => {})
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
  const full = el.clientHeight >= innerHeight * 0.8 && el.clientWidth >= innerWidth * 0.8
  const captureWheel = opts.captureWheel == null ? full : !!opts.captureWheel
  const byId = new Map<string, number>()
  items.forEach((w, i) => byId.set(w.id, i))
  const N = items.length
  let destroyed = false

  el.classList.add("pw")
  el.style.setProperty("--pw-bg", theme.bg)
  el.style.setProperty("--pw-line", theme.line)
  el.style.setProperty("--pw-ink", theme.ink)
  el.style.setProperty("--pw-mono", theme.mono)
  el.style.setProperty("--pw-chip", rgba(cInk, 0.42))
  el.style.setProperty("--pw-acc", rgba(cAcc, 0.8))
  if (getComputedStyle(el).position === "static") el.style.position = "relative"
  let hintEl: HTMLElement | null = null
  const addHint = (touch: boolean) => {
    if (!opts.hint) return
    hintEl = document.createElement("div")
    hintEl.className = "pw-hint"
    hintEl.setAttribute("aria-hidden", "true")
    hintEl.textContent = touch
      ? "DRAG TO EXPLORE · TAP TO ENLARGE"
      : "DRAG TO EXPLORE · CLICK TO ENLARGE"
    el.appendChild(hintEl)
  }

  /* ---- static fallback ---- */
  function mountStatic(): WallApi {
    const wrap = document.createElement("div")
    wrap.className = "pw-static"
    const ul = document.createElement("ul")
    ul.className = "pw-grid"
    ul.setAttribute("aria-label", "Artworks")
    const rel = (b: HTMLElement): WallRect => {
      const a = el.getBoundingClientRect()
      const r = b.getBoundingClientRect()
      return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height }
    }
    items.forEach((w) => {
      const li = document.createElement("li")
      const b = document.createElement("button")
      b.type = "button"
      b.className = "pw-cell"
      b.setAttribute("data-id", w.id)
      b.setAttribute("aria-label", w.title + (w.group ? ", " + w.group : ""))
      const title = document.createElement("span")
      title.className = "tr"
      title.textContent = w.title
      const img = document.createElement("img")
      img.src = w.thumb
      img.alt = ""
      img.loading = "lazy"
      img.decoding = "async"
      const bl = document.createElement("span")
      bl.className = "bl"
      chipsOf(w).forEach((c) => {
        const i = document.createElement("i")
        i.textContent = c
        bl.appendChild(i)
      })
      b.append(title, img, bl)
      const aw = awardOf(w)
      if (aw) {
        const br = document.createElement("span")
        br.className = "br"
        const i = document.createElement("i")
        i.textContent = aw
        br.appendChild(i)
        b.appendChild(br)
      }
      b.addEventListener("click", () => onOpen(w.id))
      b.addEventListener("mouseenter", () => onHover(w.id, rel(b)))
      b.addEventListener("mouseleave", () => onHover(null, null))
      b.addEventListener("focus", () => onHover(w.id, rel(b)))
      b.addEventListener("blur", () => onHover(null, null))
      li.appendChild(b)
      ul.appendChild(li)
    })
    wrap.appendChild(ul)
    el.appendChild(wrap)
    addHint(false)
    if (hintEl) hintEl.textContent = "SCROLL TO EXPLORE · CLICK TO ENLARGE"
    return {
      destroy() {
        ;[wrap, hintEl].forEach((n) => n?.parentNode?.removeChild(n))
        el.classList.remove("pw")
      },
      focus(id) {
        const b = wrap.querySelector<HTMLElement>(`[data-id="${id}"]`)
        if (b) {
          b.scrollIntoView({ block: "center" })
          b.focus({ preventScroll: true })
        }
      },
      resize() {},
      mode: "static",
    }
  }

  const canvas = document.createElement("canvas")
  let gl: WebGL2RenderingContext | null = null
  if (!reduce && N) {
    try {
      gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      })
    } catch {
      gl = null
    }
  }
  if (!gl) return mountStatic()
  const G = gl

  const cleanups: (() => void)[] = []
  function on<K extends keyof CanvasEvents>(
    t: HTMLCanvasElement,
    ev: K,
    fn: (e: CanvasEvents[K]) => void,
    o?: AddEventListenerOptions,
  ): void
  function on<K extends keyof HTMLElementEventMap>(
    t: HTMLElement,
    ev: K,
    fn: (e: HTMLElementEventMap[K]) => void,
    o?: AddEventListenerOptions,
  ): void
  function on<K extends keyof WindowEventMap>(
    t: Window,
    ev: K,
    fn: (e: WindowEventMap[K]) => void,
    o?: AddEventListenerOptions,
  ): void
  function on<K extends keyof DocumentEventMap>(
    t: Document,
    ev: K,
    fn: (e: DocumentEventMap[K]) => void,
    o?: AddEventListenerOptions,
  ): void
  function on(t: EventTarget, ev: string, fn: EventListener, o?: AddEventListenerOptions) {
    t.addEventListener(ev, fn, o)
    cleanups.push(() => t.removeEventListener(ev, fn, o))
  }
  const sh = (type: number, src: string) => {
    const s = G.createShader(type)
    if (!s) throw new Error("PhantomWall: no shader")
    G.shaderSource(s, src)
    G.compileShader(s)
    if (!G.getShaderParameter(s, G.COMPILE_STATUS))
      throw new Error(G.getShaderInfoLog(s) ?? "shader")
    return s
  }
  let prog: WebGLProgram
  try {
    prog = G.createProgram()
    G.attachShader(prog, sh(G.VERTEX_SHADER, VS))
    G.attachShader(prog, sh(G.FRAGMENT_SHADER, FS))
    G.linkProgram(prog)
    if (!G.getProgramParameter(prog, G.LINK_STATUS))
      throw new Error(G.getProgramInfoLog(prog) ?? "link")
  } catch (e) {
    console.warn("PhantomWall: shader failed, using static grid", e)
    return mountStatic()
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks -- a WebGL method, not a React hook
  G.useProgram(prog)
  const U = {} as Record<UniformName, WebGLUniformLocation | null>
  UNIFORMS.forEach((n) => (U[n] = G.getUniformLocation(prog, n)))
  G.bindVertexArray(G.createVertexArray())
  let maxAn = 0
  const aniso = G.getExtension("EXT_texture_filter_anisotropic")
  if (aniso) maxAn = Math.min(8, G.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number)

  canvas.setAttribute("aria-hidden", "true")
  el.appendChild(canvas)
  const list = document.createElement("ul")
  list.className = "pw-list"
  list.setAttribute("aria-label", "Artworks")
  items.forEach((w) => {
    const li = document.createElement("li")
    const b = document.createElement("button")
    b.type = "button"
    b.textContent = w.title + (w.group ? ", " + w.group : "") + (w.year ? ", " + w.year : "")
    b.addEventListener("click", () => onOpen(w.id))
    b.addEventListener("focus", () => {
      if (b.matches(":focus-visible")) focusId(w.id)
    })
    li.appendChild(b)
    list.appendChild(li)
  })
  el.appendChild(list)
  addHint(false)

  /* ---- state ---- */
  let W = 0
  let H = 0
  let dpr = 1
  let R = 1000
  let D = 3000
  const KV = 1.6
  const KD = 0.7
  let cw = 290
  let ch = 300
  let chW = 480
  const BOXF = 0.66
  const IS = 512
  let LW = 0
  let LH = 0
  let cTex: WebGLTexture | null = null
  let iTex: WebGLTexture | null = null
  let levelsC = 1
  let levelsI = 1
  let ox = 0
  let oy = 0
  let vx = 0
  let vy = 0
  let px = 0
  let py = 0
  const tilt = [0, 0]
  let zoom = 1
  let zoomT = 1
  let intro = 0
  const pieces: (Piece | undefined)[] = new Array(N)
  const queue: number[] = []
  const fadeArr = new Float32Array(32)
  let hovI = -9999
  let hovJ = -9999
  let hovT = 0
  let hovKey: string | null = null
  let hovId: string | null = null
  let touchMode = false
  let mx = -1
  let my = -1
  let mouseIn = false
  let dragging = false
  let moved = 0
  let pid: number | null = null
  let sx0 = 0
  let sy0 = 0
  let samples: Sample[] = []
  let raf = 0
  let last = 0
  let onscreen = true
  let tabVisible = !document.hidden
  let t0 = 0
  let settleCb = false
  const chromeCv = document.createElement("canvas")
  const imgCv = document.createElement("canvas")
  imgCv.width = imgCv.height = IS
  const chromeCtx = chromeCv.getContext("2d")!
  const imgCtx = imgCv.getContext("2d")!

  const pieceAt = (i: number, j: number) => (((i * 3 + j * 5) % N) + N) % N

  /* ---- projection (JS mirror of the fragment shader) ---- */
  function toWall(sx: number, sy: number) {
    const zx = sx / zoom
    const zy = sy / zoom
    const dX = zx - tilt[0]!
    const dY = zy - tilt[1]!
    const dZ = -D
    const mX = tilt[0]!
    const mY = tilt[1]!
    const mZ = D - R
    const a = dX * dX + dY * dY + dZ * dZ
    const b = 2 * (mX * dX + mY * dY + mZ * dZ)
    const c = mX * mX + mY * mY + mZ * mZ - R * R
    const disc = b * b - 4 * a * c
    if (disc < 0) return null
    const t = (-b + Math.sqrt(disc)) / (2 * a)
    const X = mX + t * dX
    const Y = mY + t * dY
    const Z = mZ + t * dZ
    const ax = Math.atan2(X, -Z)
    const ay = Math.asin(clamp(Y / R, -1, 1))
    return { u: ax * R + ox, v: ay * KV * R + oy, ang: Math.sqrt(ax * ax + ay * ay) }
  }
  function toScreen(u: number, v: number): [number, number] {
    const ax = (u - ox) / R
    const ay = (v - oy) / (R * KV)
    const X = R * Math.sin(ax) * Math.cos(ay)
    const Y = R * Math.sin(ay)
    const Z = R - R * Math.cos(ax) * Math.cos(ay)
    const f = D / (D - Z)
    const sx = tilt[0]! + (X - tilt[0]!) * f
    const sy = tilt[1]! + (Y - tilt[1]!) * f
    return [W / 2 + sx * zoom, H / 2 + sy * zoom]
  }
  function cellAt(sx: number, sy: number): Cell | null {
    const p = toWall(sx - W / 2, sy - H / 2)
    if (!p || p.ang > 1.15) return null
    const i = Math.floor(p.u / cw)
    const j = Math.floor(p.v / chW)
    return { i, j, k: pieceAt(i, j), key: i + "," + j }
  }
  function rectOf(c: Cell): WallRect & { ix: number; iy: number; iw: number; ih: number } {
    const a = toScreen(c.i * cw, c.j * chW)
    const b = toScreen((c.i + 1) * cw, c.j * chW)
    const d = toScreen((c.i + 1) * cw, (c.j + 1) * chW)
    const e = toScreen(c.i * cw, (c.j + 1) * chW)
    const x0 = Math.min(a[0], b[0], d[0], e[0])
    const x1 = Math.max(a[0], b[0], d[0], e[0])
    const y0 = Math.min(a[1], b[1], d[1], e[1])
    const y1 = Math.max(a[1], b[1], d[1], e[1])
    const cc = toScreen((c.i + 0.5) * cw, (c.j + 0.5) * chW)
    const pr = pieces[c.k]
    const ar = pr && pr.ar ? pr.ar : 1
    const bw = BOXF * cw
    const bh = BOXF * cw
    let iw = bw
    let ih = bw / ar
    if (ih > bh) {
      ih = bh
      iw = bh * ar
    }
    const sc = (x1 - x0) / cw
    return {
      x: x0,
      y: y0,
      w: x1 - x0,
      h: y1 - y0,
      ix: cc[0] - (iw * sc) / 2,
      iy: cc[1] - (ih * sc) / 2,
      iw: iw * sc,
      ih: ih * sc,
    }
  }

  /* ---- layout / textures ---- */
  const chromeQueue: number[] = []
  const chromeQ = (k: number) => {
    if (chromeQueue.indexOf(k) < 0) chromeQueue.push(k)
  }
  function layout() {
    const r = el.getBoundingClientRect()
    W = Math.max(1, Math.round(el.clientWidth || r.width))
    H = Math.max(1, Math.round(el.clientHeight || r.height))
    dpr = Math.min(2, window.devicePixelRatio || 1)
    if (W * H * dpr * dpr > 4.6e6) dpr = Math.sqrt(4.6e6 / (W * H))
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const cols = W > 1000 ? 4.9 : W > 640 ? 3.6 : 2.1
    cw = W / cols
    ch = cw * 1.04
    chW = ch * KV
    const m = Math.max(W, H)
    R = m * (W > 640 ? 1.1 : 1.15)
    D = R * KD
    const nlw = Math.round(clamp(cw * 2, 256, 1100))
    const nlh = Math.round((nlw * ch) / cw)
    if (nlw !== LW || nlh !== LH || !cTex) {
      LW = nlw
      LH = nlh
      allocTextures()
      for (let k = 0; k < N; k++) {
        chromeQ(k)
        const p = pieces[k]
        if (p && p.state >= 2) {
          p.state = 1
          queue.push(k)
        }
      }
    }
    kick()
  }
  function allocTextures() {
    if (cTex) {
      G.deleteTexture(cTex)
      G.deleteTexture(iTex)
    }
    levelsC = Math.floor(Math.log2(Math.max(LW, LH))) + 1
    levelsI = Math.floor(Math.log2(IS)) + 1
    cTex = G.createTexture()
    G.bindTexture(G.TEXTURE_2D_ARRAY, cTex)
    G.texStorage3D(G.TEXTURE_2D_ARRAY, levelsC, G.RGBA8, LW, LH, Math.max(1, N))
    texParams()
    iTex = G.createTexture()
    G.bindTexture(G.TEXTURE_2D_ARRAY, iTex)
    G.texStorage3D(G.TEXTURE_2D_ARRAY, levelsI, G.RGBA8, IS, IS, Math.max(1, N))
    texParams()
    chromeCv.width = LW
    chromeCv.height = LH
  }
  function texParams() {
    G.texParameteri(G.TEXTURE_2D_ARRAY, G.TEXTURE_MIN_FILTER, G.LINEAR_MIPMAP_LINEAR)
    G.texParameteri(G.TEXTURE_2D_ARRAY, G.TEXTURE_MAG_FILTER, G.LINEAR)
    G.texParameteri(G.TEXTURE_2D_ARRAY, G.TEXTURE_WRAP_S, G.CLAMP_TO_EDGE)
    G.texParameteri(G.TEXTURE_2D_ARRAY, G.TEXTURE_WRAP_T, G.CLAMP_TO_EDGE)
    if (aniso) G.texParameterf(G.TEXTURE_2D_ARRAY, aniso.TEXTURE_MAX_ANISOTROPY_EXT, maxAn)
  }
  function fit(g: CanvasRenderingContext2D, txt: string, maxW: number) {
    if (g.measureText(txt).width <= maxW) return txt
    while (txt.length > 1 && g.measureText(txt + "…").width > maxW) txt = txt.slice(0, -1)
    return txt + "…"
  }
  function drawChrome(k: number) {
    const w = items[k]!
    const g = chromeCtx
    const sc = LW / cw
    const pad = cw < 230 ? 11 : 14
    const fs = cw < 230 ? 8.5 : 9.5
    const mono = theme.mono
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, LW, LH)
    g.setTransform(sc, 0, 0, sc, 0, 0)
    g.textBaseline = "middle"
    try {
      g.letterSpacing = "0.5px"
    } catch {
      /* older engines */
    }
    g.font = "400 " + fs + "px " + mono
    const title = String(w.title || "").toUpperCase()
    const ty = pad + 5
    g.textAlign = "right"
    g.fillStyle = rgba(cInk, 0.92)
    g.fillText(fit(g, title, cw - pad * 2), cw - pad, ty)
    /* chips: medium bottom left, award bottom right */
    const chips = chipsOf(w)
    let cx = pad
    const cy = ch - pad - 6
    const aw = awardOf(w).toUpperCase()
    g.font = "400 " + (fs - 1) + "px " + mono
    g.lineWidth = 0.8
    const pill = (txt: string, x: number, right: boolean, stroke: string) => {
      const cwid = g.measureText(txt).width + 12
      const h = 15
      const r = h / 2
      const y = cy - h / 2
      if (right) x -= cwid
      g.strokeStyle = stroke
      g.beginPath()
      g.moveTo(x + r, y)
      g.arcTo(x + cwid, y, x + cwid, y + h, r)
      g.arcTo(x + cwid, y + h, x, y + h, r)
      g.arcTo(x, y + h, x, y, r)
      g.arcTo(x, y, x + cwid, y, r)
      g.closePath()
      g.stroke()
      g.textAlign = "left"
      g.fillStyle = rgba(cInk, 0.85)
      g.fillText(txt, x + 6, cy + 0.5)
      return cwid
    }
    const awW = aw ? g.measureText(aw).width + 12 : 0
    chips.forEach((c) => {
      const txt = c.toUpperCase()
      const cwid = g.measureText(txt).width + 12
      if (cx + cwid > cw - pad - awW - 8) return
      cx += pill(txt, cx, false, rgba(cInk, 0.42)) + 5
    })
    if (aw) pill(aw, cw - pad, true, rgba(cAcc, 0.8))
    G.bindTexture(G.TEXTURE_2D_ARRAY, cTex)
    G.pixelStorei(G.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    G.pixelStorei(G.UNPACK_COLORSPACE_CONVERSION_WEBGL, G.NONE)
    G.texSubImage3D(G.TEXTURE_2D_ARRAY, 0, 0, 0, k, LW, LH, 1, G.RGBA, G.UNSIGNED_BYTE, chromeCv)
    G.generateMipmap(G.TEXTURE_2D_ARRAY)
  }
  function want(k: number) {
    const had = pieces[k]
    if (had) return had
    const t: Piece = { state: 0, ar: 1, t0: 0, im: null }
    pieces[k] = t
    const im = new Image()
    im.decoding = "async"
    im.crossOrigin = "anonymous"
    t.im = im
    im.onload = () => {
      if (destroyed) return
      t.ar = im.naturalWidth / im.naturalHeight
      t.state = 1
      queue.push(k)
      kick()
    }
    im.onerror = () => {
      t.state = -1
    }
    im.src = items[k]!.thumb
    return t
  }
  function uploadImage(k: number) {
    const t = pieces[k]
    if (!t || !t.im || destroyed) return
    const im = t.im
    const g = imgCtx
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, IS, IS)
    const ar = im.naturalWidth / im.naturalHeight
    let w = IS
    let h = IS / ar
    if (h > IS) {
      h = IS
      w = IS * ar
    }
    g.imageSmoothingQuality = "high"
    g.drawImage(im, (IS - w) / 2, (IS - h) / 2, w, h)
    G.bindTexture(G.TEXTURE_2D_ARRAY, iTex)
    G.pixelStorei(G.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    G.pixelStorei(G.UNPACK_COLORSPACE_CONVERSION_WEBGL, G.NONE)
    G.texSubImage3D(G.TEXTURE_2D_ARRAY, 0, 0, 0, k, IS, IS, 1, G.RGBA, G.UNSIGNED_BYTE, imgCv)
    G.generateMipmap(G.TEXTURE_2D_ARRAY)
    t.state = 2
    t.t0 = performance.now()
  }

  /* ---- frame ---- */
  const ease = (t: number) => {
    t = clamp(t, 0, 1)
    return 1 - Math.pow(1 - t, 3)
  }
  function frame(now: number) {
    raf = 0
    if (destroyed) return
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
    last = now
    if (!t0) t0 = now
    let busy = false
    intro = ease((now - t0) / 1100)
    if (intro < 1) busy = true
    if (!dragging) {
      const f = 1 - Math.exp(-dt * 3.2)
      ox += vx * dt
      oy += vy * dt
      vx -= vx * f
      vy -= vy * f
      if (Math.abs(vx) < 4 && Math.abs(vy) < 4) vx = vy = 0
      else busy = true
    }
    if (Math.abs(px) > 0.2 || Math.abs(py) > 0.2) {
      const g = 1 - Math.exp(-dt * 7)
      ox += px * g
      oy += py * g
      px -= px * g
      py -= py * g
      busy = true
    } else {
      ox += px
      oy += py
      px = py = 0
    }
    /* tilt: a little camera swing toward the drag direction, spring back */
    let pv = dragging ? panVel() : [vx, vy]
    const lim = R * 0.2
    pv = [pv[0]!, pv[1]! / KV]
    const tt = [clamp(-pv[0]! * 0.05, -lim, lim), clamp(-pv[1]! * 0.05, -lim, lim)]
    const tk = 1 - Math.exp(-dt * 7)
    tilt[0] = tilt[0]! + (tt[0]! - tilt[0]!) * tk
    tilt[1] = tilt[1]! + (tt[1]! - tilt[1]!) * tk
    if (Math.abs(tilt[0]!) > 0.15 || Math.abs(tilt[1]!) > 0.15) busy = true
    else if (!dragging) tilt[0] = tilt[1] = 0
    const zk = 1 - Math.exp(-dt * 4.5)
    zoom += (zoomT - zoom) * zk
    if (Math.abs(zoomT - zoom) > 0.0008) busy = true
    else zoom = zoomT
    if (dragging) busy = true
    /* lazy textures: wanted = pieces of cells near the view */
    const ext = R * 1.2
    const i0 = Math.floor((ox - ext) / cw)
    const i1 = Math.ceil((ox + ext) / cw)
    const j0 = Math.floor((oy - ext * KV) / chW)
    const j1 = Math.ceil((oy + ext * KV) / chW)
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) want(pieceAt(i, j))
    if (chromeQueue.length) {
      drawChrome(chromeQueue.shift()!)
      busy = true
    } else if (queue.length) {
      uploadImage(queue.shift()!)
      busy = true
    }
    for (let k = 0; k < N; k++) {
      const p = pieces[k]
      let fv = 0
      if (p && p.state === 2) {
        fv = clamp((performance.now() - p.t0) / 500, 0, 1)
        if (fv < 1) busy = true
      }
      fadeArr[k] = fv
    }
    /* hover */
    if (!touchMode && mouseIn && !dragging) setActive(cellAt(mx, my))
    if (dragging && hovKey && !touchMode) setActive(null)
    const ht = hovKey ? 1 : 0
    hovT += (ht - hovT) * (1 - Math.exp(-dt * 12))
    if (Math.abs(ht - hovT) < 0.01) hovT = ht
    else busy = true
    const idle = !busy && !dragging && Math.abs(vx) + Math.abs(vy) < 1
    if (idle && settleCb) {
      settleCb = false
      if (hovKey && !touchMode) fireHover()
    }
    draw()
    el.classList.toggle("is-hit", !!hovKey && !touchMode)
    if (busy && onscreen && tabVisible) raf = requestAnimationFrame(frame)
    else last = 0
  }
  let hovCell: Cell | null = null
  function fireHover() {
    if (hovCell) onHover(items[hovCell.k]!.id, rectOf(hovCell))
  }
  function setActive(c: Cell | null) {
    const key = c ? c.key : null
    if (key === hovKey) {
      if (c) hovCell = c
      return
    }
    hovKey = key
    hovCell = c
    if (c) {
      hovI = c.i
      hovJ = c.j
    }
    const id = c ? items[c.k]!.id : null
    if (id !== hovId || key) {
      hovId = id
      if (c) {
        onHover(id, rectOf(c))
        settleCb = true
      } else onHover(null, null)
    }
    kick()
  }
  function draw() {
    G.viewport(0, 0, canvas.width, canvas.height)
    G.uniform2f(U.uView, W, H)
    G.uniform2f(U.uOff, ox, oy)
    G.uniform2f(U.uTilt, tilt[0]!, tilt[1]!)
    G.uniform2f(U.uHov, hovI, hovJ)
    G.uniform1f(U.uHovT, hovT)
    G.uniform2f(U.uCell, cw, chW)
    G.uniform1f(U.uKv, KV)
    G.uniform2f(U.uBox, BOXF, (BOXF * cw) / ch)
    G.uniform1f(U.uR, R)
    G.uniform1f(U.uD, D)
    G.uniform1f(U.uZoom, zoom * (1 + (1 - intro) * 0.25))
    G.uniform1f(U.uIntro, intro)
    G.uniform1i(U.uN, N)
    G.uniform1fv(U.uFade, fadeArr)
    G.uniform3f(U.uBg, cBg[0], cBg[1], cBg[2])
    G.uniform3f(U.uLine, cLine[0], cLine[1], cLine[2])
    G.uniform3f(U.uInk, cInk[0], cInk[1], cInk[2])
    G.uniform1f(U.uLineA, cLine[3])
    G.activeTexture(G.TEXTURE0)
    G.bindTexture(G.TEXTURE_2D_ARRAY, cTex)
    G.uniform1i(U.uC, 0)
    G.activeTexture(G.TEXTURE1)
    G.bindTexture(G.TEXTURE_2D_ARRAY, iTex)
    G.uniform1i(U.uI, 1)
    G.drawArrays(G.TRIANGLES, 0, 3)
  }
  function kick() {
    if (!raf && !destroyed && onscreen && tabVisible) raf = requestAnimationFrame(frame)
  }

  /* ---- input ---- */
  function panVel(): [number, number] {
    const n = samples.length
    if (n < 2) return [0, 0]
    const a = samples[0]!
    const b = samples[n - 1]!
    const dt = (b.t - a.t) / 1000
    if (dt < 0.001) return [0, 0]
    return [(b.x - a.x) / dt, (b.y - a.y) / dt]
  }
  const loc = (e: PointerEvent): [number, number] => {
    const r = canvas.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }
  let lastX = 0
  let lastY = 0
  let dx0 = 0
  let dy0 = 0
  let wasMoving = false
  on(canvas, "pointerdown", (e) => {
    if (e.button != null && e.button > 0) return
    if (pid != null) return
    pid = e.pointerId
    try {
      canvas.setPointerCapture(e.pointerId)
    } catch {
      /* capture is best effort */
    }
    const l = loc(e)
    sx0 = lastX = l[0]
    sy0 = lastY = l[1]
    mx = l[0]
    my = l[1]
    moved = 0
    dragging = true
    wasMoving = Math.hypot(vx, vy) > 60
    vx = vy = 0
    px = py = 0
    dx0 = dy0 = 0
    zoomT = 1
    samples = [{ x: 0, y: 0, t: performance.now() }]
    touchMode = e.pointerType === "touch" || e.pointerType === "pen"
    el.classList.toggle("is-touch", touchMode)
    el.classList.add("is-drag")
    kick()
  })
  on(canvas, "pointermove", (e) => {
    const l = loc(e)
    if (e.pointerType === "mouse") {
      mx = l[0]
      my = l[1]
      mouseIn = true
      if (touchMode) {
        touchMode = false
        el.classList.remove("is-touch")
      }
      if (!dragging) kick()
    }
    if (!dragging || e.pointerId !== pid) return
    const dx = l[0] - lastX
    const dy = l[1] - lastY
    lastX = l[0]
    lastY = l[1]
    moved = Math.max(moved, Math.hypot(l[0] - sx0, l[1] - sy0))
    ox -= dx
    oy -= dy * KV
    dx0 -= dx
    dy0 -= dy * KV
    const now = performance.now()
    samples.push({ x: dx0, y: dy0, t: now })
    while (samples.length > 2 && now - samples[0]!.t > 90) samples.shift()
    kick()
  })
  function end(e: PointerEvent, cancel: boolean) {
    if (e.pointerId !== pid) return
    const l = loc(e)
    const wasTouch = touchMode
    const sv = panVel()
    const stale = performance.now() - (samples.length ? samples[samples.length - 1]!.t : 0)
    dragging = false
    pid = null
    el.classList.remove("is-drag")
    try {
      canvas.releasePointerCapture(e.pointerId)
    } catch {
      /* already released */
    }
    if (!cancel && moved < (wasTouch ? 12 : 7)) {
      /* a tap (a finger may wobble a few px): opens the piece under it on every input; on touch a tap on a wall that was
         still gliding only stops it, so a stop never opens something by accident */
      vx = vy = 0
      const c = cellAt(l[0], l[1])
      if (wasTouch && wasMoving) setActive(null)
      else if (c) onOpen(items[c.k]!.id)
      else if (wasTouch) setActive(null)
    } else if (!cancel) {
      if (hintEl) hintEl.style.opacity = ""
      if (stale < 90) {
        vx = clamp(sv[0] * 0.75, -3200, 3200)
        vy = clamp(sv[1] * 0.75, -3200, 3200)
      } /* a gentler fling */
      if (wasTouch) setActive(null)
    }
    kick()
  }
  on(canvas, "pointerup", (e) => end(e, false))
  on(canvas, "pointercancel", (e) => end(e, true))
  on(canvas, "pointerleave", (e) => {
    if (e.pointerType === "mouse" && !dragging) {
      mouseIn = false
      if (!touchMode) setActive(null)
    }
  })
  on(canvas, "lostpointercapture", (e) => {
    if (e.pointerId === pid) end(e, true)
  })
  on(canvas, "contextmenu", (e) => e.preventDefault())
  on(
    el,
    "wheel",
    (e) => {
      if (!captureWheel) return
      e.preventDefault()
      zoomT = 1
      const k = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? H : 1
      let dx = e.deltaX * k
      let dy = e.deltaY * k
      if (e.shiftKey && !dx) {
        dx = dy
        dy = 0
      }
      vx = vy = 0
      px = clamp(px + dx * 1.1, -1400, 1400)
      py = clamp(py + dy * 1.1 * KV, -1400 * KV, 1400 * KV)
      kick()
    },
    { passive: false },
  )
  on(window, "keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const ae = document.activeElement
    const inEl = el.contains(ae)
    if (!inEl && !(captureWheel && (ae === document.body || !ae))) return
    if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return
    const s = Math.min(W, H) * 0.34
    let dx = 0
    let dy = 0
    if (e.key === "ArrowLeft") dx = -s
    else if (e.key === "ArrowRight") dx = s
    else if (e.key === "ArrowUp") dy = -s
    else if (e.key === "ArrowDown") dy = s
    else return
    e.preventDefault()
    zoomT = 1
    vx = vy = 0
    px += dx
    py += dy * KV
    kick()
  })
  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver((en) => {
          onscreen = !!en[0]?.isIntersecting
          if (onscreen) kick()
        })
      : null
  io?.observe(el)
  on(document, "visibilitychange", () => {
    tabVisible = !document.hidden
    if (tabVisible) kick()
  })
  const ro = "ResizeObserver" in window ? new ResizeObserver(() => layout()) : null
  if (ro) ro.observe(el)
  else on(window, "resize", layout)
  on(canvas, "webglcontextlost", (e) => e.preventDefault())
  on(canvas, "webglcontextrestored", () => {
    destroy()
    onRestore()
  })
  if (document.fonts?.load) {
    try {
      void document.fonts.load("9.5px " + theme.mono).then(() => {
        if (destroyed) return
        for (let k = 0; k < N; k++) chromeQ(k)
        kick()
      })
    } catch {
      /* fonts API is best effort */
    }
  }

  function nearestCell(k: number): Cell | null {
    let best: Cell | null = null
    let bd = 1e18
    const ci = Math.round(ox / cw - 0.5)
    const cj = Math.round(oy / chW - 0.5)
    for (let i = ci - 8; i <= ci + 8; i++)
      for (let j = cj - 8; j <= cj + 8; j++)
        if (pieceAt(i, j) === k) {
          const dx = (i + 0.5) * cw - ox
          const dy = ((j + 0.5) * chW - oy) / KV
          const d = dx * dx + dy * dy
          if (d < bd) {
            bd = d
            best = { i, j, k, key: i + "," + j }
          }
        }
    return best
  }
  function focusId(id: string) {
    const k = byId.get(id)
    if (k == null) return null
    const c = nearestCell(k)
    if (!c) return null
    vx = vy = 0
    px = (c.i + 0.5) * cw - ox
    py = (c.j + 0.5) * chW - oy
    hovKey = null
    setActive(c)
    kick()
    return c
  }
  function destroy() {
    destroyed = true
    if (raf) cancelAnimationFrame(raf)
    cleanups.forEach((f) => f())
    io?.disconnect()
    ro?.disconnect()
    G.getExtension("WEBGL_lose_context")?.loseContext()
    ;[canvas, list, hintEl].forEach((n) => n?.parentNode?.removeChild(n))
    el.classList.remove("pw", "is-drag", "is-hit", "is-touch")
  }
  layout()
  return {
    destroy,
    focus(id) {
      focusId(id)
    },
    resize: layout,
    mode: "webgl",
  }
}
