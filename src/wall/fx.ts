/* Procedural stand-ins for entries without a picture. `mountFx(el, name)` fills `el` with a canvas and animates it
   until `unmountFx(el)`. One effect so far: 'code-apple', the Apple mark set in a dense grid of code glyphs in
   editor colours on near-black (after the WWDC 2014 art). */
import type { FxName } from "../data/types"

interface Effect {
  fps: number
  ready: Promise<unknown>
  size(w: number, h: number, dpr: number): void
  tick(now: number): void
}

interface Cell {
  x: number
  y: number
  ch: string
  col: string
}

export interface FxHandle {
  destroy(): void
}

const APPLE = new Path2D(
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
)
const TOK =
  "{ } ( ) [ ] ; : = < > / \\ * + - # $ % & ! ? . , | ~ ^ @ 0 1 == != => -> && || ++ if do for let var try fn".split(
    " ",
  )
const PAL = ["#3fb950", "#39c5cf", "#4493f8", "#ab7df8", "#f778ba", "#ff9f43", "#e3b341", "#c9d1d9"]
const BG = "#0b0b0b"
const BONE = "#e9e6e1"
const MONO = '"B612 Mono", ui-monospace, Menlo, monospace'

const lcg = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

const pick = <T>(xs: T[], r: number) => xs[(r * xs.length) | 0]!

function codeApple(c: HTMLCanvasElement): Effect | null {
  const ctx = c.getContext("2d")
  if (!ctx) return null
  let cells: Cell[] = []
  let hot: Cell[] = []
  let cw = 0
  let ch = 0
  const glyph = (k: Cell, col?: string) => {
    ctx.fillStyle = BG
    ctx.fillRect(k.x - cw / 2, k.y - ch / 2, cw, ch)
    ctx.fillStyle = col || k.col
    ctx.fillText(k.ch, k.x, k.y)
  }
  return {
    fps: 12,
    ready: document.fonts?.load
      ? document.fonts.load('12px "B612 Mono"').catch(() => undefined)
      : Promise.resolve(),
    /* the mark fills .62 of the shorter side; rows of 1/40 of its height (never under 7 css px); cells .6 as wide as tall */
    size(W, H, dpr) {
      const L = 0.62 * Math.min(W, H)
      const rows = Math.max(18, Math.min(40, Math.floor(L / 7)))
      ch = L / rows
      cw = ch * 0.6
      const cols = Math.ceil(L / cw)
      const x0 = (W - L) / 2
      const y0 = (H - L) / 2
      /* coverage mask, one pixel per cell */
      const m = document.createElement("canvas")
      m.width = cols
      m.height = rows
      const g = m.getContext("2d")
      if (!g) return
      g.setTransform(cols / 24, 0, 0, rows / 24, 0, 0)
      g.fill(APPLE)
      const a = g.getImageData(0, 0, cols, rows).data
      const inside = (r: number, k: number) => k < cols && (a[(r * cols + k) * 4 + 3] ?? 0) > 100
      const rnd = lcg(7)
      cells = []
      hot = []
      for (let r = 0; r < rows; r++)
        for (let k = 0; k < cols; k++) {
          if (!inside(r, k)) continue
          const t = pick(TOK, rnd())
          const col = pick(PAL, rnd())
          let j = 0
          for (; j < t.length && inside(r, k + j); j++)
            cells.push({ x: x0 + (k + j + 0.5) * cw, y: y0 + (r + 0.5) * ch, ch: t[j]!, col })
          k += j - 1
        }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, W, H)
      ctx.font = (ch * 0.78).toFixed(2) + "px " + MONO
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      for (const cell of cells) {
        ctx.fillStyle = cell.col
        ctx.fillText(cell.ch, cell.x, cell.y)
      }
    },
    /* five cells a tick light up bone, then settle on a new glyph and colour */
    tick() {
      hot.forEach((k) => glyph(k))
      hot = []
      for (let i = 0; i < 5 && cells.length; i++) {
        const k = pick(cells, Math.random())
        const t = pick(TOK, Math.random())
        k.ch = t[(Math.random() * t.length) | 0]!
        k.col = pick(PAL, Math.random())
        glyph(k, BONE)
        hot.push(k)
      }
    },
  }
}

const EFFECTS: Record<FxName, (c: HTMLCanvasElement) => Effect | null> = { "code-apple": codeApple }
const mounted = new WeakMap<HTMLElement, FxHandle>()

export function mountFx(el: HTMLElement, name: FxName): FxHandle | null {
  const had = mounted.get(el)
  if (had) return had
  const make = EFFECTS[name] ?? codeApple
  const c = document.createElement("canvas")
  c.className = "fx fx-" + name
  el.appendChild(c)
  const fx = make(c)
  if (!fx) {
    el.removeChild(c)
    return null
  }
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches
  let raf = 0
  let last = 0
  let dead = false
  const handle: FxHandle = {
    destroy() {
      dead = true
      cancelAnimationFrame(raf)
      c.parentNode?.removeChild(c)
      mounted.delete(el)
    },
  }
  const frame = (now: number) => {
    if (dead || !c.isConnected) {
      mounted.delete(el)
      return
    }
    raf = requestAnimationFrame(frame)
    if (now - last < 1000 / fx.fps || !c.clientWidth || !c.clientHeight) return
    last = now
    const dpr = Math.min(devicePixelRatio || 1, 2)
    const w = Math.round(c.clientWidth * dpr)
    const h = Math.round(c.clientHeight * dpr)
    if (c.width !== w || c.height !== h) {
      c.width = w
      c.height = h
      fx.size(c.clientWidth, c.clientHeight, dpr)
    } else if (!rm) fx.tick(now)
  }
  void fx.ready.then(() => {
    if (!dead) raf = requestAnimationFrame(frame)
  })
  mounted.set(el, handle)
  return handle
}

export function unmountFx(el: HTMLElement | null) {
  if (el) mounted.get(el)?.destroy()
}

export const hasFx = (el: HTMLElement) => mounted.has(el)
