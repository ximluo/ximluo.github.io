import React, { useEffect, useRef, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { GRADIENT_BACKGROUND_THEME_VARS, type ThemeType } from "../theme/tokens"
import useViewportSize from "../hooks/useViewportSize"
import {
  useGradientNoiseCanvas,
  useHeaderOffset,
  useHomeFlowerOverlay,
} from "./gradientBackground.hooks"
import { GradientCircles, GradientRightEdgeOverlay } from "./gradientBackground.parts"
interface GradientBackgroundProps {
  theme: ThemeType
  children?: React.ReactNode
}

const LAPTOP_BREAKPOINT = 1024

const GradientBackground: React.FC<GradientBackgroundProps> = ({ theme, children }) => {
  const location = useLocation()
  const { width: viewportWidth, height: viewportHeight } = useViewportSize({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })
  const isSafari = useMemo(() => {
    if (typeof navigator === "undefined") return false
    const ua = navigator.userAgent
    return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS/i.test(ua)
  }, [])

  const isMobileOrTablet = useMemo(() => {
    if (typeof navigator === "undefined") return false
    const ua = navigator.userAgent
    const hasTouch =
      (typeof window !== "undefined" && "ontouchstart" in window) || navigator.maxTouchPoints > 0
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Tablet/i.test(ua) || !!hasTouch
  }, [])

  const useSafariMode = isSafari || isMobileOrTablet

  const containerRef = useRef<HTMLDivElement>(null)
  const interBubbleRef = useRef<HTMLDivElement>(null)
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null)
  const headerOffset = useHeaderOffset()
  const isLaptopViewport = viewportWidth >= LAPTOP_BREAKPOINT
  const isHomePage = location.pathname === "/"
  const { overlayOpacity } = useHomeFlowerOverlay({ isHomePage })

  useGradientNoiseCanvas({
    noiseCanvasRef,
    interBubbleRef,
    isMobileOrTablet,
    viewportWidth,
    viewportHeight,
  })

  useEffect(() => {
    const t = GRADIENT_BACKGROUND_THEME_VARS[theme]
    const el = containerRef.current
    if (!el) return
    Object.entries(t).forEach(([k, v]) => el.style.setProperty(k, v as string))
    el.style.backgroundColor = t["--color-bg1"] as string
  }, [theme])

  return (
    <div
      ref={containerRef}
      className="gradient-bg"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={noiseCanvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {!useSafariMode && (
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
      )}

      <GradientCircles
        useSafariMode={useSafariMode}
        isMobileOrTablet={isMobileOrTablet}
        interBubbleRef={interBubbleRef}
      />

      <GradientRightEdgeOverlay
        pathname={location.pathname ?? ""}
        isLaptopViewport={isLaptopViewport}
        overlayOpacity={overlayOpacity}
        headerOffset={headerOffset}
      />

      <div style={{ position: "relative", zIndex: 10, height: "100%" }}>{children}</div>
    </div>
  )
}

export default GradientBackground
