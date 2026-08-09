import { useState } from "react"
import useViewportSize from "../../hooks/useViewportSize"
import { useHomeFooterMeasurement } from "./home.concern.hooks"

// Stable server-snapshot fallback for useSyncExternalStore — must not be a
// fresh object per render.
const VIEWPORT_FALLBACK = {
  width: typeof window !== "undefined" ? window.innerWidth : 0,
  height: typeof window !== "undefined" ? window.innerHeight : 0,
}

export function useHomeViewportState() {
  const { width: windowWidth, height: windowHeight } = useViewportSize(VIEWPORT_FALLBACK)
  const [footerHeight, setFooterHeight] = useState(0)
  const isMobile = windowWidth <= 768

  useHomeFooterMeasurement(setFooterHeight)

  return {
    windowWidth,
    windowHeight,
    isMobile,
    footerHeight,
  }
}
