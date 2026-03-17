import type React from "react"
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"
import { Canvas } from "@react-three/fiber"
import "./Home.css"

import AwardsModal from "../../components/AwardsModal"
import OptimizedImage from "../../components/ui/OptimizedImage"
import photos from "../../data/photos"
import projects from "../../data/projects"
import useIntersectionOnce from "../../hooks/useIntersectionOnce"
import {
  CONTENT_THEME_TOKENS,
  HOME_THEME_TOKENS,
  THEME_VISUAL_TOKENS,
  type ThemeType,
} from "../../theme/tokens"
import { trackBunnyModalOpen } from "../../utils/analytics"
import FlowerScene from "./FlowerScene"
import { HomeDesktopEstRail, HomeDesktopScrollProgress, HomeIntroPanel } from "./HomeSections"
import { useHomeIntroSequence, useHomeViewportState } from "./home.hooks"

const BunnyModal = lazy(() => import("../../features/bunny"))
const HOME_SCROLL_PAGE_COUNT = 4
const HOME_TALL_PAGE_THRESHOLD_PX = 8
const HOME_SHOWCASE_DESKTOP_MAX_WIDTH = 1000
const HOME_SHOWCASE_RAIL_CLEARANCE_PX = 96
const HOME_SIDE_RAIL_BREAKPOINT_PX = 1024
const HOME_SINGLE_COLUMN_BREAKPOINT_PX = 767
const HOME_SCROLL_GUIDE_FLOWER_GAP_PX = 24
const HOME_SCROLL_GUIDE_TEXT_GAP_PX = 4
const HOME_SCROLL_CUE_BIO_GAP_PX = 18
const HOME_SCROLL_UNLOCK_DELAY_MS = 0
const HOME_SCROLL_LOCK_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
  "Spacebar",
])

function isGifAsset(source: string) {
  return /\.gif(?:$|[?#])/i.test(source)
}

function getShortCardDescription(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return ""
  const firstSentenceMatch = trimmed.match(/.*?[.!?](?:\s|$)/)
  return (firstSentenceMatch?.[0] ?? trimmed).trim()
}

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
  const [showBunny, setShowBunny] = useState(false)
  const [shouldMountFlowerScene, setShouldMountFlowerScene] = useState(false)
  const [isFlowerSceneReady, setIsFlowerSceneReady] = useState(false)
  const [isScrollUnlocked, setIsScrollUnlocked] = useState(isNavigatingFromPage)
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [resolvedScrollCueBottom, setResolvedScrollCueBottom] = useState(44)
  const [scrollGuideMetrics, setScrollGuideMetrics] = useState({ top: 0, height: 0 })
  const [tallPageFlags, setTallPageFlags] = useState<boolean[]>(
    () => Array.from({ length: HOME_SCROLL_PAGE_COUNT }, () => false),
  )
  const homeContainerRef = useRef<HTMLDivElement | null>(null)
  const introBioRef = useRef<HTMLDivElement | null>(null)
  const scrollCueRef = useRef<HTMLButtonElement | null>(null)
  const flowerActionsAnchorRef = useRef<HTMLDivElement | null>(null)
  const scrollPageRefs = useRef<Array<HTMLElement | null>>([])
  const scrollPageContentRefs = useRef<Array<HTMLElement | null>>([])

  const { windowWidth, windowHeight, isMobile, isSmallScreen, footerHeight, estTime } =
    useHomeViewportState()
  const [sectionHeight, setSectionHeight] = useState<number>(windowHeight || 760)

  const { typingRef, typingText, isAnimationComplete } = useHomeIntroSequence({
    phase,
    onScramble,
    isNavigatingFromPage,
  })

  const themes = HOME_THEME_TOKENS
  const currentTheme = themes[theme]
  const contentTheme = CONTENT_THEME_TOKENS[theme]
  const textColor = currentTheme["--color-text"]
  const accentColor = currentTheme["--color-accent-primary"]
  const linkColor = currentTheme["--link-color"]
  const homeScrollCueColor =
    theme === "bunny" ? "rgba(121, 85, 189, 0.74)" : "rgba(170, 214, 255, 0.6)"
  const homeScrollGuideGradient =
    theme === "bunny"
      ? "linear-gradient(to bottom, rgba(121, 85, 189, 0.74) 0%, rgba(223, 30, 155, 0.26) 58%, rgba(223, 30, 155, 0.12) 100%)"
      : "linear-gradient(to bottom, rgba(170, 214, 255, 0.72) 0%, rgba(170, 214, 255, 0.28) 58%, rgba(170, 214, 255, 0.14) 100%)"
  const homeScrollGuideDotBorder =
    theme === "bunny" ? "rgba(121, 85, 189, 0.5)" : "rgba(170, 214, 255, 0.5)"
  const homeActionBorder =
    theme === "bunny" ? "rgba(223, 30, 155, 0.34)" : "rgba(173, 214, 255, 0.46)"
  const homeActionBackground =
    theme === "bunny"
      ? "linear-gradient(180deg, rgba(137, 112, 183, 0.4) 0%, rgba(223, 30, 155, 0.32) 100%)"
      : "linear-gradient(180deg, rgba(15, 58, 104, 0.78) 0%, rgba(24, 77, 132, 0.72) 100%)"
  const homeActionBackgroundHover =
    theme === "bunny"
      ? "linear-gradient(180deg, rgba(121, 85, 189, 0.5) 0%, rgba(223, 30, 155, 0.42) 100%)"
      : "linear-gradient(180deg, rgba(21, 70, 120, 0.84) 0%, rgba(34, 93, 154, 0.78) 100%)"
  const homeActionText =
    theme === "bunny" ? contentTheme["--button-text"] : "rgba(214, 238, 255, 0.96)"
  const homeActionShadow =
    theme === "bunny"
      ? "inset 0 0 0 1px rgba(255, 255, 255, 0.14), 0 10px 28px rgba(223, 30, 155, 0.22)"
      : "inset 0 0 0 1px rgba(255, 255, 255, 0.12), 0 10px 28px rgba(79, 153, 223, 0.25)"

  const imageSize = useMemo(() => {
    if (isSmallScreen) return isMobile ? "120px" : "180px"
    return isMobile ? "160px" : "220px"
  }, [isSmallScreen, isMobile])

  const showHomeScrollProgress = windowWidth > HOME_SINGLE_COLUMN_BREAKPOINT_PX
  const showHomeSideRails = windowWidth > HOME_SIDE_RAIL_BREAKPOINT_PX

  const introHorizontalPadding = useMemo(() => {
    if (windowWidth < 510) return 11
    return isMobile ? 50 : 20
  }, [windowWidth, isMobile])

  const padding = useMemo(() => {
    return `${introHorizontalPadding}px`
  }, [introHorizontalPadding])

  const scrollCueBottom = useMemo(() => {
    const baseFooterHeight = footerHeight || 70

    if (windowWidth <= HOME_SINGLE_COLUMN_BREAKPOINT_PX) {
      return Math.max(baseFooterHeight - 42, 18)
    }

    if (windowWidth <= HOME_SIDE_RAIL_BREAKPOINT_PX) {
      return Math.max(baseFooterHeight - 22, 36)
    }

    return Math.max(baseFooterHeight - 16, 44)
  }, [footerHeight, windowWidth])

  const showcaseHorizontalPadding = useMemo(() => {
    if (windowWidth <= HOME_SIDE_RAIL_BREAKPOINT_PX) return introHorizontalPadding
    return 20
  }, [introHorizontalPadding, windowWidth])

  const showcasePadding = useMemo(() => {
    if (windowWidth < 510) return "14px 11px 20px"
    if (windowWidth <= HOME_SIDE_RAIL_BREAKPOINT_PX) {
      return `20px ${introHorizontalPadding}px 30px`
    }
    return isMobile ? "16px 14px 24px" : "20px 20px 30px"
  }, [introHorizontalPadding, isMobile, windowWidth])

  const flowerPadding = "0"

  const contentMaxWidth = useMemo(() => {
    const desiredGuard = isMobile ? 0 : 160
    const minWidth = isMobile ? 200 : 600
    const maxWidth = isMobile ? 700 : 980
    const maxGuard = Math.max(windowWidth - minWidth, 0)
    const guard = Math.min(desiredGuard, maxGuard)
    const candidateWidth = Math.max(windowWidth - guard, 0)
    return Math.min(maxWidth, candidateWidth)
  }, [isMobile, windowWidth])

  const showcaseMaxWidth = useMemo(() => {
    if (!showHomeSideRails) return contentMaxWidth
    const safeViewportWidth =
      windowWidth - HOME_SHOWCASE_RAIL_CLEARANCE_PX * 2 - showcaseHorizontalPadding * 2
    return Math.max(Math.min(HOME_SHOWCASE_DESKTOP_MAX_WIDTH, safeViewportWidth), 320)
  }, [contentMaxWidth, showHomeSideRails, showcaseHorizontalPadding, windowWidth])

  const featuredProjects = useMemo(() => projects.slice(0, 3), [])
  const featuredArtworks = useMemo(() => photos.slice(0, 3), [])
  const { ref: setProjectsSectionRef, hasIntersected: hasProjectsIntersected } =
    useIntersectionOnce<HTMLDivElement>({
      rootMargin: "-10% 0px -15% 0px",
      threshold: 0.2,
    })
  const { ref: setArtworkSectionRef, hasIntersected: hasArtworkIntersected } =
    useIntersectionOnce<HTMLDivElement>({
      rootMargin: "-10% 0px -15% 0px",
      threshold: 0.2,
    })
  const { ref: setFlowerSectionRef, hasIntersected: hasFlowerIntersected } =
    useIntersectionOnce<HTMLDivElement>({
      rootMargin: "-10% 0px -15% 0px",
      threshold: 0.2,
    })

  const flowerCanvasDpr: [number, number] = isMobile ? [1, 1.35] : [1, 1.35]

  const scrollToPage = useCallback((pageIndex: number) => {
    const parent = homeContainerRef.current?.parentElement
    const clampedIndex = Math.max(0, Math.min(pageIndex, HOME_SCROLL_PAGE_COUNT - 1))
    const page = scrollPageRefs.current[clampedIndex]
    if (!parent || !page) return

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    parent.scrollTo({
      top: page.offsetTop,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }, [])

  useEffect(() => {
    if (shouldMountFlowerScene) return
    if (isAnimationComplete) {
      setShouldMountFlowerScene(true)
      return
    }
  }, [isAnimationComplete, shouldMountFlowerScene])

  useEffect(() => {
    if (isNavigatingFromPage) {
      setIsScrollUnlocked(true)
      return
    }

    if (phase < 4 || !isAnimationComplete) {
      setIsScrollUnlocked(false)
      return
    }

    const timer = window.setTimeout(() => setIsScrollUnlocked(true), HOME_SCROLL_UNLOCK_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [isAnimationComplete, isNavigatingFromPage, phase])

  useEffect(() => {
    if (typeof window === "undefined") return
    const parent = homeContainerRef.current?.parentElement
    if (!parent) return

    const updateHeight = () => {
      const nextHeight = Math.max(parent.clientHeight, 320)
      setSectionHeight((prev) => (prev === nextHeight ? prev : nextHeight))
    }

    updateHeight()

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight)
      return () => window.removeEventListener("resize", updateHeight)
    }

    const observer = new ResizeObserver(updateHeight)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [windowHeight])

  useEffect(() => {
    if (typeof window === "undefined") return
    const parent = homeContainerRef.current?.parentElement
    if (!parent) return

    let frameId = 0

    const updatePageMetrics = () => {
      frameId = 0
      const viewportHeight = Math.max(parent.clientHeight, 1)
      const nextTallFlags = Array.from({ length: HOME_SCROLL_PAGE_COUNT }, (_, index) => {
        const contentNode = scrollPageContentRefs.current[index] ?? scrollPageRefs.current[index]
        if (!contentNode) return false

        return contentNode.scrollHeight > viewportHeight + HOME_TALL_PAGE_THRESHOLD_PX
      })
      const scrollMidpoint = parent.scrollTop + viewportHeight / 2
      let nextPageIndex = 0

      scrollPageRefs.current.forEach((page, index) => {
        if (!page) return

        const pageTop = page.offsetTop
        const pageBottom = pageTop + page.offsetHeight

        if (scrollMidpoint >= pageTop) {
          nextPageIndex = index
        }

        if (scrollMidpoint >= pageTop && scrollMidpoint < pageBottom) {
          nextPageIndex = index
        }
      })

      setTallPageFlags((prev) =>
        prev.length === nextTallFlags.length && prev.every((flag, index) => flag === nextTallFlags[index])
          ? prev
          : nextTallFlags,
      )
      setActivePageIndex((prev) => (prev === nextPageIndex ? prev : nextPageIndex))
    }

    const schedulePageMetrics = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updatePageMetrics)
    }

    updatePageMetrics()
    parent.addEventListener("scroll", schedulePageMetrics, { passive: true })
    window.addEventListener("resize", schedulePageMetrics)

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedulePageMetrics)
    resizeObserver?.observe(parent)
    scrollPageRefs.current.forEach((page) => page && resizeObserver?.observe(page))
    scrollPageContentRefs.current.forEach((content) => content && resizeObserver?.observe(content))

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      parent.removeEventListener("scroll", schedulePageMetrics)
      window.removeEventListener("resize", schedulePageMetrics)
    }
  }, [sectionHeight, isAnimationComplete])

  useLayoutEffect(() => {
    const parent = homeContainerRef.current?.parentElement
    if (!parent) return

    parent.classList.toggle("main-content-scroll--home-locked", !isScrollUnlocked)

    if (!isScrollUnlocked) {
      parent.scrollTop = 0
    }

    return () => {
      parent.classList.remove("main-content-scroll--home-locked")
    }
  }, [isScrollUnlocked])

  useLayoutEffect(() => {
    if (typeof window === "undefined") return

    const introSection = scrollPageRefs.current[0]
    const scrollCue = scrollCueRef.current
    if (!introSection || !scrollCue) {
      setResolvedScrollCueBottom(scrollCueBottom)
      return
    }

    let frameId = 0

    const updateScrollCueBottom = () => {
      frameId = 0

      const sectionRect = introSection.getBoundingClientRect()
      const cueHeight = scrollCue.offsetHeight
      let nextBottom = scrollCueBottom

      if (phase >= 4 && isAnimationComplete && introBioRef.current) {
        const bioRect = introBioRef.current.getBoundingClientRect()
        const bioBottom = bioRect.bottom - sectionRect.top
        const maxBottomWithoutOverlap = Math.max(
          sectionRect.height - cueHeight - bioBottom - HOME_SCROLL_CUE_BIO_GAP_PX,
          0,
        )

        nextBottom = Math.min(scrollCueBottom, maxBottomWithoutOverlap)
      }

      setResolvedScrollCueBottom((prev) => {
        const roundedBottom = Math.round(nextBottom)
        return prev === roundedBottom ? prev : roundedBottom
      })
    }

    const scheduleScrollCueUpdate = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updateScrollCueBottom)
    }

    scheduleScrollCueUpdate()
    window.addEventListener("resize", scheduleScrollCueUpdate)

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleScrollCueUpdate)
    resizeObserver?.observe(introSection)
    resizeObserver?.observe(scrollCue)
    if (introBioRef.current) resizeObserver?.observe(introBioRef.current)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      window.removeEventListener("resize", scheduleScrollCueUpdate)
    }
  }, [isAnimationComplete, phase, scrollCueBottom, sectionHeight, windowWidth])

  useEffect(() => {
    if (typeof window === "undefined" || isScrollUnlocked) return

    const preventWheel = (event: WheelEvent) => {
      if (event.cancelable) event.preventDefault()
    }

    const preventTouchMove = (event: TouchEvent) => {
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

      if (HOME_SCROLL_LOCK_KEYS.has(event.key) || event.code === "Space") {
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
  }, [isScrollUnlocked])

  useEffect(() => {
    if (typeof window === "undefined") return
    const container = homeContainerRef.current
    const scrollCue = scrollCueRef.current
    const flowerActionsAnchor = flowerActionsAnchorRef.current
    if (!container || !scrollCue || !flowerActionsAnchor) return

    let frameId = 0

    const updateScrollGuide = () => {
      frameId = 0

      const containerRect = container.getBoundingClientRect()
      const scrollCueRect = scrollCue.getBoundingClientRect()
      const flowerActionsAnchorRect = flowerActionsAnchor.getBoundingClientRect()

      const nextTop = Math.max(
        scrollCueRect.bottom - containerRect.top + HOME_SCROLL_GUIDE_TEXT_GAP_PX,
        0,
      )
      const nextBottom = Math.max(
        flowerActionsAnchorRect.top - containerRect.top - HOME_SCROLL_GUIDE_FLOWER_GAP_PX,
        nextTop,
      )
      const nextHeight = Math.max(nextBottom - nextTop, 0)

      setScrollGuideMetrics((prev) => {
        const roundedTop = Math.round(nextTop)
        const roundedHeight = Math.round(nextHeight)

        if (prev.top === roundedTop && prev.height === roundedHeight) return prev
        return { top: roundedTop, height: roundedHeight }
      })
    }

    const scheduleScrollGuide = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updateScrollGuide)
    }

    scheduleScrollGuide()
    window.addEventListener("resize", scheduleScrollGuide)

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleScrollGuide)
    resizeObserver?.observe(container)
    resizeObserver?.observe(scrollCue)
    resizeObserver?.observe(flowerActionsAnchor)
    scrollPageRefs.current.forEach((page) => page && resizeObserver?.observe(page))
    scrollPageContentRefs.current.forEach((content) => content && resizeObserver?.observe(content))

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      window.removeEventListener("resize", scheduleScrollGuide)
    }
  }, [footerHeight, isAnimationComplete, phase, sectionHeight, windowWidth])

  return (
    <div
      ref={homeContainerRef}
      className="home-container"
      style={{
        width: "100%",
        minHeight: "100%",
        boxSizing: "border-box",
        position: "relative",
        touchAction: "auto",
        ["--home-accent" as string]: accentColor,
        ["--home-preview-border" as string]: currentTheme["--button-bg-light"],
        ["--home-preview-surface" as string]: THEME_VISUAL_TOKENS[theme].surfacePortfolioCard,
        ["--home-preview-text" as string]: textColor,
        ["--home-preview-accent" as string]: accentColor,
        ["--home-preview-button-bg" as string]: currentTheme["--button-bg"],
        ["--home-preview-button-text" as string]: textColor,
        ["--home-scroll-cue-color" as string]: homeScrollCueColor,
        ["--home-scroll-guide-gradient" as string]: homeScrollGuideGradient,
        ["--home-scroll-guide-dot-border" as string]: homeScrollGuideDotBorder,
        ["--home-action-border" as string]: homeActionBorder,
        ["--home-action-bg" as string]: homeActionBackground,
        ["--home-action-bg-hover" as string]: homeActionBackgroundHover,
        ["--home-action-text" as string]: homeActionText,
        ["--home-action-shadow" as string]: homeActionShadow,
        ["--home-section-height" as string]: `${sectionHeight}px`,
        ["--home-footer-height" as string]: `${footerHeight}px`,
        ["--home-scroll-guide-top" as string]: `${scrollGuideMetrics.top}px`,
        ["--home-scroll-guide-height" as string]: `${scrollGuideMetrics.height}px`,
        ["--home-showcase-max-width" as string]: `${showcaseMaxWidth}px`,
      }}
    >
      {showHomeSideRails && (
        <>
          <HomeDesktopEstRail
            estTime={estTime}
            phase={phase}
            isAnimationComplete={isAnimationComplete}
            textColor={textColor}
          />
        </>
      )}
      {showHomeScrollProgress && (
        <>
          <HomeDesktopScrollProgress
            activePageIndex={activePageIndex}
            pageCount={HOME_SCROLL_PAGE_COUNT}
            phase={phase}
            isAnimationComplete={isAnimationComplete}
            textColor={textColor}
            onSelectPage={scrollToPage}
          />
        </>
      )}
      <div
        className={`home-scroll-guide ${phase >= 4 && isAnimationComplete && scrollGuideMetrics.height > 0 ? "is-visible" : ""}`}
        aria-hidden
      />

      <div className="home-scroll-pages">
        <section
          ref={(node) => {
            scrollPageRefs.current[0] = node
          }}
          className={`home-scroll-page home-scroll-page--intro ${tallPageFlags[0] ? "home-scroll-page--content-tall" : ""}`}
          style={{ padding }}
        >
          <div
            ref={(node) => {
              scrollPageContentRefs.current[0] = node
            }}
            className="home-intro-click-surface"
            onClick={() => {
              if (isAnimationComplete) onScramble()
            }}
          >
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
              isFlowerRevealed={false}
              isAnimationComplete={isAnimationComplete}
              isNavigatingFromPage={isNavigatingFromPage}
              textColor={textColor}
              accentColor={accentColor}
              linkColor={linkColor}
              onOpenAwards={() => setShowAwards(true)}
              bioRef={introBioRef}
            />
          </div>

          <button
            ref={scrollCueRef}
            type="button"
            className={`fade home-native-scroll-cue ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
            aria-label="Scroll to projects"
            disabled={!(phase >= 4 && isAnimationComplete)}
            onClick={() => scrollToPage(1)}
            style={{
              ["--home-scroll-side-bottom" as string]: `${resolvedScrollCueBottom}px`,
            }}
          >
            SCROLL
          </button>
        </section>

        <section
          ref={(node) => {
            scrollPageRefs.current[1] = node
          }}
          className={`home-scroll-page home-scroll-page--showcase ${tallPageFlags[1] ? "home-scroll-page--content-tall" : ""}`}
          style={{ padding: showcasePadding }}
        >
          <div
            ref={setProjectsSectionRef}
            className={`home-showcase-shell home-scroll-reveal ${hasProjectsIntersected ? "is-visible" : ""}`}
          >
            <div
              ref={(node) => {
                scrollPageContentRefs.current[1] = node
              }}
              className="home-preview-stack home-preview-stack--projects"
            >
              <div className="home-preview-section">
                <div className="home-preview-header">
                  <h2 className="home-preview-title">Projects</h2>
                </div>
                <div className="home-preview-grid home-preview-grid--projects">
                  {featuredProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      className="home-preview-card home-preview-card--project"
                      onClick={() => navigate(`/portfolio/${project.id}`)}
                    >
                      <OptimizedImage
                        src={project.image}
                        alt={project.name}
                        className="home-preview-card-image"
                        preferAnimatedGifVariant={isGifAsset(project.image)}
                        animatedGifVariantTier="thumb"
                        sizes="(max-width: 900px) 100vw, 33vw"
                      />
                      <span className="home-preview-card-overlay" />
                      <span className="home-project-preview-meta-panel">
                        <span className="home-project-preview-meta-row">
                          <span className="home-preview-card-copy">
                            <span className="home-preview-card-title">{project.name}</span>
                            <span className="home-preview-card-meta">
                              {project.languages.slice(0, 2).join(" / ")}
                            </span>
                          </span>
                          <span className="home-project-preview-arrow">→</span>
                        </span>
                        <span className="home-project-preview-description">
                          {getShortCardDescription(project.description)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="home-preview-more"
                onClick={() => navigate("/portfolio")}
              >
                View More Projects
              </button>
            </div>
          </div>
        </section>

        <section
          ref={(node) => {
            scrollPageRefs.current[2] = node
          }}
          className={`home-scroll-page home-scroll-page--showcase ${tallPageFlags[2] ? "home-scroll-page--content-tall" : ""}`}
          style={{ padding: showcasePadding }}
        >
          <div
            ref={setArtworkSectionRef}
            className={`home-showcase-shell home-scroll-reveal ${hasArtworkIntersected ? "is-visible" : ""}`}
          >
            <div
              ref={(node) => {
                scrollPageContentRefs.current[2] = node
              }}
              className="home-preview-stack"
            >
              <div className="home-preview-section">
                <div className="home-preview-header">
                  <h2 className="home-preview-title">Artwork</h2>
                </div>
                <div className="home-preview-grid home-preview-grid--artwork">
                  {featuredArtworks.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      className="home-preview-card home-preview-card--artwork"
                      onClick={() => navigate(`/creative?photo=${encodeURIComponent(photo.id)}`)}
                    >
                      <OptimizedImage
                        src={photo.image}
                        alt={photo.title}
                        className="home-preview-card-image"
                        sizes="(max-width: 900px) 100vw, 33vw"
                      />
                      <span className="home-preview-card-overlay" />
                      <span className="home-preview-card-copy">
                        <span className="home-preview-card-title">{photo.title}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="home-preview-more"
                onClick={() => navigate("/creative")}
              >
                View More Artwork
              </button>
            </div>
          </div>
        </section>

        <section
          ref={(node) => {
            scrollPageRefs.current[3] = node
          }}
          className={`home-scroll-page home-scroll-page--flower ${tallPageFlags[3] ? "home-scroll-page--content-tall" : ""}`}
          style={{ padding: flowerPadding }}
        >
          <div ref={flowerActionsAnchorRef} className="home-showcase-actions-anchor" aria-hidden />
          <div
            ref={setFlowerSectionRef}
            className={`home-showcase-flower-shell home-scroll-reveal ${hasFlowerIntersected ? "is-visible" : ""}`}
          >
            <div className="home-showcase-actions home-showcase-actions--floating">
              <button
                type="button"
                className="home-showcase-action"
                onClick={() => setShowAwards(true)}
              >
                Awards
              </button>
              <button
                type="button"
                className="home-showcase-action"
                onClick={() => {
                  trackBunnyModalOpen("home_flower_button")
                  setShowBunny(true)
                }}
              >
                🐰
              </button>
            </div>

            <div
              ref={(node) => {
                scrollPageContentRefs.current[3] = node
              }}
              className="home-showcase-flower-stack"
            >
              <div
                className="home-showcase-flower-stage"
                style={{
                  opacity: isFlowerSceneReady ? 1 : 0.15,
                }}
              >
                {shouldMountFlowerScene && (
                  <Canvas
                    className="home-showcase-flower-canvas"
                    gl={{
                      alpha: true,
                      antialias: true,
                      preserveDrawingBuffer: false,
                      powerPreference: "high-performance",
                    }}
                    dpr={flowerCanvasDpr}
                    frameloop="always"
                    camera={{ fov: 35, near: 0.1, far: 1000, position: [0, 0, 3] }}
                  >
                    <Suspense fallback={null}>
                      <FlowerScene
                        layout={{ isMobile, isSmallScreen, windowWidth, focusScale: 1.34 }}
                        onSceneReady={() => setIsFlowerSceneReady(true)}
                      />
                    </Suspense>
                  </Canvas>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {showAwards && <AwardsModal onClose={() => setShowAwards(false)} theme={theme} />}
      {showBunny && (
        <Suspense fallback={null}>
          <BunnyModal onClose={() => setShowBunny(false)} theme={theme} />
        </Suspense>
      )}
    </div>
  )
}

export default Home
