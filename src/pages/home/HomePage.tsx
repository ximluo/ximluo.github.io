import type React from "react"
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useNavigate } from "react-router-dom"
import "../../components/ui/card.css"
import "./Home.css"

import Footer from "../../components/Footer"
import OptimizedImage from "../../components/ui/OptimizedImage"
import photos from "../../data/photos"
import projects from "../../data/projects"
import useIntersectionOnce from "../../hooks/useIntersectionOnce"
import { HOME_THEME_TOKENS, type ThemeType } from "../../theme/tokens"
import { HomeIntroPanel } from "./HomeSections"
import { useHomeViewportState } from "./home.hooks"
import usePageMeta from "../../hooks/usePageMeta"

const HomeFlowerModel = lazy(() => import("./HomeFlowerModel"))

const HOME_SCROLL_PAGE_COUNT = 3
const HOME_TALL_PAGE_THRESHOLD_PX = 8
const HOME_SHOWCASE_DESKTOP_MAX_WIDTH = 1280
const HOME_SHOWCASE_RAIL_CLEARANCE_PX = 96
const HOME_SIDE_RAIL_BREAKPOINT_PX = 1024
const HOME_INTRO_DESKTOP_OFFSET_BREAKPOINT_PX = 1366
const HOME_SINGLE_COLUMN_BREAKPOINT_PX = 767

const FEATURED_PROJECTS = projects.slice(0, 6)
const FEATURED_ARTWORKS = photos.slice(0, 3)

function isGifAsset(source: string) {
  return /\.gif(?:$|[?#])/i.test(source)
}

function getPhotoMedium(description: string) {
  return description.split("|")[0]?.trim() || description
}

interface HomeProjectPreviewImageProps {
  src: string
  alt: string
}

const HomeProjectPreviewImage: React.FC<HomeProjectPreviewImageProps> = ({ src, alt }) => {
  const mediaRef = useRef<HTMLSpanElement | null>(null)
  const isGif = isGifAsset(src)
  const [isInView, setIsInView] = useState(() => !isGif)

  useEffect(() => {
    if (!isGif) return

    const mediaNode = mediaRef.current
    if (!mediaNode || typeof IntersectionObserver === "undefined") {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio > 0.2)
      },
      { threshold: [0, 0.2, 0.5, 1] },
    )

    observer.observe(mediaNode)
    return () => observer.disconnect()
  }, [isGif])

  return (
    <span ref={mediaRef} className="home-preview-card-media">
      <OptimizedImage
        src={src}
        alt={alt}
        className="home-preview-card-image"
        preferPosterForGif={isGif && !isInView}
        preferAnimatedGifVariant={isGif && isInView}
        animatedGifVariantTier="thumb"
        sizes="(max-width: 767px) 80vw, 40vw"
      />
    </span>
  )
}

/*
 * The two showcase sections own their scroll-reveal IntersectionObserver
 * state so that revealing a section re-renders only that section, not the
 * whole home page. Props are stable, so `memo` also skips them entirely
 * when Home re-renders for viewport changes.
 */

interface ShowcaseSectionProps {
  registerContent: (node: HTMLElement | null) => void
}

interface ProjectsShowcaseProps extends ShowcaseSectionProps {
  gridRef: React.RefObject<HTMLDivElement | null>
}

const HomeProjectsShowcase = memo<ProjectsShowcaseProps>(({ registerContent, gridRef }) => {
  const navigate = useNavigate()
  const { ref: setSectionRef, hasIntersected } = useIntersectionOnce<HTMLDivElement>({
    rootMargin: "0px 0px 0px 0px",
    threshold: 0.01,
  })

  return (
    <div
      ref={setSectionRef}
      className={`home-showcase-shell home-scroll-reveal ${hasIntersected ? "is-visible" : ""}`}
    >
      <div ref={registerContent} className="home-preview-stack home-preview-stack--showcase-gap">
        <div className="home-preview-section">
          <div className="home-preview-header">
            <h2 className="home-preview-title">Projects</h2>
          </div>
          <div ref={gridRef} className="home-preview-grid home-preview-grid--projects">
            {FEATURED_PROJECTS.map((project) => (
              <button
                key={project.id}
                type="button"
                className="home-project-card"
                onClick={() => navigate(`/portfolio/${project.id}`)}
              >
                <span className="home-project-card-media-frame">
                  <HomeProjectPreviewImage src={project.image} alt={project.name} />
                  <span className="home-project-card-hover" aria-hidden>
                    <span className="home-project-card-view">View</span>
                  </span>
                </span>

                <span className="home-project-card-info">
                  <span className="home-project-card-copy">
                    <span className="home-project-card-title">{project.name}</span>
                    <span className="home-project-card-description">{project.tagline}</span>
                  </span>

                  <span className="home-project-card-languages" aria-label="Languages">
                    {project.languages.slice(0, 3).map((lang) => (
                      <span key={lang} className="home-project-card-language">
                        {lang}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="home-preview-more" onClick={() => navigate("/portfolio")}>
          View More Projects
        </button>
      </div>
    </div>
  )
})
HomeProjectsShowcase.displayName = "HomeProjectsShowcase"

const HomeArtworkShowcase = memo<ShowcaseSectionProps>(({ registerContent }) => {
  const navigate = useNavigate()
  const { ref: setSectionRef, hasIntersected } = useIntersectionOnce<HTMLDivElement>({
    rootMargin: "0px 0px 0px 0px",
    threshold: 0.01,
  })

  return (
    <div
      ref={setSectionRef}
      className={`home-showcase-shell home-scroll-reveal ${hasIntersected ? "is-visible" : ""}`}
    >
      <div ref={registerContent} className="home-preview-stack home-preview-stack--showcase-gap">
        <div className="home-preview-section">
          <div className="home-preview-header">
            <h2 className="home-preview-title">Artwork</h2>
          </div>
          <div className="home-preview-grid home-preview-grid--artwork">
            {FEATURED_ARTWORKS.map((photo) => (
              <button
                key={photo.id}
                type="button"
                className="home-project-card home-project-card--artwork"
                onClick={() => navigate(`/creative?photo=${encodeURIComponent(photo.id)}`)}
              >
                <span className="home-project-card-media-frame home-project-card-media-frame--square">
                  <OptimizedImage
                    src={photo.image}
                    alt={photo.title}
                    className="home-preview-card-image"
                    sizes="(max-width: 767px) 80vw, 33vw"
                  />
                  <span className="home-project-card-hover" aria-hidden>
                    <span className="home-project-card-view">View</span>
                  </span>
                </span>

                <span className="home-project-card-info">
                  <span className="home-project-card-copy">
                    <span className="home-project-card-title">{photo.title}</span>
                    <span className="home-project-card-description">
                      {getPhotoMedium(photo.description)}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="home-preview-more" onClick={() => navigate("/creative")}>
          View More Artwork
        </button>
      </div>
    </div>
  )
})
HomeArtworkShowcase.displayName = "HomeArtworkShowcase"

interface HomeProps {
  theme: ThemeType
  phase: number
}

const Home: React.FC<HomeProps> = ({ theme, phase }) => {
  usePageMeta()
  const [tallPageFlags, setTallPageFlags] = useState<boolean[]>(() =>
    Array.from({ length: HOME_SCROLL_PAGE_COUNT }, () => false),
  )
  const homeContainerRef = useRef<HTMLDivElement | null>(null)
  const scrollCueRef = useRef<HTMLButtonElement | null>(null)
  const projectGridRef = useRef<HTMLDivElement | null>(null)
  const scrollPageRefs = useRef<Array<HTMLElement | null>>([])
  const scrollPageContentRefs = useRef<Array<HTMLElement | null>>([])

  const { windowWidth, windowHeight, isMobile, footerHeight } = useHomeViewportState()
  const [sectionHeight, setSectionHeight] = useState<number>(windowHeight || 760)
  const [flowerLayerHeight, setFlowerLayerHeight] = useState<number>(windowHeight || 760)

  const themes = HOME_THEME_TOKENS
  const currentTheme = themes[theme]
  const textColor = currentTheme["--color-text"]
  const accentColor = currentTheme["--color-accent-primary"]
  const homeScrollCueColor = "rgba(170, 214, 255, 0.6)"
  const homeActionBorder = "rgba(173, 214, 255, 0.46)"
  const homeActionBackground =
    "linear-gradient(180deg, rgba(15, 58, 104, 0.78) 0%, rgba(24, 77, 132, 0.72) 100%)"
  const homeActionBackgroundHover =
    "linear-gradient(180deg, rgba(21, 70, 120, 0.84) 0%, rgba(34, 93, 154, 0.78) 100%)"
  const homeActionText = "rgba(214, 238, 255, 0.96)"
  const homeActionShadow =
    "inset 0 0 0 1px rgba(255, 255, 255, 0.12), 0 10px 28px rgba(79, 153, 223, 0.25)"

  const showHomeSideRails = windowWidth > HOME_SIDE_RAIL_BREAKPOINT_PX

  const showcaseSectionGapHalf = useMemo(() => {
    if (windowWidth < 510) return 32
    if (windowWidth <= HOME_SIDE_RAIL_BREAKPOINT_PX) return 42
    return 52
  }, [windowWidth])

  const introHorizontalPadding = useMemo(() => {
    if (windowWidth < 510) return 11
    return isMobile ? 50 : 20
  }, [windowWidth, isMobile])

  const padding = useMemo(() => {
    return `${introHorizontalPadding}px`
  }, [introHorizontalPadding])

  const scrollCueBottom = useMemo(() => {
    const baseFooterHeight = footerHeight || 70
    const lowerScreenBandOffset = Math.round(sectionHeight * 0.15)

    if (windowWidth <= HOME_SINGLE_COLUMN_BREAKPOINT_PX) {
      return Math.max(lowerScreenBandOffset, baseFooterHeight - 42, 18)
    }

    if (windowWidth <= HOME_SIDE_RAIL_BREAKPOINT_PX) {
      return Math.max(lowerScreenBandOffset, baseFooterHeight - 22, 36)
    }

    return Math.max(lowerScreenBandOffset, baseFooterHeight - 16, 44)
  }, [footerHeight, sectionHeight, windowWidth])

  const showcaseHorizontalPadding = useMemo(() => {
    if (windowWidth <= HOME_SIDE_RAIL_BREAKPOINT_PX) return introHorizontalPadding
    return 20
  }, [introHorizontalPadding, windowWidth])

  const artworkPadding = useMemo(() => {
    if (windowWidth < 510) return `${showcaseSectionGapHalf}px 11px ${showcaseSectionGapHalf}px`
    if (windowWidth <= HOME_SIDE_RAIL_BREAKPOINT_PX) {
      return `${showcaseSectionGapHalf}px ${introHorizontalPadding}px ${showcaseSectionGapHalf}px`
    }
    return isMobile
      ? `${showcaseSectionGapHalf}px 14px ${showcaseSectionGapHalf}px`
      : `${showcaseSectionGapHalf}px 20px ${showcaseSectionGapHalf}px`
  }, [introHorizontalPadding, isMobile, showcaseSectionGapHalf, windowWidth])

  const projectsPadding = useMemo(() => {
    if (windowWidth < 510) return `14px 11px ${showcaseSectionGapHalf}px`
    if (windowWidth <= HOME_SIDE_RAIL_BREAKPOINT_PX) {
      return `20px ${introHorizontalPadding}px ${showcaseSectionGapHalf}px`
    }
    return isMobile
      ? `16px 14px ${showcaseSectionGapHalf}px`
      : `20px 20px ${showcaseSectionGapHalf}px`
  }, [introHorizontalPadding, isMobile, showcaseSectionGapHalf, windowWidth])

  const contentMaxWidth = useMemo(() => {
    const desiredGuard = isMobile ? 0 : 160
    const minWidth = isMobile ? 200 : 600
    const maxWidth = isMobile ? 700 : 980
    const maxGuard = Math.max(windowWidth - minWidth, 0)
    const guard = Math.min(desiredGuard, maxGuard)
    const candidateWidth = Math.max(windowWidth - guard, 0)
    if (!showHomeSideRails) return Math.min(maxWidth, candidateWidth)

    const safeViewportWidth =
      windowWidth - HOME_SHOWCASE_RAIL_CLEARANCE_PX * 2 - introHorizontalPadding * 2

    return Math.max(Math.min(maxWidth, candidateWidth, safeViewportWidth), minWidth)
  }, [introHorizontalPadding, isMobile, showHomeSideRails, windowWidth])

  const showcaseMaxWidth = useMemo(() => {
    const desiredWidth = Math.max(Math.round(windowWidth * 0.8), 260)
    if (!showHomeSideRails) return Math.min(HOME_SHOWCASE_DESKTOP_MAX_WIDTH, desiredWidth)

    const safeViewportWidth =
      windowWidth - HOME_SHOWCASE_RAIL_CLEARANCE_PX * 2 - showcaseHorizontalPadding * 2
    return Math.max(Math.min(HOME_SHOWCASE_DESKTOP_MAX_WIDTH, desiredWidth, safeViewportWidth), 320)
  }, [showHomeSideRails, showcaseHorizontalPadding, windowWidth])

  const registerIntroContent = useCallback((node: HTMLElement | null) => {
    scrollPageContentRefs.current[0] = node
  }, [])
  const registerProjectsContent = useCallback((node: HTMLElement | null) => {
    scrollPageContentRefs.current[1] = node
  }, [])
  const registerArtworkContent = useCallback((node: HTMLElement | null) => {
    scrollPageContentRefs.current[2] = node
  }, [])

  const scrollToPage = useCallback((pageIndex: number) => {
    const parent = homeContainerRef.current?.parentElement
    const containerOffset = homeContainerRef.current?.offsetTop ?? 0
    const clampedIndex = Math.max(0, Math.min(pageIndex, HOME_SCROLL_PAGE_COUNT - 1))
    const page = scrollPageRefs.current[clampedIndex]
    if (!parent || !page) return

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    parent.scrollTo({
      top: containerOffset + page.offsetTop,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    })
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const parent = homeContainerRef.current?.parentElement
    if (!parent) return

    const updateHeight = () => {
      const containerOffset = homeContainerRef.current?.offsetTop ?? 0
      const nextHeight = Math.max(parent.clientHeight - containerOffset, 320)
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

  useLayoutEffect(() => {
    if (typeof window === "undefined") return

    let frameId = 0

    const updateFlowerLayerHeight = () => {
      frameId = 0
      const containerNode = homeContainerRef.current
      const gridNode = projectGridRef.current

      if (!containerNode || !gridNode) {
        setFlowerLayerHeight((prev) => (prev === sectionHeight ? prev : sectionHeight))
        return
      }

      const containerTop = containerNode.getBoundingClientRect().top
      const gridTop = gridNode.getBoundingClientRect().top
      const nextHeight = Math.max(Math.round(gridTop - containerTop), sectionHeight)

      setFlowerLayerHeight((prev) => (Math.abs(prev - nextHeight) <= 1 ? prev : nextHeight))
    }

    const scheduleFlowerLayerHeight = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updateFlowerLayerHeight)
    }

    updateFlowerLayerHeight()
    window.addEventListener("resize", scheduleFlowerLayerHeight)

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleFlowerLayerHeight)
    if (resizeObserver) {
      if (homeContainerRef.current) resizeObserver.observe(homeContainerRef.current)
      if (projectGridRef.current) resizeObserver.observe(projectGridRef.current)
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      window.removeEventListener("resize", scheduleFlowerLayerHeight)
    }
  }, [sectionHeight, windowHeight, windowWidth])

  // Tall-page flags depend only on content/viewport heights, which cannot
  // change from scrolling alone — resize + ResizeObservers cover every real
  // cause, so no scroll listener here (it forced layout on every frame).
  useEffect(() => {
    if (typeof window === "undefined") return
    const parent = homeContainerRef.current?.parentElement
    if (!parent) return

    let frameId = 0

    const updatePageMetrics = () => {
      frameId = 0
      const containerOffset = homeContainerRef.current?.offsetTop ?? 0
      const viewportHeight = Math.max(parent.clientHeight - containerOffset, 1)
      const nextTallFlags = Array.from({ length: HOME_SCROLL_PAGE_COUNT }, (_, index) => {
        const pageNode = scrollPageRefs.current[index]
        const contentNode = scrollPageContentRefs.current[index]
        const measuredHeight = contentNode?.scrollHeight ?? pageNode?.scrollHeight ?? 0

        return measuredHeight > viewportHeight + HOME_TALL_PAGE_THRESHOLD_PX
      })

      setTallPageFlags((prev) =>
        prev.length === nextTallFlags.length &&
        prev.every((flag, index) => flag === nextTallFlags[index])
          ? prev
          : nextTallFlags,
      )
    }

    const schedulePageMetrics = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updatePageMetrics)
    }

    updatePageMetrics()
    window.addEventListener("resize", schedulePageMetrics)

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedulePageMetrics)
    resizeObserver?.observe(parent)
    scrollPageRefs.current.forEach((page) => page && resizeObserver?.observe(page))
    scrollPageContentRefs.current.forEach((content) => content && resizeObserver?.observe(content))

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      window.removeEventListener("resize", schedulePageMetrics)
    }
  }, [sectionHeight])

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
        ["--home-preview-text" as string]: textColor,
        ["--home-preview-button-bg" as string]: currentTheme["--button-bg"],
        ["--home-preview-button-text" as string]: textColor,
        ["--home-scroll-cue-color" as string]: homeScrollCueColor,
        ["--home-action-border" as string]: homeActionBorder,
        ["--home-action-bg" as string]: homeActionBackground,
        ["--home-action-bg-hover" as string]: homeActionBackgroundHover,
        ["--home-action-text" as string]: homeActionText,
        ["--home-action-shadow" as string]: homeActionShadow,
        ["--home-section-height" as string]: `${sectionHeight}px`,
        ["--home-showcase-max-width" as string]: `${showcaseMaxWidth}px`,
      }}
    >
      <div className="home-scroll-pages">
        {phase >= 2 && !isMobile && (
          <Suspense fallback={null}>
            <HomeFlowerModel
              isSmallScreen={windowHeight <= 700}
              windowWidth={windowWidth}
              windowHeight={windowHeight}
              layerHeight={flowerLayerHeight}
            />
          </Suspense>
        )}

        <section
          ref={(node) => {
            scrollPageRefs.current[0] = node
          }}
          className={`home-scroll-page home-scroll-page--intro ${tallPageFlags[0] ? "home-scroll-page--content-tall" : ""}`}
          style={{ padding }}
        >
          <div ref={registerIntroContent} className="home-intro-click-surface">
            <HomeIntroPanel
              phase={phase}
              isMobile={isMobile}
              contentMaxWidth={contentMaxWidth}
              desktopOffset={
                showHomeSideRails && windowWidth > HOME_INTRO_DESKTOP_OFFSET_BREAKPOINT_PX ? 64 : 0
              }
              accentColor={accentColor}
            />
          </div>

          <button
            ref={scrollCueRef}
            type="button"
            className={`fade home-native-scroll-cue ${phase >= 3 ? "show" : ""}`}
            aria-label="Scroll to projects"
            disabled={phase < 3}
            onClick={() => scrollToPage(1)}
            style={{
              ["--home-scroll-side-bottom" as string]: `${scrollCueBottom}px`,
            }}
          >
            SCROLL ˋ°•*⁀➷
          </button>
        </section>

        <section
          ref={(node) => {
            scrollPageRefs.current[1] = node
          }}
          className={`home-scroll-page home-scroll-page--showcase ${tallPageFlags[1] ? "home-scroll-page--content-tall" : ""}`}
          style={{ padding: projectsPadding }}
        >
          <HomeProjectsShowcase registerContent={registerProjectsContent} gridRef={projectGridRef} />
        </section>

        <section
          ref={(node) => {
            scrollPageRefs.current[2] = node
          }}
          className={`home-scroll-page home-scroll-page--showcase ${tallPageFlags[2] ? "home-scroll-page--content-tall" : ""}`}
          style={{ padding: artworkPadding }}
        >
          <HomeArtworkShowcase registerContent={registerArtworkContent} />
        </section>
      </div>

      <Footer theme={theme} />
    </div>
  )
}

export default Home
