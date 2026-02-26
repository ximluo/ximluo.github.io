import type React from "react"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Canvas } from "@react-three/fiber"
import "./Home.css"

import AwardsModal from "../../components/AwardsModal"
import { HOME_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../../theme/tokens"
import FlowerScene from "./FlowerScene"
import {
  type BubblePalette,
  HomeDesktopEstRail,
  HomeIntroPanel,
  HomeNavigationBubbles,
  HomeScrollCues,
} from "./HomeSections"
import { useHomeIntroSequence, useHomeRevealState, useHomeViewportState } from "./home.hooks"

interface HomeProps {
  theme: ThemeType
  phase: number
  roleTop: string
  roleBot: string
  onScramble: () => void
  isNavigatingFromPage?: boolean
}

const Home: React.FC<HomeProps> = ({
  theme,
  phase,
  roleTop,
  roleBot,
  onScramble,
  isNavigatingFromPage = false,
}) => {
  const navigate = useNavigate()
  const [showAwards, setShowAwards] = useState(false)
  const [shouldMountFlowerScene, setShouldMountFlowerScene] = useState(false)
  const [isFlowerSceneReady, setIsFlowerSceneReady] = useState(false)

  const { windowWidth, windowHeight, isMobile, isSmallScreen, footerHeight, estTime } =
    useHomeViewportState()

  const { typingRef, typingText, isAnimationComplete } = useHomeIntroSequence({
    phase,
    onScramble,
    isNavigatingFromPage,
  })

  const {
    virtualScroll,
    revealThreshold,
    isFlowerRevealed,
    handleWheelGesture,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useHomeRevealState({
    windowHeight,
    isMobile,
    isAnimationComplete,
  })

  const themes = HOME_THEME_TOKENS
  const currentTheme = themes[theme]
  const visualTokens = THEME_VISUAL_TOKENS[theme]
  const textColor = currentTheme["--color-text"]
  const accentColor = currentTheme["--color-accent-primary"]
  const linkColor = currentTheme["--link-color"]

  const imageSize = useMemo(() => {
    if (isSmallScreen) return isMobile ? "120px" : "180px"
    return isMobile ? "160px" : "220px"
  }, [isSmallScreen, isMobile])

  const padding = useMemo(() => {
    return windowWidth < 510 ? "11px" : isMobile ? "50px" : "20px"
  }, [windowWidth, isMobile])

  const contentHeight = isSmallScreen ? "auto" : "100vh"

  const contentMaxWidth = useMemo(() => {
    const desiredGuard = isMobile ? 0 : 160
    const minWidth = isMobile ? 200 : 600
    const maxWidth = isMobile ? 700 : 980
    const maxGuard = Math.max(windowWidth - minWidth, 0)
    const guard = Math.min(desiredGuard, maxGuard)
    const candidateWidth = Math.max(windowWidth - guard, 0)
    return Math.min(maxWidth, candidateWidth)
  }, [isMobile, windowWidth])

  const bubblePalette = useMemo<BubblePalette>(() => {
    const text = textColor
    return {
      base: visualTokens.homeBubbleBase,
      hover: visualTokens.homeBubbleHover,
      border: visualTokens.homeBubbleBorder,
      text,
      glow: visualTokens.homeBubbleGlow,
    }
  }, [textColor, visualTokens])

  const navButtonsEnabled = isFlowerRevealed
  const scrollIndicatorColor = "rgba(255, 255, 255, 0.85)"
  const isFlowerVisible = isFlowerRevealed && isFlowerSceneReady

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

  const flowerCanvasDpr: [number, number] = isMobile ? [1, 1.35] : [1, 1.35]

  useEffect(() => {
    if (shouldMountFlowerScene) return
    if (isFlowerRevealed || isAnimationComplete) {
      setShouldMountFlowerScene(true)
      return
    }
  }, [isAnimationComplete, isFlowerRevealed, shouldMountFlowerScene])

  return (
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
        ["--home-accent" as string]: accentColor,
      }}
      onWheel={handleWheelGesture}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (isAnimationComplete) onScramble()
      }}
    >
      {!isMobile && (
        <HomeDesktopEstRail
          estTime={estTime}
          phase={phase}
          isAnimationComplete={isAnimationComplete}
          textColor={textColor}
        />
      )}

      <div
        className="three-wrapper"
        aria-hidden
        style={{
          opacity: isFlowerVisible ? 1 : 0,
          visibility: isFlowerVisible ? "visible" : "hidden",
          transition: "opacity 0.6s ease, visibility 0.6s ease",
        }}
      >
        {shouldMountFlowerScene && (
          <Canvas
            className="three-canvas"
            gl={{
              alpha: true,
              antialias: true,
              preserveDrawingBuffer: false,
              powerPreference: "high-performance",
            }}
            dpr={flowerCanvasDpr}
            frameloop={isFlowerRevealed ? "always" : "demand"}
            camera={{ fov: 35, near: 0.1, far: 1000, position: [0, 0, 3] }}
          >
            <Suspense fallback={null}>
              <FlowerScene
                layout={{ isMobile, isSmallScreen, windowWidth }}
                onSceneReady={() => setIsFlowerSceneReady(true)}
              />
            </Suspense>
          </Canvas>
        )}
      </div>

      <HomeNavigationBubbles
        isFlowerRevealed={isFlowerVisible}
        isMobile={isMobile}
        navButtonsEnabled={navButtonsEnabled && isFlowerSceneReady}
        bubblePalette={bubblePalette}
        onOpenPortfolio={() => navigate("/portfolio")}
        onOpenCreative={() => navigate("/creative")}
        onOpenAwards={() => setShowAwards(true)}
      />

      <HomeIntroPanel
        theme={theme}
        phase={phase}
        roleTop={roleTop}
        roleBot={roleBot}
        typingText={typingText}
        typingRef={typingRef}
        isMobile={isMobile}
        imageSize={imageSize}
        contentMaxWidth={contentMaxWidth}
        isFlowerRevealed={isFlowerVisible}
        isAnimationComplete={isAnimationComplete}
        isNavigatingFromPage={isNavigatingFromPage}
        textColor={textColor}
        accentColor={accentColor}
        linkColor={linkColor}
        onOpenAwards={() => setShowAwards(true)}
      />

      <HomeScrollCues
        phase={phase}
        isAnimationComplete={isAnimationComplete}
        isFlowerRevealed={isFlowerVisible}
        isMobile={isMobile}
        footerHeight={footerHeight}
        scrollCueBottom={scrollCueBottom}
        scrollCueOpacity={scrollCueOpacity}
        accentColor={accentColor}
        scrollIndicatorColor={scrollIndicatorColor}
      />

      {showAwards && <AwardsModal onClose={() => setShowAwards(false)} theme={theme} />}
    </div>
  )
}

export default Home
