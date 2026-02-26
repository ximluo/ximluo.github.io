import type React from "react"
import AsciiImage from "../../components/AsciiImage"
import type { ThemeType } from "../../theme/tokens"

export interface BubblePalette {
  base: string
  hover: string
  border: string
  text: string
  glow: string
}

interface HomeDesktopEstRailProps {
  estTime: string
  phase: number
  isAnimationComplete: boolean
  textColor: string
}

export function HomeDesktopEstRail({
  estTime,
  phase,
  isAnimationComplete,
  textColor,
}: HomeDesktopEstRailProps) {
  return (
    <div
      className={`home-est-rail fade ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
      aria-hidden={!isAnimationComplete}
      style={{ ["--home-est-rail-color" as string]: textColor }}
    >
      est • {estTime}
    </div>
  )
}

interface HomeNavigationBubblesProps {
  isFlowerRevealed: boolean
  isMobile: boolean
  navButtonsEnabled: boolean
  bubblePalette: BubblePalette
  onOpenPortfolio: () => void
  onOpenCreative: () => void
  onOpenAwards: () => void
}

export function HomeNavigationBubbles({
  isFlowerRevealed,
  isMobile,
  navButtonsEnabled,
  bubblePalette,
  onOpenPortfolio,
  onOpenCreative,
  onOpenAwards,
}: HomeNavigationBubblesProps) {
  const items = [
    { label: "Projects", onClick: onOpenPortfolio },
    { label: "Artwork", onClick: onOpenCreative },
    { label: "Awards", onClick: onOpenAwards },
  ]

  return (
    <div
      className="home-nav-overlay"
      aria-hidden={!isFlowerRevealed}
      style={{
        ["--home-nav-overlay-opacity" as string]: isFlowerRevealed ? "1" : "0",
      }}
    >
      <div
        className="home-nav-bubbles"
        style={{
          ["--home-nav-direction" as string]: isMobile ? "column" : "row",
          ["--home-nav-gap" as string]: `${isMobile ? 16 : 24}px`,
          ["--home-nav-offset" as string]: isMobile ? "-21vh" : "-24vh",
          ["--home-nav-pointer-events" as string]: isFlowerRevealed ? "auto" : "none",
        }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            disabled={!navButtonsEnabled}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              if (!navButtonsEnabled) return
              item.onClick()
            }}
            className="home-nav-bubble"
            style={{
              ["--home-bubble-bg" as string]: bubblePalette.base,
              ["--home-bubble-hover-bg" as string]: bubblePalette.hover,
              ["--home-bubble-border" as string]: bubblePalette.border,
              ["--home-bubble-text" as string]: bubblePalette.text,
              ["--home-bubble-glow" as string]: bubblePalette.glow,
              ["--home-bubble-shadow" as string]: `0 12px 30px ${bubblePalette.glow}`,
              ["--home-bubble-shadow-hover" as string]: `0 18px 45px ${bubblePalette.glow}`,
              ["--home-bubble-padding" as string]: isMobile ? "14px 42px" : "18px 60px",
              ["--home-bubble-width" as string]: isMobile ? "min(260px, 85vw)" : "auto",
              ["--home-bubble-font-size" as string]: `${isMobile ? 14 : 16}px`,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface HomeIntroPanelProps {
  theme: ThemeType
  phase: number
  roleTop: string
  roleBot: string
  typingText: string
  typingRef: React.RefObject<HTMLDivElement | null>
  isMobile: boolean
  imageSize: string
  contentMaxWidth: number
  isFlowerRevealed: boolean
  isAnimationComplete: boolean
  isNavigatingFromPage: boolean
  textColor: string
  accentColor: string
  linkColor: string
  onOpenAwards: () => void
}

export function HomeIntroPanel({
  theme,
  phase,
  roleTop,
  roleBot,
  typingText,
  typingRef,
  isMobile,
  imageSize,
  contentMaxWidth,
  isFlowerRevealed,
  isAnimationComplete,
  isNavigatingFromPage,
  textColor,
  accentColor,
  linkColor,
  onOpenAwards,
}: HomeIntroPanelProps) {
  return (
    <div
      className="content-layer home-intro-panel"
      style={{
        ["--home-intro-max-width" as string]: `${contentMaxWidth}px`,
        ["--home-intro-panel-opacity" as string]: isFlowerRevealed ? "0" : "1",
        ["--home-intro-panel-visibility" as string]: isFlowerRevealed ? "hidden" : "visible",
      }}
    >
      {!isAnimationComplete && !isNavigatingFromPage && (
        <div
          className="home-typing-intro"
          ref={typingRef}
          style={{
            ["--home-typing-font-size" as string]: `${isMobile ? 40 : 48}px`,
            ["--home-typing-color" as string]: accentColor,
          }}
        >
          {typingText}
          <span className="typing-cursor" />
        </div>
      )}

      <div
        className={`fade home-hero ${phase >= 1 && isAnimationComplete ? "show" : ""}`}
        style={{
          ["--home-hero-direction" as string]: isMobile ? "column" : "row",
          ["--home-hero-gap" as string]: `${isMobile ? 5 : 20}px`,
          ["--home-hero-margin-top" as string]: `${isMobile ? 30 : 20}px`,
          ["--home-hero-margin-bottom" as string]: `${isMobile ? 12 : 0}px`,
          ["--home-hero-text-align" as string]: isMobile ? "center" : "left",
          ["--home-hero-line-color" as string]: textColor,
          ["--home-hero-line-top-size" as string]: `${isMobile ? 14 : 16}px`,
          ["--home-hero-line-top-margin" as string]: isMobile ? "5px 0" : "10px 0",
          ["--home-hero-line-bottom-size" as string]: `${isMobile ? 13.5 : 16}px`,
          ["--home-hero-line-bottom-margin" as string]: isMobile ? "0px 0" : "10px 0",
          ["--home-hero-title-size" as string]: `${isMobile ? 25 : 32}px`,
          ["--home-hero-title-color" as string]: accentColor,
          ["--home-hero-title-margin" as string]: isMobile ? "5px 0" : "10px 0",
          visibility: isAnimationComplete ? "visible" : "hidden",
        }}
      >
        <div className={`fade ${phase >= 2 && isAnimationComplete ? "show" : ""}`}>
          <AsciiImage src="/images/ximing.jpg" alt="Ximing Luo" size={imageSize} theme={theme} />
        </div>

        <div className="home-hero-copy">
          <p
            className={`fade home-hero-line home-hero-line--top ${phase >= 3 && isAnimationComplete ? "show" : ""}`}
          >
            {roleTop}
          </p>

          <h1 className={`fade home-hero-title ${phase >= 2 && isAnimationComplete ? "show" : ""}`}>
            Hi, I&apos;m Ximing!
          </h1>

          <p
            className={`fade home-hero-line home-hero-line--bottom ${phase >= 3 && isAnimationComplete ? "show" : ""}`}
          >
            {roleBot}
          </p>
        </div>
      </div>

      <div
        className={`fade home-bio ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
        style={{
          ["--home-bio-font-size" as string]: `${isMobile ? 12 : 14}px`,
          ["--home-bio-line-height" as string]: `${isMobile ? 1.1 : 1.4}`,
          ["--home-bio-color" as string]: textColor,
          ["--home-bio-padding" as string]: isMobile ? "2px 10px" : "14px",
          ["--home-bio-paragraph-margin" as string]: isMobile ? "10px" : "20px",
          ["--home-link-color" as string]: linkColor,
        }}
      >
        <p className="home-bio-paragraph home-bio-paragraph--spaced">
          I&apos;m a student at the University of Pennsylvania, studying Computer Science (
          <a
            className="home-link"
            href="http://cg.cis.upenn.edu/dmd.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Digital Media Design
          </a>
          ) and Economics.
        </p>
        <p className="home-bio-paragraph home-bio-paragraph--spaced">
          I am interested in computer graphics, AI/ML, and fullstack. Previously, I did software at{" "}
          <a
            className="home-link"
            href="https://www.apollo.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Apollo Global Management
          </a>{" "}
          and I currently teach iOS Programming{" "}
          <a
            className="home-link"
            href="https://www.seas.upenn.edu/~cis1951/"
            target="_blank"
            rel="noopener noreferrer"
          >
            (CIS 1951)
          </a>
          . My work has been recognized by Adobe and{" "}
          <button
            className="home-inline-link-button"
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onOpenAwards()
            }}
          >
            other awards
          </button>
          . Feel free to explore!
        </p>
        <p className="home-bio-paragraph">
          Say hello:{" "}
          <a
            className="home-email-link"
            href="mailto:ximluo@upenn.edu"
            onClick={(event) => event.stopPropagation()}
          >
            ximluo@upenn.edu
          </a>
        </p>
      </div>
    </div>
  )
}

interface HomeScrollCuesProps {
  phase: number
  isAnimationComplete: boolean
  isFlowerRevealed: boolean
  isMobile: boolean
  footerHeight: number
  scrollCueBottom: number
  scrollCueOpacity: number
  accentColor: string
  scrollIndicatorColor: string
}

export function HomeScrollCues({
  phase,
  isAnimationComplete,
  isFlowerRevealed,
  isMobile,
  footerHeight,
  scrollCueBottom,
  scrollCueOpacity,
  accentColor,
  scrollIndicatorColor,
}: HomeScrollCuesProps) {
  return (
    <>
      {!isFlowerRevealed && !isMobile && (
        <div
          className={`fade home-scroll-side-cue ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
          aria-hidden
          style={{
            ["--home-scroll-side-bottom" as string]: `${(footerHeight || 70) + 20}px`,
            ["--home-scroll-indicator-color" as string]: scrollIndicatorColor,
          }}
        >
          <div className="home-scroll-indicator">
            <div className="home-scroll-dots" />
          </div>
        </div>
      )}

      <div
        className={`fade home-scroll-center-cue ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
        aria-hidden={!isAnimationComplete}
        style={{
          ["--home-scroll-center-bottom" as string]: `${scrollCueBottom}px`,
          ["--home-scroll-cue-opacity" as string]: `${scrollCueOpacity}`,
          ["--home-scroll-center-color" as string]: accentColor,
          ["--home-scroll-center-text-padding" as string]: isMobile ? "0 12px" : "0",
          ["--home-scroll-center-text-margin-bottom" as string]: isMobile ? "30px" : "8px",
        }}
      >
        <div className="home-scroll-center-fade">
          <div className="home-center-scroll">
            <span className="home-center-scroll-text">Scroll</span>
            {!isMobile && <span className="home-center-scroll-line" />}
          </div>
        </div>
      </div>
    </>
  )
}
