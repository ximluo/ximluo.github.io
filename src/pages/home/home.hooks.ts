import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import useViewportSize from "../../hooks/useViewportSize"
import {
  useEstClock,
  useHomeFlowerBridge,
  useHomeFooterMeasurement,
  useHomeScrollLock,
} from "./home.concern.hooks"

const HOME_INTRO_GREETING = "Hi, I'm Ximing!"

export function useHomeViewportState() {
  const { width: windowWidth, height: windowHeight } = useViewportSize({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })
  const [footerHeight, setFooterHeight] = useState(0)
  const [estTime, setEstTime] = useState("")
  const isMobile = windowWidth <= 768
  const isSmallScreen = windowHeight <= 700

  useHomeFooterMeasurement(setFooterHeight)
  useEstClock(setEstTime)

  return {
    windowWidth,
    windowHeight,
    isMobile,
    isSmallScreen,
    footerHeight,
    estTime,
  }
}

interface UseHomeIntroSequenceOptions {
  phase: number
  onScramble: () => void
  isNavigatingFromPage: boolean
}

export function useHomeIntroSequence({
  phase,
  onScramble,
  isNavigatingFromPage,
}: UseHomeIntroSequenceOptions) {
  const [typingText, setTypingText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [isScrambleComplete, setIsScrambleComplete] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [shouldScramble, setShouldScramble] = useState(false)

  const typingRef = useRef<HTMLDivElement>(null)
  const animationRunningRef = useRef(false)

  useEffect(() => {
    if (phase < 1 || animationRunningRef.current) return
    animationRunningRef.current = true

    if (isNavigatingFromPage) {
      setTypingText(HOME_INTRO_GREETING)
      setIsTypingComplete(true)
      return
    }

    const fullText = HOME_INTRO_GREETING
    let lastIndex = 0
    const startedAt = performance.now()

    const typeNext = (currentTime: number) => {
      const nextIndex = Math.min(
        fullText.length,
        Math.floor((currentTime - startedAt) / 50) + 1,
      )

      if (nextIndex !== lastIndex) {
        lastIndex = nextIndex
        setTypingText(fullText.slice(0, nextIndex))
      }

      if (lastIndex < fullText.length) {
        requestAnimationFrame(typeNext)
      } else {
        setIsTypingComplete(true)
      }
    }

    requestAnimationFrame(typeNext)
  }, [phase, isNavigatingFromPage])

  useEffect(() => {
    if (phase < 1 || isImageLoaded) return

    const img = new Image()
    let didResolve = false

    const markLoaded = () => {
      if (didResolve) return
      didResolve = true
      setIsImageLoaded(true)
    }

    img.decoding = "async"
    img.onload = markLoaded
    img.onerror = markLoaded
    img.src = "/images/ximing.jpg"

    if (typeof img.decode === "function") {
      void img.decode().then(markLoaded).catch(() => {
        // onload/onerror remains as fallback
      })
    }

    const failSafe = setTimeout(markLoaded, 1200)
    return () => clearTimeout(failSafe)
  }, [phase, isImageLoaded])

  useEffect(() => {
    if (isImageLoaded && (isTypingComplete || isNavigatingFromPage)) {
      setShouldScramble(true)
    }
  }, [isImageLoaded, isTypingComplete, isNavigatingFromPage])

  useEffect(() => {
    if (!shouldScramble || isScrambleComplete) return

    onScramble()
    const done = setTimeout(() => setIsScrambleComplete(true), 500)
    return () => clearTimeout(done)
  }, [shouldScramble, isScrambleComplete, onScramble])

  useEffect(() => {
    if (phase < 1 || isAnimationComplete) return

    const force = setTimeout(() => {
      setTypingText(HOME_INTRO_GREETING)
      setIsTypingComplete(true)
      setIsScrambleComplete(true)
      setIsImageLoaded(true)
      setShouldScramble(true)
      setIsAnimationComplete(true)
    }, 1200)

    return () => clearTimeout(force)
  }, [phase, isAnimationComplete])

  useEffect(() => {
    if (!isTypingComplete || !isScrambleComplete || !isImageLoaded) return

    typingRef.current?.style.setProperty("opacity", "0")
    const timer = setTimeout(() => setIsAnimationComplete(true), 300)
    return () => clearTimeout(timer)
  }, [isTypingComplete, isScrambleComplete, isImageLoaded])

  return {
    typingRef,
    typingText,
    isAnimationComplete,
  }
}

interface UseHomeRevealStateOptions {
  windowHeight: number
  isMobile: boolean
  isAnimationComplete: boolean
}

export function useHomeRevealState({
  windowHeight,
  isMobile,
  isAnimationComplete,
}: UseHomeRevealStateOptions) {
  const [virtualScroll, setVirtualScroll] = useState(0)
  const [isFlowerRevealed, setIsFlowerRevealed] = useState(false)

  const lastTouchYRef = useRef<number | null>(null)
  const sawScrollWhileLockedRef = useRef(false)
  const ignoreGesturesUntilRef = useRef(0)

  const revealThreshold = useMemo(() => Math.max(windowHeight * 0.6, 240), [windowHeight])

  useEffect(() => {
    setVirtualScroll((prev) => Math.min(prev, revealThreshold))
  }, [revealThreshold])

  useHomeScrollLock({
    isAnimationComplete,
    sawScrollWhileLockedRef,
    ignoreGesturesUntilRef,
  })

  const handleVirtualDelta = useCallback(
    (delta: number) => {
      if (!delta) return
      setVirtualScroll((prev) => THREE.MathUtils.clamp(prev + delta, 0, revealThreshold))
    },
    [revealThreshold],
  )

  const handleWheelGesture = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const isCoolingDown = performance.now() < ignoreGesturesUntilRef.current
      if (!isAnimationComplete || isCoolingDown) {
        if (!isAnimationComplete) sawScrollWhileLockedRef.current = true
        if (event.cancelable) event.preventDefault()
        return
      }

      const multiplier = isMobile ? 1.35 : 1
      handleVirtualDelta(event.deltaY * multiplier)
      if (event.cancelable) event.preventDefault()
    },
    [handleVirtualDelta, isAnimationComplete, isMobile],
  )

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const isCoolingDown = performance.now() < ignoreGesturesUntilRef.current
      if (!isAnimationComplete || isCoolingDown) {
        if (!isAnimationComplete) sawScrollWhileLockedRef.current = true
        lastTouchYRef.current = null
        event.preventDefault()
        return
      }

      lastTouchYRef.current = event.touches[0]?.clientY ?? null
    },
    [isAnimationComplete],
  )

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const isCoolingDown = performance.now() < ignoreGesturesUntilRef.current
      if (!isAnimationComplete || isCoolingDown) {
        if (!isAnimationComplete) sawScrollWhileLockedRef.current = true
        event.preventDefault()
        return
      }

      if (lastTouchYRef.current == null) return

      const currentY = event.touches[0]?.clientY
      if (currentY == null) return

      const delta = lastTouchYRef.current - currentY
      const multiplier = isMobile ? 1.35 : 1
      handleVirtualDelta(delta * multiplier)
      lastTouchYRef.current = currentY
      event.preventDefault()
    },
    [handleVirtualDelta, isAnimationComplete, isMobile],
  )

  const handleTouchEnd = useCallback(() => {
    lastTouchYRef.current = null
  }, [])

  useEffect(() => {
    if (!isAnimationComplete) {
      setIsFlowerRevealed((prev) => (prev ? false : prev))
      return
    }

    const shouldReveal = virtualScroll >= revealThreshold * 0.6
    setIsFlowerRevealed((prev) => (prev === shouldReveal ? prev : shouldReveal))
  }, [isAnimationComplete, virtualScroll, revealThreshold])

  const flowerSvgOpacity = useMemo(() => {
    const progress = revealThreshold === 0 ? 0 : Math.min(virtualScroll / revealThreshold, 1)
    return 0.5 * (1 - progress)
  }, [virtualScroll, revealThreshold])

  useHomeFlowerBridge({
    isFlowerRevealed,
    flowerSvgOpacity,
  })

  return {
    virtualScroll,
    revealThreshold,
    isFlowerRevealed,
    handleWheelGesture,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
