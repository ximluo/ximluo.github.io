import type React from "react"
import { trackExternalLinkClick } from "../../utils/analytics"

export interface BubblePalette {
  base: string
  hover: string
  border: string
  text: string
  glow: string
}

interface HomeDesktopScrollProgressProps {
  activePageIndex: number
  pageCount: number
  phase: number
  isAnimationComplete: boolean
  textColor: string
  alignment: "left" | "right"
  onSelectPage: (pageIndex: number) => void
}

export function HomeDesktopScrollProgress({
  activePageIndex,
  pageCount,
  phase,
  isAnimationComplete,
  textColor,
  alignment,
  onSelectPage,
}: HomeDesktopScrollProgressProps) {
  const isReady = phase >= 3 && isAnimationComplete

  return (
    <div
      className={`home-scroll-progress home-scroll-progress--${alignment} fade ${isReady ? "show" : ""}`}
      aria-label="Home section navigation"
      role="navigation"
      style={{ ["--home-scroll-progress-color" as string]: textColor }}
    >
      {Array.from({ length: pageCount }, (_, index) => {
        const isActive = index === activePageIndex

        return (
          <button
            key={index}
            type="button"
            className={`home-scroll-progress-dot ${isActive ? "is-active" : ""}`}
            aria-label={`Scroll to section ${index + 1}`}
            aria-current={isActive ? "page" : undefined}
            disabled={!isReady}
            onClick={() => onSelectPage(index)}
          />
        )
      })}
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
    { label: isMobile ? "Art" : "Artwork", onClick: onOpenCreative },
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
  phase: number
  typingText: string
  typingRef: React.RefObject<HTMLDivElement | null>
  isMobile: boolean
  contentMaxWidth: number
  desktopOffset: number
  isFlowerRevealed: boolean
  isAnimationComplete: boolean
  isNavigatingFromPage: boolean
  textColor: string
  accentColor: string
  linkColor: string
  onOpenAwards: () => void
  bioRef?: React.Ref<HTMLDivElement>
}

export function HomeIntroPanel({
  phase,
  typingText,
  typingRef,
  isMobile,
  contentMaxWidth,
  desktopOffset,
  isFlowerRevealed,
  isAnimationComplete,
  isNavigatingFromPage,
  textColor,
  accentColor,
  linkColor,
  onOpenAwards,
  bioRef,
}: HomeIntroPanelProps) {
  return (
    <div
      className="content-layer home-intro-panel"
      style={{
        ["--home-intro-max-width" as string]: `${contentMaxWidth}px`,
        ["--home-intro-desktop-offset" as string]: `${desktopOffset}px`,
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
          ["--home-hero-direction" as string]: "row",
          ["--home-hero-gap" as string]: "0px",
          ["--home-hero-margin-top" as string]: `${isMobile ? 0 : 20}px`,
          ["--home-hero-margin-bottom" as string]: `${isMobile ? 12 : 0}px`,
          ["--home-hero-copy-padding" as string]: isMobile ? "0 24px" : "0 14px",
          ["--home-hero-text-align" as string]: "left",
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
        <div className="home-hero-copy">
          <h1 className={`fade home-hero-title ${phase >= 2 && isAnimationComplete ? "show" : ""}`}>
            Hi, I&apos;m Ximing!
          </h1>
        </div>
      </div>

      <div
        ref={bioRef}
        className={`fade home-bio ${phase >= 2 && isAnimationComplete ? "show" : ""}`}
        style={{
          ["--home-bio-font-size" as string]: isMobile ? "13.5px" : "16px",
          ["--home-bio-line-height" as string]: "1.5",
          ["--home-bio-color" as string]: textColor,
          ["--home-bio-padding" as string]: isMobile ? "2px 24px" : "14px",
          ["--home-bio-list-gap" as string]: isMobile ? "0px" : "0px",
          ["--home-bio-section-gap" as string]: isMobile ? "25px" : "40px",
          ["--home-link-color" as string]: linkColor,
        }}
      >
        <p className="home-bio-paragraph home-bio-paragraph--spaced">
          Currently @ UPenn | Computer Science (
          <a
            className="home-link"
            href="http://cg.cis.upenn.edu/dmd.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Digital Media Design
          </a>
          ) & Economics
        </p>
        <div className="home-bio-list" aria-label="Highlights">
          <div className="home-bio-line">
            <span className="home-bio-line-bullet">✿</span>
            <span className="home-bio-line-copy">
              Instuctor for iOS Programming{" "}
              <a
                className="home-link"
                href="https://www.seas.upenn.edu/~cis1951/"
                target="_blank"
                rel="noopener noreferrer"
              >
                (CIS 1951)
              </a>{" "}
              @ Penn
            </span>
          </div>

          <div className="home-bio-line">
            <span className="home-bio-line-bullet">✿</span>
            <span className="home-bio-line-copy">
              Previous software engineer @{" "}
              <a
                className="home-link"
                href="https://www.apollo.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apollo Global Management
              </a>
            </span>
          </div>

          <div className="home-bio-line">
            <span className="home-bio-line-bullet">✿</span>
            <span className="home-bio-line-copy">
              Work recognized by{" "}
              <a
                className="home-link"
                href="https://www.adobe.com/creativecloud/buy/students.html?"
                target="_blank"
                rel="noopener noreferrer"
              >
                Adobe
              </a>{" "}
              and{" "}
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
            </span>
          </div>
        </div>
        <p className="home-bio-paragraph home-bio-paragraph--after-list">
          Also: President of{" "}
          <a
            className="home-link"
            href="https://wics.cis.upenn.edu"
            target="_blank"
            rel="noopener noreferrer"
          >
            Women in Computer Science
          </a>
          ,{" "}
          <a
            className="home-link"
            href="https://pennlabs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Penn Labs
          </a>{" "}
          &{" "}
          <a
            className="home-link"
            href="https://pennspark.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Penn Spark
          </a>
          {" "}developer,{" "}
          <a
            className="home-link"
            href="https://www.femmehacks.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            FemmeHacks
          </a>
          {" "}Director,{" "}
          <a
            className="home-link"
            href="https://snfpaideia.upenn.edu/fellowships/fellowship-information/"
            target="_blank"
            rel="noopener noreferrer"
          >
            SNF Paideia Fellow
          </a>
          , Prev TA of{" "}
          <a
            className="home-link"
            href="https://cis4120.seas.upenn.edu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CIS 5120
          </a>{" "}
          HCI &{" "}
          <a
            className="home-link"
            href="https://www.cis.upenn.edu/~cis4600/current/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CIS 5600
          </a>{" "}
          computer graphics
        </p>
        <p className="home-bio-paragraph">
          Say hello:{" "}
          <a
            className="home-email-link"
            href="mailto:ximluo@upenn.edu"
            onClick={(event) => {
              event.stopPropagation()
              trackExternalLinkClick({
                linkId: "email",
                href: "mailto:ximluo@upenn.edu",
                uiRegion: "home_bio",
              })
            }}
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
          className={`fade home-scroll-side-cue ${phase >= 3 && isAnimationComplete ? "show" : ""}`}
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
        className={`fade home-scroll-center-cue ${phase >= 3 && isAnimationComplete ? "show" : ""}`}
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
