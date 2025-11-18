"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"

// 3D deps
import { Canvas, useThree } from "@react-three/fiber"
import { useGLTF, useAnimations, Environment } from "@react-three/drei"
import * as THREE from "three"

import AwardsModal from "../components/AwardsModal"
import AsciiImage from "../components/AsciiImage"

const getEstTimeString = () =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date())

interface HomeProps {
  theme: "bunny" | "water"
  phase: number
  roleTop: string
  roleBot: string
  onScramble: () => void
  isNavigatingFromPage?: boolean
}

/* ----------------------------- 3D Components ----------------------------- */

function FlowerModel({
  url = "/models/blue_flower.glb",
  onReady,
  // Rotate 90° to fix Z-up exports (common from DCC tools) so it's right-side up in Three (Y-up).
  uprightRotation = [1, 0, 0] as [number, number, number],
}: {
  url?: string
  onReady?: (group: THREE.Group) => void
  uprightRotation?: [number, number, number]
}) {
  const group = useRef<THREE.Group>(null!)
  const inner = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF(url) as unknown as {
    scene: THREE.Group
    animations: THREE.AnimationClip[]
  }
  const { actions, names } = useAnimations(animations, group)

  // Play all clips if available
  useEffect(() => {
    names.forEach((n) => {
      const action = actions[n]
      if (!action) return
      action.reset()
      action.setLoop(THREE.LoopRepeat, Infinity)
      action.play()
    })
    return () => {
      names.forEach((n) => actions[n]?.stop())
    }
  }, [actions, names])

  // Notify parent when the model is mounted
  useEffect(() => {
    if (group.current) onReady?.(group.current)
  }, [onReady])

  return (
    <group ref={group} dispose={null}>
      {/* Apply a 90° rotation to make the flower upright */}
      <group ref={inner} rotation={uprightRotation}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

function FlowerScene({
  layout: { isMobile, windowWidth },
}: {
  layout: { isMobile: boolean; isSmallScreen: boolean; windowWidth: number }
}) {
  const modelRef = useRef<THREE.Group | null>(null)
  const { camera, size } = useThree()
  const sizeMultiplier = useMemo(() => {
    if (windowWidth >= 768) return 3.20
    return 1.65
  }, [windowWidth])

  // Center the model on the page and make it big.
  const frameCentered = useCallback(() => {
    if (!modelRef.current) return
    const obj = modelRef.current

    const box = new THREE.Box3().setFromObject(obj)
    if (!box || !isFinite(box.min.x)) return

    const width = box.max.x - box.min.x
    const height = box.max.y - box.min.y
    const depth = box.max.z - box.min.z

    const targetCenter = new THREE.Vector3(
      (box.min.x + box.max.x) * 0.5,
      (box.min.y + box.max.y) * 0.5,
      (box.min.z + box.max.z) * 0.5,
    )

    const baseFit = isMobile ? 0.65 : 0.55
    const fit = baseFit * sizeMultiplier

    const persp = camera as THREE.PerspectiveCamera
    const fov = THREE.MathUtils.degToRad(persp.fov)
    const viewAspect = size.width / size.height
    const neededHalfHeight = Math.max(height * 0.5, (width * 0.5) / viewAspect)
    const distance = neededHalfHeight / (Math.tan(fov / 2) * fit)

    let camPos = targetCenter.clone().add(new THREE.Vector3(-0.28, -0.55, 0).normalize().multiplyScalar(distance))

    const viewDir = targetCenter.clone().sub(camPos).normalize()
    const cameraUp = (camera as THREE.PerspectiveCamera).up.clone().normalize()
    const right = new THREE.Vector3().crossVectors(viewDir, cameraUp).normalize()
    const trueUp = new THREE.Vector3().crossVectors(right, viewDir).normalize()

    const cameraDistance = camPos.distanceTo(targetCenter)
    const viewportHalfHeight = Math.tan(fov / 2) * cameraDistance
    const viewportHalfWidth = viewportHalfHeight * viewAspect

    const verticalFactor = isMobile ? 1.75 : 2.95
    const verticalOffset = viewportHalfHeight * verticalFactor
    const horizontalOffset = isMobile ? 0 : viewportHalfWidth * 0.002

    const panOffset = new THREE.Vector3()
      .add(right.clone().multiplyScalar(horizontalOffset))
      .add(trueUp.clone().multiplyScalar(verticalOffset))

    camPos.add(panOffset)
    const newTarget = targetCenter.clone().add(panOffset)

    persp.position.copy(camPos)
    persp.near = Math.max(0.001, cameraDistance / 100)
    persp.far = cameraDistance * 100 + depth
    persp.updateProjectionMatrix()
    persp.lookAt(newTarget)
  }, [camera, isMobile, size.height, size.width, sizeMultiplier])

  // When model loads or on resize, reframe
  const handleReady = useCallback(
    (g: THREE.Group) => {
      modelRef.current = g
      requestAnimationFrame(() => frameCentered())
    },
    [frameCentered],
  )

  useEffect(() => {
    frameCentered()
  }, [size.width, size.height, frameCentered])

  return (
    <>
      {/* Keep background transparent; subtle lighting */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 5]} intensity={1.1} />
      <Environment preset="studio" />

      <FlowerModel onReady={handleReady} />
    </>
  )
}

/* --------------------------------- Page --------------------------------- */

const Home: React.FC<HomeProps> = ({
  theme,
  phase,
  roleTop,
  roleBot,
  onScramble,
  isNavigatingFromPage = false,
}) => {
  const navigate = useNavigate()
  // state + refs
  const [showAwards, setShowAwards] = useState(false)
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth)
  const [windowHeight, setWindowHeight] = useState(() => window.innerHeight)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerHeight <= 700)
  const [typingText, setTypingText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [isScrambleComplete, setIsScrambleComplete] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [shouldScramble, setShouldScramble] = useState(false)
  const [isFlowerRevealed, setIsFlowerRevealed] = useState(false)
  const [virtualScroll, setVirtualScroll] = useState(0)
  const [footerHeight, setFooterHeight] = useState(0)
  const [estTime, setEstTime] = useState(() => getEstTimeString())

  const typingRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const animationRunningRef = useRef(false)
  const resizeRaf = useRef<number | undefined>(undefined)
  const lastTouchYRef = useRef<number | null>(null)

  const revealThreshold = useMemo(() => Math.max(windowHeight * 0.6, 240), [windowHeight])

  // responsive handler
  const handleResize = useCallback(() => {
    if (resizeRaf.current) {
      cancelAnimationFrame(resizeRaf.current)
    }
    resizeRaf.current = requestAnimationFrame(() => {
      const width = window.innerWidth
      setWindowWidth(width)
      setWindowHeight(window.innerHeight)
      setIsMobile(width <= 768)
      setIsSmallScreen(window.innerHeight <= 700)
    })
  }, [])

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [handleResize])

  useEffect(() => {
    if (typeof window === "undefined") return
    const measureFooter = () => {
      const footer = document.querySelector("footer")
      if (!footer) return
      setFooterHeight(footer.getBoundingClientRect().height || 0)
    }
    measureFooter()
    window.addEventListener("resize", measureFooter)
    return () => window.removeEventListener("resize", measureFooter)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setEstTime(getEstTimeString()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setVirtualScroll((prev) => Math.min(prev, revealThreshold))
  }, [revealThreshold])

  const handleVirtualDelta = useCallback(
    (delta: number) => {
      if (!delta) return
      setVirtualScroll((prev) => THREE.MathUtils.clamp(prev + delta, 0, revealThreshold))
    },
    [revealThreshold],
  )

  const handleWheelGesture = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const multiplier = isMobile ? 1.35 : 1
      handleVirtualDelta(event.deltaY * multiplier)
      if (event.cancelable) event.preventDefault()
    },
    [handleVirtualDelta, isMobile],
  )

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    lastTouchYRef.current = event.touches[0]?.clientY ?? null
  }, [])

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (lastTouchYRef.current == null) return
      const currentY = event.touches[0]?.clientY
      if (currentY == null) return
      const delta = lastTouchYRef.current - currentY
      const multiplier = isMobile ? 1.35 : 1
      handleVirtualDelta(delta * multiplier)
      lastTouchYRef.current = currentY
      event.preventDefault()
    },
    [handleVirtualDelta, isMobile],
  )

  const handleTouchEnd = useCallback(() => {
    lastTouchYRef.current = null
  }, [])

  useEffect(() => {
    const shouldReveal = virtualScroll >= revealThreshold * 0.6
    setIsFlowerRevealed((prev) => (prev === shouldReveal ? prev : shouldReveal))
  }, [virtualScroll, revealThreshold])

  useEffect(() => {
    if (typeof window === "undefined") return
    const event = new CustomEvent<{ hidden: boolean }>("home-flower-nav-visibility", {
      detail: { hidden: isFlowerRevealed },
    })
    window.dispatchEvent(event)
    return () => {
      const reset = new CustomEvent<{ hidden: boolean }>("home-flower-nav-visibility", {
        detail: { hidden: false },
      })
      window.dispatchEvent(reset)
    }
  }, [isFlowerRevealed])

  const flowerSvgOpacity = useMemo(() => {
    const progress = revealThreshold === 0 ? 0 : Math.min(virtualScroll / revealThreshold, 1)
    return 0.5 * (1 - progress)
  }, [virtualScroll, revealThreshold])

  useEffect(() => {
    if (typeof window === "undefined") return
    const event = new CustomEvent<{ value: number | null }>("home-flower-opacity", {
      detail: { value: Number.isFinite(flowerSvgOpacity) ? flowerSvgOpacity : 0 },
    })
    window.dispatchEvent(event)
  }, [flowerSvgOpacity])

  useEffect(() => {
    if (typeof window === "undefined") return
    return () => {
      const resetEvent = new CustomEvent<{ value: number | null }>("home-flower-opacity", {
        detail: { value: null },
      })
      window.dispatchEvent(resetEvent)
    }
  }, [])

  // typing effect
  useEffect(() => {
    if (phase < 1 || animationRunningRef.current) return
    animationRunningRef.current = true

    // skip animation if user navigated from another page
    if (isNavigatingFromPage) {
      setTypingText("Hi, I'm Ximing!")
      setIsTypingComplete(true)
      return
    }

    const fullText = "Hi, I'm Ximing!"
    let index = 0
    let lastTime = 0
    const typeNext = (currentTime: number) => {
      if (currentTime - lastTime >= 50) {
        index += 1
        setTypingText(fullText.slice(0, index))
        lastTime = currentTime
      }

      if (index < fullText.length) {
        requestAnimationFrame(typeNext)
      } else {
        setIsTypingComplete(true)
      }
    }
    requestAnimationFrame(typeNext)
  }, [phase, isNavigatingFromPage])

  // image preload
  useEffect(() => {
    if (phase < 1 || isImageLoaded) return
    const img = new Image()
    img.src = "/placeholder.svg?height=400&width=400"
    img.onload = () => setIsImageLoaded(true)
    const failSafe = setTimeout(() => setIsImageLoaded(true), 1000)
    return () => clearTimeout(failSafe)
  }, [phase, isImageLoaded])

  // scramble trigger
  useEffect(() => {
    if (isImageLoaded && (isTypingComplete || isNavigatingFromPage)) setShouldScramble(true)
  }, [isImageLoaded, isTypingComplete, isNavigatingFromPage])

  useEffect(() => {
    if (!shouldScramble || isScrambleComplete) return
    onScramble()
    const done = setTimeout(() => setIsScrambleComplete(true), 500)
    return () => clearTimeout(done)
  }, [shouldScramble, isScrambleComplete, onScramble])

  // forcecomplete safety net
  useEffect(() => {
    if (phase < 1 || isAnimationComplete) return
    const force = setTimeout(() => {
      setIsTypingComplete(true)
      setIsScrambleComplete(true)
      setIsImageLoaded(true)
      setShouldScramble(true)
      setIsAnimationComplete(true)
    }, 1200)
    return () => clearTimeout(force)
  }, [phase, isAnimationComplete])

  // reveal heading when all ready
  useEffect(() => {
    if (!isTypingComplete || !isScrambleComplete || !isImageLoaded) return
    typingRef.current?.style.setProperty("opacity", "0")
    const timer = setTimeout(() => setIsAnimationComplete(true), 300)
    return () => clearTimeout(timer)
  }, [isTypingComplete, isScrambleComplete, isImageLoaded])

  // theme memo
  const themes = useMemo(
    () => ({
      bunny: {
        "--color-text": "rgb(121, 85, 189)",
        "--color-accent-primary": "rgba(223, 30, 155, 1)",
        "--button-bg": "rgba(223, 30, 155, 0.8)",
        "--button-bg-light": "rgba(223, 30, 155, 0.2)",
        "--link-color": "rgba(223, 30, 155, 0.8)",
      },
      water: {
        "--color-text": "rgb(191, 229, 249)",
        "--color-accent-primary": "rgb(134, 196, 240)",
        "--button-bg": "rgba(134, 196, 240, 0.8)",
        "--button-bg-light": "rgba(214, 220, 251, 0.2)",
        "--link-color": "rgba(134, 196, 240, 0.8)",
      },
    }),
    [],
  )

  // global styles
  const globalStyles = useMemo(() => {
    const scrollbarColor =
      theme === "bunny" ? themes.bunny["--button-bg"] : themes.water["--button-bg"]

    const accent =
      theme === "bunny"
        ? themes.bunny["--color-accent-primary"]
        : themes.water["--color-accent-primary"]

    return `
      @import url('https://fonts.googleapis.com/css2?family=Dosis:wght@700&display=swap');
      html, body { margin: 0; padding: 0; overflow: hidden; }
      .home-container {
        overflow: hidden;
        height: 100vh;
        scrollbar-width: none;
      }
      .home-container::-webkit-scrollbar {
        display: none;
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      .typing-cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        background-color: ${accent};
        margin-left: 2px;
        vertical-align: text-bottom;
        animation: blink 0.7s infinite;
      }
      /* 3D canvas behind content */
      .three-wrapper {
        position: fixed;
        inset: 0;               /* full viewport */
        z-index: 0;             /* behind your text */
        pointer-events: none;   /* clicks pass through */
      }
      .three-canvas {
        width: 100%;
        height: 100%;
        display: block;
        background: transparent; /* ensure alpha shows */
      }
      .content-layer {
        position: relative;
        z-index: 1;             /* above the canvas */
      }
      .fade {
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .fade.show {
        opacity: 1;
        transform: translateY(0);
      }
      .home-scroll-indicator {
        width: 12px;
        position: relative;
        margin: 0 auto;
        opacity: 0.6;
      }
      .home-scroll-indicator::before,
      .home-scroll-indicator::after,
      .home-scroll-dots::before,
      .home-scroll-dots::after {
        content: "";
        display: block;
        margin-left: auto;
        margin-right: auto;
      }
      .home-scroll-indicator::before {
        width: 12px;
        height: 12px;
        border-radius: 10px;
        border: 1px solid currentColor;
        animation: home-dot 3s infinite ease-in-out;
      }
      .home-scroll-indicator::after {
        width: 7px;
        height: 7px;
        border-right: 1px solid currentColor;
        border-bottom: 1px solid currentColor;
        transform: rotate(45deg);
        animation: home-arrow 3s infinite ease-in-out;
        animation-delay: 0.75s;
        opacity: 0.25;
        margin-top: 6px;
      }
      .home-scroll-dots::before,
      .home-scroll-dots::after {
        border-radius: 10px;
        border: 1px solid currentColor;
        animation: home-dot 3s infinite ease-in-out;
      }
      .home-scroll-dots::before {
        width: 8px;
        height: 8px;
        animation-delay: 0.25s;
        margin: 5px auto;
      }
      .home-scroll-dots::after {
        width: 6px;
        height: 6px;
        animation-delay: 0.5s;
        margin: 5px auto;
      }
      @keyframes home-dot {
        0% { transform: scale(0.75); opacity: 0.25; }
        25% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0.75); opacity: 0.25; }
      }
      @keyframes home-arrow {
        0% { transform: scale(0.75) rotate(45deg); opacity: 0.25; }
        25% { transform: scale(1) rotate(45deg); opacity: 1; }
        100% { transform: scale(0.75) rotate(45deg); opacity: 0.25; }
      }
      .home-center-scroll {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-transform: uppercase;
        font-family: 'Dosis', sans-serif;
        letter-spacing: 0.3em;
      }
      .home-center-scroll-text {
        margin-bottom: 8px;
        font-size: 0.75rem;
        opacity: 0.65;
      }
      .home-center-scroll-line {
        width: 1px;
        height: 60px;
        background-color: currentColor;
        opacity: 0.65;
      }
    `
  }, [theme, themes])

  // derived values
  const imageSize = useMemo(() => {
    if (isSmallScreen) return isMobile ? "120px" : "180px"
    return isMobile ? "180px" : "220px"
  }, [isSmallScreen, isMobile])

  const padding = useMemo(() => {
    return windowWidth < 510 ? "11px" : isMobile ? "50px" : "20px"
  }, [windowWidth, isMobile])

  const contentHeight = isSmallScreen ? "auto" : "100vh"
  const contentMaxWidth = useMemo(() => {
    const desiredGuard = isMobile ? 120 : 160 // space reserved for the vertical timestamp
    const minWidth = isMobile ? 200 : 600
    const maxWidth = isMobile ? 700 : 980
    const maxGuard = Math.max(windowWidth - minWidth, 0)
    const guard = Math.min(desiredGuard, maxGuard)
    const candidateWidth = Math.max(windowWidth - guard, 0)
    const limitedWidth = Math.min(maxWidth, candidateWidth)
    return limitedWidth
  }, [isMobile, windowWidth])
  const bubblePalette = useMemo(() => {
    const base = theme === "bunny" ? "rgba(255, 255, 255, 0.18)" : "rgba(10, 40, 90, 0.28)"
    const hover = theme === "bunny" ? "rgba(255, 255, 255, 0.28)" : "rgba(20, 70, 130, 0.35)"
    const border = theme === "bunny" ? "rgba(255, 255, 255, 0.55)" : "rgba(255, 255, 255, 0.35)"
    const text = theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"]
    const glow = theme === "bunny" ? "rgba(223, 30, 155, 0.35)" : "rgba(134, 196, 240, 0.3)"
    return { base, hover, border, text, glow }
  }, [theme, themes])
  const navButtonsEnabled = isFlowerRevealed
  const scrollIndicatorColor = "rgba(255, 255, 255, 0.85)"
  const scrollCueOpacity = useMemo(() => {
    if (!revealThreshold) return 1
    const progress = Math.min(virtualScroll / Math.max(revealThreshold * 0.6, 1), 1)
    return 1 - progress
  }, [virtualScroll, revealThreshold])
  const scrollCueBottom = useMemo(() => {
    const base = footerHeight || (isMobile ? 90 : 70)
    const adjustment = isMobile ? -20 : 10
    return Math.max(16, base + adjustment)
  }, [footerHeight, isMobile])

  return (
    <>
      <style>{globalStyles}</style>

      <div
        className="home-container"
        style={{
          width: "100%",
          height: contentHeight,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          position: "relative",
          padding,
          touchAction: "none",
        }}
        onWheel={handleWheelGesture}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (isAnimationComplete) onScramble()
        }}
      >
        <div
          className={`fade ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
          aria-hidden={!isAnimationComplete}
          style={{
            position: "fixed",
            left: isMobile ? 40 : 55,
            top: "50%",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            transformOrigin: "center",
            fontFamily: "monospace",
            fontSize: isMobile ? 11 : 13,
            letterSpacing: "0.2em",
            color:
              theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
            textTransform: "uppercase",
            pointerEvents: "none",
            zIndex: 45,
          }}
        >
          est • {estTime}
        </div>

        {/* ---- THREE.JS BACKDROP (transparent, full height) ---- */}
        <div
          className="three-wrapper"
          aria-hidden
          style={{
            opacity: isFlowerRevealed ? 1 : 0,
            visibility: isFlowerRevealed ? "visible" : "hidden",
            transition: "opacity 0.6s ease, visibility 0.6s ease",
          }}
        >
          <Canvas
            className="three-canvas"
            gl={{ alpha: true, antialias: true, preserveDrawingBuffer: false }}
            dpr={[1, 2]}
            camera={{ fov: 35, near: 0.1, far: 1000, position: [0, 0, 3] }}
          >
            <FlowerScene layout={{ isMobile, isSmallScreen, windowWidth }} />
          </Canvas>
        </div>

        {/* Floating glass navigation bubbles */}
        <div
          aria-hidden={!isFlowerRevealed}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            opacity: isFlowerRevealed ? 1 : 0,
            transition: "opacity 0.5s ease",
            zIndex: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 16 : 24,
              transform: `translateY(${isMobile ? "-28vh" : "-24vh"})`,
              alignItems: "center",
              pointerEvents: isFlowerRevealed ? "auto" : "none",
            }}
          >
            {[
              {
                label: "Projects",
                onClick: () => navigate("/portfolio"),
              },
              {
                label: "Artwork",
                onClick: () => navigate("/creative"),
              },
              {
                label: "Awards",
                onClick: () => setShowAwards(true),
              },
            ].map((item) => (
              <button
                key={item.label}
                disabled={!navButtonsEnabled}
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  if (!navButtonsEnabled) return
                  item.onClick()
                }}
                onMouseEnter={(event) => {
                  if (!navButtonsEnabled) return
                  event.currentTarget.style.background = bubblePalette.hover
                  event.currentTarget.style.boxShadow = `0 18px 45px ${bubblePalette.glow}`
                }}
                onMouseLeave={(event) => {
                  if (!navButtonsEnabled) return
                  event.currentTarget.style.background = bubblePalette.base
                  event.currentTarget.style.boxShadow = `0 12px 30px ${bubblePalette.glow}`
                }}
                style={{
                  background: bubblePalette.base,
                  border: `1px solid ${bubblePalette.border}`,
                  borderRadius: 999,
                  padding: isMobile ? "14px 42px" : "18px 60px",
                  width: isMobile ? "min(260px, 85vw)" : "auto",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                  fontSize: isMobile ? 14 : 16,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: bubblePalette.text,
                  backdropFilter: "blur(26px)",
                  WebkitBackdropFilter: "blur(26px)",
                  boxShadow: `0 12px 30px ${bubblePalette.glow}`,
                  cursor: navButtonsEnabled ? "pointer" : "default",
                  transition: "transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease",
                  transform: "translateZ(0)",
                  outline: "none",
                  pointerEvents: navButtonsEnabled ? "auto" : "none",
                  opacity: navButtonsEnabled ? 1 : 0.6,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* content */}
        <div
          className="content-layer"
          style={{
            maxWidth: contentMaxWidth,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            position: "relative",
            opacity: isFlowerRevealed ? 0 : 1,
            visibility: isFlowerRevealed ? "hidden" : "visible",
            transition: "opacity 0.5s ease",
          }}
        >
          {/* typing intro */}
          {!isAnimationComplete && !isNavigatingFromPage && (
            <div
              ref={typingRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontFamily: "monospace",
                fontSize: isMobile ? 40 : 48,
                fontWeight: "bold",
                color:
                  theme === "bunny"
                    ? themes.bunny["--color-accent-primary"]
                    : themes.water["--color-accent-primary"],
                textAlign: "center",
                zIndex: 10,
                transition: "opacity 0.3s ease",
              }}
            >
              {typingText}
              <span className="typing-cursor" />
            </div>
          )}

          <div
            className={`fade ${phase >= 1 && isAnimationComplete ? "show" : ""}`}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? 5 : 20,
              marginTop: isMobile ? 30 : 20,
              marginBottom: isMobile ? 25 : 0,
              width: "100%",
              visibility: isAnimationComplete ? "visible" : "hidden",
            }}
          >
            <div className={`fade ${phase >= 2 && isAnimationComplete ? "show" : ""}`}>
              <AsciiImage src="/images/ximing.jpg" alt="Ximing Luo" size={imageSize} theme={theme} />
            </div>

            <div style={{ textAlign: isMobile ? "center" : "left" }}>
              <p
                className={`fade ${phase >= 3 && isAnimationComplete ? "show" : ""}`}
                style={{
                  fontFamily: "monospace",
                  fontSize: isMobile ? 12 : 16,
                  fontWeight: "bold",
                  color:
                    theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
                  margin: isMobile ? "5px 0" : "10px 0",
                }}
              >
                {roleTop}
              </p>

              <h1
                ref={headingRef}
                className={`fade ${phase >= 2 && isAnimationComplete ? "show" : ""}`}
                style={{
                  fontFamily: "monospace",
                  fontSize: isMobile ? 25 : 32,
                  fontWeight: "bold",
                  color:
                    theme === "bunny"
                      ? themes.bunny["--color-accent-primary"]
                      : themes.water["--color-accent-primary"],
                  margin: isMobile ? "5px 0" : "10px 0",
                }}
              >
                Hi, I'm Ximing!
              </h1>

              <p
                className={`fade ${phase >= 3 && isAnimationComplete ? "show" : ""}`}
                style={{
                  fontFamily: "monospace",
                  fontSize: isMobile ? 12 : 16,
                  fontWeight: "bold",
                  color:
                    theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
                  margin: isMobile ? "0px 0" : "10px 0",
                }}
              >
                {roleBot}
              </p>
            </div>
          </div>

          {/* bio section */}
          <div
            className={`fade ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
            style={{
              maxWidth: 700,
              textAlign: "center",
              fontFamily: "monospace",
              fontSize: isMobile ? 12 : 14,
              lineHeight: isMobile ? 1.1 : 1.4,
              opacity: phase >= 4 && isAnimationComplete ? 1 : 0,
              transform: `translateY(${phase >= 4 && isAnimationComplete ? 0 : 20}px)`,
              transition: "opacity 0.8s ease, transform 0.8s ease",
              color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
              marginBottom: isMobile ? 20 : 20,
              padding: isMobile ? "0 10px" : 0,
            }}
          >
            <p style={{ marginBottom: isMobile ? 0 : 20 }}>
              I'm a student at the University of Pennsylvania, studying Computer Science (<a
                href="http://cg.cis.upenn.edu/dmd.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "underline",
                  color:
                    theme === "bunny" ? themes.bunny["--link-color"] : themes.water["--link-color"],
                }}
              >
                Digital Media Design
              </a>) and Economics.
            </p>
            <p style={{ marginBottom: isMobile ? 0 : 20 }}>
              I have experience in iOS, graphics, fullstack, XR, and AI/ML. I was a summer analyst at{" "}
              <a
                href="https://www.apollo.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "underline",
                  color:
                    theme === "bunny" ? themes.bunny["--link-color"] : themes.water["--link-color"],
                }}
              >
                Apollo Global Management
              </a>{" "}
              and I currently teach iOS Programming{" "}
              <a
                href="https://www.seas.upenn.edu/~cis1951/25fa/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "underline",
                  color:
                    theme === "bunny" ? themes.bunny["--link-color"] : themes.water["--link-color"],
                }}
              >
                (CIS 1951)
              </a>
              . My work has been recognized by Adobe and{" "}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAwards(true)
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color:
                    theme === "bunny" ? themes.bunny["--link-color"] : themes.water["--link-color"],
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
              >
                other awards
              </button>
              . Feel free to explore!
            </p>
            <p>
              Say hello:{" "}
              <a
                href="mailto:ximluo@upenn.edu"
                style={{
                  color:
                    theme === "bunny" ? themes.bunny["--link-color"] : themes.water["--link-color"],
                  textDecoration: "none",
                  marginLeft: 4,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                ximluo@upenn.edu
              </a>
            </p>
          </div>
        </div>

        {!isFlowerRevealed && !isMobile && (
          <div
            className={`fade ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
            aria-hidden
            style={{
              position: "fixed",
              bottom: (footerHeight || 70) + 20,
              left: 45,
              zIndex: 45,
              pointerEvents: "none",
            }}
          >
            <div className="home-scroll-indicator" style={{ color: scrollIndicatorColor }}>
              <div className="home-scroll-dots" />
            </div>
          </div>
        )}

        <div
          className={`fade ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
          aria-hidden={!isAnimationComplete}
          style={{
            position: "fixed",
            bottom: scrollCueBottom,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 45,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              opacity: scrollCueOpacity,
              transition: "opacity 0.3s ease",
            }}
          >
            <div
              className="home-center-scroll"
              style={{
                color:
                  theme === "bunny"
                    ? themes.bunny["--color-accent-primary"]
                    : themes.water["--color-accent-primary"],
              }}
            >
              <span
                className="home-center-scroll-text"
                style={{
                  padding: isMobile ? "0 12px" : undefined,
                  marginBottom: isMobile ? 30 : undefined,
                }}
              >
                Scroll
              </span>
              {!isMobile && <span className="home-center-scroll-line" />}
            </div>
          </div>
        </div>

        {/* awards modal */}
        {showAwards && <AwardsModal onClose={() => setShowAwards(false)} theme={theme} />}
      </div>
    </>
  )
}

useGLTF.preload("/models/blue_flower.glb")
export default Home
