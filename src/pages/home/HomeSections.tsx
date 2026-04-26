import type React from "react"

interface HomeIntroPanelProps {
  phase: number
  isMobile: boolean
  contentMaxWidth: number
  desktopOffset: number
  accentColor: string
}

export function HomeIntroPanel({
  phase,
  isMobile,
  contentMaxWidth,
  desktopOffset,
  accentColor,
}: HomeIntroPanelProps) {
  return (
    <div
      className="content-layer home-intro-panel"
      style={{
        ["--home-intro-max-width" as string]: `${contentMaxWidth}px`,
        ["--home-intro-desktop-offset" as string]: `${desktopOffset}px`,
      }}
    >
      <div
        className={`fade home-hero ${phase >= 1 ? "show" : ""}`}
        style={{
          ["--home-hero-direction" as string]: "row",
          ["--home-hero-gap" as string]: "0px",
          ["--home-hero-margin-top" as string]: `${isMobile ? 0 : 20}px`,
          ["--home-hero-margin-bottom" as string]: `${isMobile ? 12 : 0}px`,
          ["--home-hero-copy-padding" as string]: isMobile ? "0 24px" : "0 14px",
          ["--home-hero-text-align" as string]: "left",
          ["--home-hero-title-size" as string]: `${isMobile ? 25 : 32}px`,
          ["--home-hero-title-color" as string]: accentColor,
          ["--home-hero-title-margin" as string]: isMobile ? "5px 0" : "10px 0",
        }}
      >
        <div className="home-hero-copy">
          <h1 className={`fade home-hero-title home-hero-title--stack ${phase >= 2 ? "show" : ""}`}>
            <span className="home-hero-name">Ximing Luo</span>
            <span className="home-hero-subtitle">CS and Digital Media Design @ UPenn</span>
            <span className="home-hero-subtitle">Incoming @ Apple</span>
            <span className="home-hero-emote">Make it real. 𐔌՞. .՞𐦯</span>
          </h1>
        </div>
      </div>
    </div>
  )
}
