/* The opening leader: 3, 2, 1 beside the name, then an iris that opens straight onto the site. Re-entrant: the
   top-left name replays it, and `onCover` runs once the leader covers the screen so the site can reset underneath. */
import { RM, TOUCH } from "../env"
import { cue, flash } from "./film"
import { eio, linear, tween, wait } from "./tween"

export interface Intro {
  /** True while the leader is running. */
  readonly on: boolean
  run(o?: { onCover?: () => Promise<void> | void }): Promise<void>
}

export const INTRO_SEEN_KEY = "np-intro"

export function createIntro(leader: HTMLElement): Intro {
  let on = false
  const ldn = leader.querySelector<HTMLElement>("#ldn")
  const turb = leader.querySelector("#ld-noise feTurbulence")
  const enter = leader.querySelector<HTMLElement>("#ld-enter-t")
  return {
    get on() {
      return on
    },
    async run(o = {}) {
      if (on || !ldn) return
      on = true
      let skip = false
      let pt: [number, number] | null = null
      let skipNow = () => {}
      const skipP = new Promise<void>((r) => (skipNow = r))
      const onClick = (e: MouseEvent) => {
        skip = true
        pt = [e.clientX, e.clientY]
        skipNow()
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          skip = true
          skipNow()
        }
      }
      ;["--r", "--x", "--y", "--a"].forEach((k) => leader.style.removeProperty(k))
      ldn.textContent = RM ? "" : "3"
      leader.hidden = false
      leader.addEventListener("click", onClick)
      addEventListener("keydown", onKey, true)
      if (o.onCover) await o.onCover()
      if (enter && TOUCH) enter.textContent = "Tap to skip"
      /* a gentle lamp flicker at 24 fps while the leader runs; the print noise on the type reseeds at 12 fps */
      let tick = 0
      const weave = RM
        ? 0
        : setInterval(() => {
            if (turb && tick++ & 1) turb.setAttribute("seed", String((Math.random() * 999) | 0))
            leader.style.setProperty("--fl", (0.95 + Math.random() * 0.07).toFixed(3))
          }, 1000 / 24)
      /* 3, 2, 1 at 720 ms each, a two-frame blank, then a 480 ms iris: the whole leader is under three seconds */
      if (RM) await Promise.race([wait(900), skipP])
      else
        for (const n of [3, 2, 1]) {
          if (skip) break
          ldn.textContent = String(n)
          await Promise.race([
            tween(720, (e) => leader.style.setProperty("--a", (e * 360).toFixed(1) + "deg"), {
              fps: 24,
              ease: linear,
            }),
            skipP,
          ])
        }
      clearInterval(weave)
      leader.style.removeProperty("--fl")
      ldn.textContent = ""
      await wait(40)
      const [x, y]: [number, number] = pt ?? [innerWidth / 2, innerHeight / 2]
      leader.style.setProperty("--x", x + "px")
      leader.style.setProperty("--y", y + "px")
      const Rr = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
      void cue()
      flash(0.1)
      await tween(480, (e) => leader.style.setProperty("--r", (e * Rr).toFixed(0) + "px"), {
        ease: eio,
      })
      leader.hidden = true
      leader.removeEventListener("click", onClick)
      removeEventListener("keydown", onKey, true)
      on = false
      try {
        localStorage.setItem(INTRO_SEEN_KEY, "1")
      } catch {
        /* storage may be unavailable */
      }
    },
  }
}
