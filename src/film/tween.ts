import { RM } from "../env"

export type Ease = (t: number) => number

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
export const eio: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const eout: Ease = (t) => 1 - Math.pow(1 - t, 3)
export const linear: Ease = (t) => t

/** A stepped tween: `fn` is called with the eased progress at `fps` distinct steps, like frames of film.
    Under reduced motion the whole tween collapses to a single step. */
export function tween(dur: number, fn: (e: number) => void, o: { fps?: number; ease?: Ease } = {}) {
  const fps = o.fps ?? 14
  const ease = o.ease ?? eio
  if (RM) dur = 1
  return new Promise<void>((res) => {
    const t0 = performance.now()
    const n = Math.max(1, Math.round((dur / 1000) * fps))
    let last = -1
    const f = (now: number) => {
      const t = clamp((now - t0) / dur)
      const q = t >= 1 ? 1 : Math.floor(t * n) / n
      if (q !== last) {
        last = q
        fn(ease(q))
      }
      if (t < 1) requestAnimationFrame(f)
      else res()
    }
    requestAnimationFrame(f)
  })
}
