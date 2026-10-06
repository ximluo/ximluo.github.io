/* The film furniture that runs for the whole visit: the grain canvas with dust and scratches at 12 fps, the eased
   custom cursor, the running timecode, and one requestAnimationFrame loop that also drives the frame hooks the
   rest of the site registers (auto-advance, the phone bar). */
import { TOUCH } from "../env"
import { wait } from "./tween"

export type FrameHook = (now: number) => void

const hooks: FrameHook[] = []
let flashEl: HTMLElement | null = null

/** Runs `fn` every frame, after the furniture, in registration order. Returns the unsubscribe. */
export function addFrameHook(fn: FrameHook) {
  hooks.push(fn)
  return () => {
    const i = hooks.indexOf(fn)
    if (i >= 0) hooks.splice(i, 1)
  }
}

/** Every .cue dot blinks twice on a cut. The phone bar's dot is re-rendered, so the dots are looked up each time. */
export async function cue() {
  const els = Array.from(document.querySelectorAll(".cue"))
  if (!els.length) return
  for (let k = 0; k < 2; k++) {
    els.forEach((e) => e.classList.add("fl"))
    await wait(70)
    els.forEach((e) => e.classList.remove("fl"))
    await wait(70)
  }
}

/** A one-frame white flash over everything. */
export function flash(a = 0.12) {
  const el = flashEl
  if (!el) return
  el.style.opacity = String(a)
  setTimeout(() => (el.style.opacity = "0"), 40)
}

const timecode = (s: number) => {
  const f = Math.floor((s % 1) * 24)
  const ss = Math.floor(s) % 60
  const m = Math.floor(s / 60) % 60
  const h = Math.floor(s / 3600)
  return [h, m, ss, f].map((v) => String(v).padStart(2, "0")).join(":")
}

interface Scratch {
  x: number
  life: number
  a: number
}

/** Starts the loop on the given elements. Returns a function that stops it and removes its listeners. */
export function startFilm(grain: HTMLCanvasElement, cursor: HTMLElement, flashNode: HTMLElement) {
  flashEl = flashNode
  const g = grain.getContext("2d")
  if (!g) return () => {}
  const tiles: HTMLCanvasElement[] = []
  for (let k = 0; k < 5; k++) {
    const c = document.createElement("canvas")
    c.width = c.height = 128
    const x = c.getContext("2d")
    if (!x) continue
    const d = x.createImageData(128, 128)
    for (let p = 0; p < d.data.length; p += 4) {
      const v = Math.random() < 0.5 ? 0 : 255
      d.data[p] = d.data[p + 1] = d.data[p + 2] = v
      d.data[p + 3] = Math.pow(Math.random(), 2.2) * (v ? 30 : 56)
    }
    x.putImageData(d, 0, 0)
    tiles.push(c)
  }
  const sizeGrain = () => {
    const k = TOUCH ? 0.45 : 0.55
    grain.width = Math.ceil(innerWidth * k)
    grain.height = Math.ceil(innerHeight * k)
  }
  sizeGrain()
  addEventListener("resize", sizeGrain)

  let scratch: Scratch[] = []
  let gT = 0
  const t00 = performance.now()
  const tcEls = Array.from(document.querySelectorAll(".tc"))
  const P = { x: -50, y: -50 }
  const C = { x: -50, y: -50 }
  const onMove = (e: PointerEvent) => {
    P.x = e.clientX
    P.y = e.clientY
  }
  const onOver = (e: MouseEvent) =>
    cursor.classList.toggle(
      "hot",
      !!(e.target as Element | null)?.closest("a,button,[data-hot],.lr"),
    )
  addEventListener("pointermove", onMove)
  document.addEventListener("mouseover", onOver)

  let raf = 0
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    C.x += (P.x - C.x) * 0.35
    C.y += (P.y - C.y) * 0.35
    cursor.style.transform = `translate(${C.x}px,${C.y}px)`
    if (now - gT > 83) {
      gT = now /* 12 fps grain */
      const W = grain.width
      const H = grain.height
      g.clearRect(0, 0, W, H)
      g.save()
      g.translate(-Math.random() * 128, -Math.random() * 128)
      const tile = tiles[(Math.random() * tiles.length) | 0]
      const pat = tile && g.createPattern(tile, "repeat")
      if (pat) {
        g.fillStyle = pat
        g.fillRect(0, 0, W + 128, H + 128)
      }
      g.restore()
      if (Math.random() < 0.5) {
        const x = Math.random() * W
        const y = Math.random() * H
        const r = Math.random() * 1.8 + 0.4
        g.fillStyle = Math.random() < 0.6 ? "rgba(0,0,0,.6)" : "rgba(236,235,230,.45)"
        g.beginPath()
        g.arc(x, y, r, 0, 7)
        g.fill()
      }
      if (Math.random() < 0.03)
        scratch.push({
          x: Math.random() * W,
          life: 5 + Math.random() * 14,
          a: 0.05 + Math.random() * 0.08,
        })
      scratch = scratch.filter((s) => s.life-- > 0)
      scratch.forEach((s) => {
        s.x += Math.random() - 0.5
        g.fillStyle = `rgba(236,235,230,${s.a})`
        g.fillRect(s.x, 0, 0.7, H)
      })
      const t = timecode((performance.now() - t00) / 1000)
      tcEls.forEach((e) => (e.textContent = t))
    }
    hooks.forEach((f) => f(now))
  }
  loop(0)

  return () => {
    cancelAnimationFrame(raf)
    removeEventListener("resize", sizeGrain)
    removeEventListener("pointermove", onMove)
    document.removeEventListener("mouseover", onOver)
    flashEl = null
  }
}
