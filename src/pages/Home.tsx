"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import AwardsModal from "../components/AwardsModal"
import AsciiImage from "../components/AsciiImage"

interface HomeProps {
  theme: "bunny" | "water"
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
  // state + refs
  const [showAwards, setShowAwards] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerHeight <= 700)
  const [typingText, setTypingText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [isScrambleComplete, setIsScrambleComplete] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [shouldScramble, setShouldScramble] = useState(false)

  const typingRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const animationRunningRef = useRef(false)
  const resizeRaf = useRef<number | undefined>(undefined)

  // responsive handler
  const handleResize = useCallback(() => {
    if (resizeRaf.current) {
      cancelAnimationFrame(resizeRaf.current)
    }
    resizeRaf.current = requestAnimationFrame(() => {
      setIsMobile(window.innerWidth <= 768)
      setIsSmallScreen(window.innerHeight <= 700)
    })
  }, [])

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [handleResize])

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
    const typeNext = () => {
      index += 1
      setTypingText(fullText.slice(0, index))
      if (index < fullText.length) setTimeout(typeNext, 41)
      else setIsTypingComplete(true)
    }
    typeNext()
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
      html, body { margin: 0; padding: 0; overflow: hidden; }
      .home-container { overflow: auto; height: 100vh; }
      .home-container::-webkit-scrollbar { width: 8px; }
      .home-container::-webkit-scrollbar-track { background: transparent; }
      .home-container::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: ${scrollbarColor};
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
    `
  }, [theme, themes])

  // derived values
  const imageSize = useMemo(() => {
    if (isSmallScreen) return isMobile ? "120px" : "180px"
    return isMobile ? "180px" : "220px"
  }, [isSmallScreen, isMobile])

  const contentHeight = isSmallScreen ? "auto" : "100vh"
  const padding = window.innerWidth < 510 ? "11px" : isMobile ? "50px" : "20px"

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
        }}
        onClick={() => {
          if (isAnimationComplete) onScramble()
        }}
      >
        {/* content */}
        <div
          style={{
            maxWidth: 980,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
            position: "relative",
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
              fontSize: isMobile ? 11 : 13,
              lineHeight: isMobile ? 1.1 : 1.4,
              opacity: phase >= 4 && isAnimationComplete ? 1 : 0,
              transform: `translateY(${phase >= 4 && isAnimationComplete ? 0 : 20}px)`,
              transition: "opacity 0.8s ease, transform 0.8s ease",
              color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
              marginBottom: isMobile ? 20 : 40,
              padding: isMobile ? "0 10px" : 0,
            }}
          >
            <p style={{ marginBottom: isMobile ? 0 : 20 }}>
              I'm a student at the University of Pennsylvania, studying Computer Science (DMD) and Economics. I love
              exploring the intersection of design and technology to develop impactful solutions. I dabble in web and
              iOS dev, AI/ML, CG, AR/VR, HCI, and DevOps.
            </p>
            <p style={{ marginBottom: isMobile ? 0 : 20 }}>
              I'm an incoming summer analyst at Apollo Global Management. My work has been recognized by Adobe and{' '}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAwards(true)
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: theme === "bunny" ? themes.bunny["--link-color"] : themes.water["--link-color"],
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
              Say hello:{' '}
              <a
                href="mailto:ximluo@seas.upenn.edu"
                style={{
                  color: theme === "bunny" ? themes.bunny["--link-color"] : themes.water["--link-color"],
                  textDecoration: "none",
                  marginLeft: 4,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                ximluo@seas.upenn.edu
              </a>{' '}
              |{' '}
              <a
                href="https://linkedin.com/in/ximingluo/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme === "bunny" ? themes.bunny["--link-color"] : themes.water["--link-color"],
                  textDecoration: "none",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                LinkedIn
              </a>
            </p>
          </div>
        </div>

        {/* awards modal */}
        {showAwards && <AwardsModal onClose={() => setShowAwards(false)} theme={theme} />}
      </div>
    </>
  )
}

export default Home
