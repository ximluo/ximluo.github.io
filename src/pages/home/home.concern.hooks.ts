import { useEffect, type MutableRefObject } from "react"
import { dispatchHomeFlowerNavVisibility, dispatchHomeFlowerOpacity } from "./home.events"

const SCROLL_LOCK_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
])

export const LOCKED_GESTURE_COOLDOWN_MS = 350

const getEstTimeString = () =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date())

export const useHomeFooterMeasurement = (setFooterHeight: (value: number) => void) => {
  useEffect(() => {
    if (typeof document === "undefined") return

    let footerEl: HTMLElement | null = null
    let footerResizeObserver: ResizeObserver | null = null

    const measureFooter = () => {
      if (!footerEl) return
      setFooterHeight(footerEl.getBoundingClientRect().height || 0)
    }

    const attachFooterObserver = () => {
      const nextFooter = document.querySelector<HTMLElement>("footer")
      if (nextFooter === footerEl) {
        measureFooter()
        return
      }

      footerResizeObserver?.disconnect()
      footerEl = nextFooter

      if (!footerEl) {
        setFooterHeight(0)
        return
      }

      footerResizeObserver = new ResizeObserver(measureFooter)
      footerResizeObserver.observe(footerEl)
      measureFooter()
    }

    attachFooterObserver()

    const mutationObserver = new MutationObserver(attachFooterObserver)
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      mutationObserver.disconnect()
      footerResizeObserver?.disconnect()
    }
  }, [setFooterHeight])
}

export const useEstClock = (setEstTime: (value: string) => void) => {
  useEffect(() => {
    if (typeof window === "undefined") return

    setEstTime(getEstTimeString())
    const id = window.setInterval(() => setEstTime(getEstTimeString()), 1000)
    return () => window.clearInterval(id)
  }, [setEstTime])
}

interface HomeScrollLockOptions {
  isAnimationComplete: boolean
  sawScrollWhileLockedRef: MutableRefObject<boolean>
  ignoreGesturesUntilRef: MutableRefObject<number>
}

export const useHomeScrollLock = ({
  isAnimationComplete,
  sawScrollWhileLockedRef,
  ignoreGesturesUntilRef,
}: HomeScrollLockOptions) => {
  useEffect(() => {
    if (typeof window === "undefined" || isAnimationComplete) return

    const preventWheel = (event: WheelEvent) => {
      sawScrollWhileLockedRef.current = true
      if (event.cancelable) event.preventDefault()
    }

    const preventTouchMove = (event: TouchEvent) => {
      sawScrollWhileLockedRef.current = true
      if (event.cancelable) event.preventDefault()
    }

    const preventKeyboardScroll = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target) {
        const tagName = target.tagName
        if (
          target.isContentEditable ||
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT"
        ) {
          return
        }
      }

      if (SCROLL_LOCK_KEYS.has(event.key) || event.code === "Space") {
        sawScrollWhileLockedRef.current = true
        event.preventDefault()
      }
    }

    window.addEventListener("wheel", preventWheel, { passive: false })
    window.addEventListener("touchmove", preventTouchMove, { passive: false })
    window.addEventListener("keydown", preventKeyboardScroll)

    return () => {
      window.removeEventListener("wheel", preventWheel)
      window.removeEventListener("touchmove", preventTouchMove)
      window.removeEventListener("keydown", preventKeyboardScroll)
    }
  }, [isAnimationComplete, sawScrollWhileLockedRef])

  useEffect(() => {
    if (!isAnimationComplete) return
    if (!sawScrollWhileLockedRef.current) return

    ignoreGesturesUntilRef.current = performance.now() + LOCKED_GESTURE_COOLDOWN_MS
    sawScrollWhileLockedRef.current = false
  }, [ignoreGesturesUntilRef, isAnimationComplete, sawScrollWhileLockedRef])
}

interface HomeFlowerBridgeOptions {
  isFlowerRevealed: boolean
  flowerSvgOpacity: number
}

export const useHomeFlowerBridge = ({
  isFlowerRevealed,
  flowerSvgOpacity,
}: HomeFlowerBridgeOptions) => {
  useEffect(() => {
    dispatchHomeFlowerNavVisibility(isFlowerRevealed)

    return () => {
      dispatchHomeFlowerNavVisibility(false)
    }
  }, [isFlowerRevealed])

  useEffect(() => {
    dispatchHomeFlowerOpacity(Number.isFinite(flowerSvgOpacity) ? flowerSvgOpacity : 0)
  }, [flowerSvgOpacity])

  useEffect(() => {
    return () => {
      dispatchHomeFlowerOpacity(null)
    }
  }, [])
}
