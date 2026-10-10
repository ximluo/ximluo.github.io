/* A requestAnimationFrame loop with a frame-rate cap read before every frame, paused while the tab is hidden. `draw`
   returns false to idle the loop until the next kick(). */

export interface Loop {
  kick(): void
  stop(): void
  destroy(): void
}

export function createLoop(draw: (now: number, dt: number) => boolean, fps: () => number): Loop {
  let raf = 0
  let last = 0
  let prev = 0
  let running = false
  let dead = false
  const frame = (now: number) => {
    raf = 0
    if (dead || document.hidden) {
      running = false
      return
    }
    const cap = fps()
    /* a little slack under the cap, so a 60 Hz display at a 30 fps cap draws every second frame, not every third */
    const min = cap === Infinity ? 0 : 1000 / cap - 2
    if (now - last < min) {
      raf = requestAnimationFrame(frame)
      return
    }
    const dt = prev ? Math.min((now - prev) / 1000, 0.1) : 1 / 60
    last = now
    prev = now
    if (draw(now, dt)) raf = requestAnimationFrame(frame)
    else running = false
  }
  const kick = () => {
    if (dead || running || document.hidden) return
    running = true
    raf = requestAnimationFrame(frame)
  }
  const onVis = () => {
    if (!document.hidden) kick()
  }
  document.addEventListener("visibilitychange", onVis)
  return {
    kick,
    stop() {
      cancelAnimationFrame(raf)
      raf = 0
      running = false
    },
    destroy() {
      dead = true
      cancelAnimationFrame(raf)
      raf = 0
      running = false
      document.removeEventListener("visibilitychange", onVis)
    },
  }
}
