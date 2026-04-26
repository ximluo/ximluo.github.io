import type React from "react"
import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import AwardsModal from "../../components/AwardsModal"
import Footer from "../../components/Footer"
import useViewportSize from "../../hooks/useViewportSize"
import {
  CONTENT_THEME_TOKENS,
  HOME_THEME_TOKENS,
  THEME_VISUAL_TOKENS,
  type ThemeType,
} from "../../theme/tokens"
import { trackExternalLinkClick } from "../../utils/analytics"
import FlowerScene from "./FlowerScene"
import "./About.css"

interface AboutProps {
  theme: ThemeType
}

const About: React.FC<AboutProps> = ({ theme }) => {
  const [showAwards, setShowAwards] = useState(false)
  const [isFlowerSceneReady, setIsFlowerSceneReady] = useState(false)
  const { width: windowWidth, height: windowHeight } = useViewportSize({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 760,
  })
  const colors = CONTENT_THEME_TOKENS[theme]
  const homeColors = HOME_THEME_TOKENS[theme]
  const surface = THEME_VISUAL_TOKENS[theme].surfaceProjectOverview
  const measuredWindowWidth = windowWidth || 1024
  const measuredWindowHeight = windowHeight || 760
  const isMobile = measuredWindowWidth <= 768
  const isSmallScreen = measuredWindowHeight <= 700
  const flowerCanvasDpr: [number, number] = isMobile ? [1, 1.25] : [1, 1.35]

  return (
    <div
      className="about-container"
      style={{
        ["--about-text" as string]: colors["--color-text"],
        ["--about-link" as string]: homeColors["--link-color"],
        ["--about-border" as string]: colors["--border-color"],
        ["--about-surface" as string]: surface,
        ["--about-button-border" as string]: colors["--button-bg-light"],
        ["--about-button-bg" as string]: colors["--button-bg"],
        ["--about-button-text" as string]: colors["--button-text"],
      }}
    >
      <main className="about-shell">
        <h1 className="about-title">About</h1>

        <div className="about-content">
          <div className="about-flower-panel" aria-hidden>
            <div className="about-flower-stage" style={{ opacity: isFlowerSceneReady ? 1 : 0.16 }}>
              <Canvas
                className="about-flower-canvas"
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
                    layout={{
                      isMobile,
                      isSmallScreen,
                      windowWidth: measuredWindowWidth,
                      focusScale: isMobile ? 1.02 : 0.88,
                    }}
                    onSceneReady={() => setIsFlowerSceneReady(true)}
                  />
                </Suspense>
              </Canvas>
            </div>
          </div>

          <section className="about-bio" aria-label="About Ximing Luo">
            <p className="about-paragraph about-paragraph--spaced">
              Currently @ UPenn | Computer Science (
              <a
                className="about-link"
                href="http://cg.cis.upenn.edu/dmd.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Digital Media Design
              </a>
              ) & Economics
            </p>

            <div className="about-list" aria-label="Highlights">
              <div className="about-line">
                <span className="about-line-bullet">✿</span>
                <span className="about-line-copy">
                  Instructor for iOS Programming{" "}
                  <a
                    className="about-link"
                    href="https://www.seas.upenn.edu/~cis1951/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (CIS 1951)
                  </a>{" "}
                  @ Penn
                </span>
              </div>

              <div className="about-line">
                <span className="about-line-bullet">✿</span>
                <span className="about-line-copy">
                  Previous software engineer @{" "}
                  <a
                    className="about-link"
                    href="https://www.apollo.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apollo Global Management
                  </a>
                </span>
              </div>

              <div className="about-line">
                <span className="about-line-bullet">✿</span>
                <span className="about-line-copy">
                  Work recognized by{" "}
                  <a
                    className="about-link"
                    href="https://www.adobe.com/creativecloud/buy/students.html?"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Adobe
                  </a>{" "}
                  and{" "}
                  <button
                    className="about-inline-link-button"
                    type="button"
                    onClick={() => setShowAwards(true)}
                  >
                    other awards
                  </button>
                </span>
              </div>
            </div>

            <p className="about-paragraph about-paragraph--secondary">
              Also: President of{" "}
              <a
                className="about-link"
                href="https://wics.cis.upenn.edu"
                target="_blank"
                rel="noopener noreferrer"
              >
                Women in Computer Science
              </a>
              ,{" "}
              <a
                className="about-link"
                href="https://pennlabs.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Penn Labs
              </a>{" "}
              &{" "}
              <a
                className="about-link"
                href="https://pennspark.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Penn Spark
              </a>{" "}
              developer,{" "}
              <a
                className="about-link"
                href="https://www.femmehacks.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                FemmeHacks
              </a>{" "}
              Director,{" "}
              <a
                className="about-link"
                href="https://snfpaideia.upenn.edu/fellowships/fellowship-information/"
                target="_blank"
                rel="noopener noreferrer"
              >
                SNF Paideia Fellow
              </a>
              , Prev TA of{" "}
              <a
                className="about-link"
                href="https://cis4120.seas.upenn.edu/"
                target="_blank"
                rel="noopener noreferrer"
              >
                CIS 5120
              </a>{" "}
              HCI &{" "}
              <a
                className="about-link"
                href="https://www.cis.upenn.edu/~cis4600/current/"
                target="_blank"
                rel="noopener noreferrer"
              >
                CIS 5600
              </a>{" "}
              computer graphics
            </p>

            <p className="about-paragraph">
              Say hello:{" "}
              <a
                className="about-email-link"
                href="mailto:ximluo@upenn.edu"
                onClick={() => {
                  trackExternalLinkClick({
                    linkId: "email",
                    href: "mailto:ximluo@upenn.edu",
                    uiRegion: "about_bio",
                  })
                }}
              >
                ximluo@upenn.edu
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer theme={theme} />

      {showAwards && <AwardsModal onClose={() => setShowAwards(false)} theme={theme} />}
    </div>
  )
}

export default About
