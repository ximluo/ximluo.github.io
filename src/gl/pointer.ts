/* The pointer for the effects: the raw position, an eased copy with its velocity (eased by time, since the effects run
   at 10 to 30 fps), when it last moved, and presses. Listens on the window, so it works over any layer; a finger
   counts only while it is down. */

export interface Pointer {
  /** eased position, css px from the viewport's top left */
  x: number
  y: number
  /** eased velocity, css px per second */
  vx: number
  vy: number
  inside: boolean
  /** performance.now() of the last move */
  lastMove: number
  tick(dt: number): void
  destroy(): void
}

export function trackPointer(
  o: { onDown?(x: number, y: number): void; onMove?(): void } = {},
): Pointer {
  const P = { x: -1e4, y: -1e4 }
  const self: Pointer = {
    x: -1e4,
    y: -1e4,
    vx: 0,
    vy: 0,
    inside: false,
    lastMove: -1e9,
    tick(dt) {
      if (!self.inside || dt <= 0) return
      const k = 1 - Math.exp(-dt * 10)
      const nx = self.x + (P.x - self.x) * k
      const ny = self.y + (P.y - self.y) * k
      self.vx = (nx - self.x) / dt
      self.vy = (ny - self.y) / dt
      self.x = nx
      self.y = ny
    },
    destroy() {
      removeEventListener("pointermove", onMove)
      removeEventListener("pointerdown", onDown)
      removeEventListener("pointerup", onUp)
      removeEventListener("pointercancel", onUp)
      document.removeEventListener("pointerout", onOut)
      removeEventListener("blur", onLeave)
    },
  }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch" && e.buttons === 0) return
    if (!self.inside) {
      /* snap on entry, so the first eased step is not a streak from off screen */
      self.x = e.clientX
      self.y = e.clientY
      self.vx = self.vy = 0
      self.inside = true
    }
    P.x = e.clientX
    P.y = e.clientY
    self.lastMove = performance.now()
    o.onMove?.()
  }
  const onLeave = () => {
    self.inside = false
    self.vx = self.vy = 0
  }
  const onDown = (e: PointerEvent) => {
    onMove(e)
    o.onDown?.(e.clientX, e.clientY)
  }
  const onUp = (e: PointerEvent) => {
    if (e.pointerType === "touch") onLeave()
  }
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) onLeave()
  }
  addEventListener("pointermove", onMove, { passive: true })
  addEventListener("pointerdown", onDown, { passive: true })
  addEventListener("pointerup", onUp, { passive: true })
  addEventListener("pointercancel", onUp, { passive: true })
  document.addEventListener("pointerout", onOut)
  addEventListener("blur", onLeave)
  return self
}
