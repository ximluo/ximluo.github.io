import { useSyncExternalStore } from "react"

interface ViewportSize {
  width: number
  height: number
}

const listeners = new Set<() => void>()

let resizeRafId: number | null = null
let unsubscribeResize: (() => void) | null = null
let viewportSnapshot: ViewportSize = {
  width: typeof window === "undefined" ? 0 : window.innerWidth,
  height: typeof window === "undefined" ? 0 : window.innerHeight,
}

const readWindowViewportSize = (): ViewportSize => {
  if (typeof window === "undefined") return { width: 0, height: 0 }
  return { width: window.innerWidth, height: window.innerHeight }
}

const syncViewportSnapshot = () => {
  const next = readWindowViewportSize()
  if (next.width === viewportSnapshot.width && next.height === viewportSnapshot.height) {
    return false
  }
  viewportSnapshot = next
  return true
}

const getClientViewportSize = (): ViewportSize => {
  if (typeof window === "undefined") return viewportSnapshot
  syncViewportSnapshot()
  return viewportSnapshot
}

const notifyViewportListeners = () => {
  listeners.forEach((listener) => listener())
}

const ensureViewportSubscription = () => {
  if (typeof window === "undefined" || unsubscribeResize) return

  const handleResize = () => {
    if (resizeRafId != null) cancelAnimationFrame(resizeRafId)

    resizeRafId = requestAnimationFrame(() => {
      resizeRafId = null
      if (syncViewportSnapshot()) {
        notifyViewportListeners()
      }
    })
  }

  window.addEventListener("resize", handleResize)

  unsubscribeResize = () => {
    window.removeEventListener("resize", handleResize)
    if (resizeRafId != null) {
      cancelAnimationFrame(resizeRafId)
      resizeRafId = null
    }
    unsubscribeResize = null
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  ensureViewportSubscription()

  return () => {
    listeners.delete(listener)

    if (listeners.size === 0 && unsubscribeResize) {
      unsubscribeResize()
    }
  }
}

const useViewportSize = (fallback: ViewportSize = { width: 0, height: 0 }) => {
  return useSyncExternalStore(subscribe, getClientViewportSize, () => fallback)
}

export default useViewportSize
