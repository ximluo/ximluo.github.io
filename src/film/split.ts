/* The split cut: a pane opens from a vertical hairline, closes back into it, and swaps its contents through a
   horizontal one. Used by the project pane and the artwork wall. */
import { cue, flash } from "./film"
import { eout, tween } from "./tween"

export const split = {
  async enter(el: HTMLElement) {
    el.style.clipPath = "inset(0 50% 0 50%)"
    el.hidden = false
    el.scrollTop = 0
    void cue()
    await tween(420, (e) => (el.style.clipPath = `inset(0 ${(1 - e) * 50}% 0 ${(1 - e) * 50}%)`), {
      ease: eout,
      fps: 16,
    })
    el.style.clipPath = ""
  },
  async leave(el: HTMLElement) {
    await tween(320, (e) => (el.style.clipPath = `inset(0 ${e * 50}% 0 ${e * 50}%)`), { fps: 16 })
    el.hidden = true
    el.style.clipPath = ""
  },
  /** Closes to a horizontal line, runs `doSwap` at the midpoint, then opens again. */
  async swap(doSwap: () => void, el: HTMLElement) {
    await tween(160, (e) => (el.style.clipPath = `inset(${e * 50}% 0 ${e * 50}% 0)`), { fps: 18 })
    doSwap()
    flash(0.08)
    await tween(240, (e) => (el.style.clipPath = `inset(${(1 - e) * 50}% 0 ${(1 - e) * 50}% 0)`), {
      fps: 18,
      ease: eout,
    })
    el.style.clipPath = ""
  },
}
