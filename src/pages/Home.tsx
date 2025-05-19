"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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

const Home: React.FC<HomeProps> = ({ theme, phase, roleTop, roleBot, onScramble, isNavigatingFromPage = false }) => {
  // State + Refs
  const [showAwards, setShowAwards] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [isScrambleComplete, setIsScrambleComplete] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)
  const [shouldScramble, setShouldScramble] = useState(false)
  const typingRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animationRunningRef = useRef(false)

  // Responsive helper
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      setIsSmallScreen(window.innerHeight <= 700)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle typing animation or skip it when navigating from another page
  useEffect(() => {
    if (phase >= 1 && !animationRunningRef.current) {
      animationRunningRef.current = true

      // Skip typing animation if navigating from another page
      if (isNavigatingFromPage) {
        setTypingText("Hi, I'm Ximing!")
        setIsTypingComplete(true)
        return
      }

      // Run typing animation if opening directly or refreshing
      setTypingText("")
      const fullText = "Hi, I'm Ximing!"
      let currentIndex = 0

      const typeNextChar = () => {
        if (currentIndex < fullText.length) {
          setTypingText(fullText.substring(0, currentIndex + 1))
          currentIndex++
          setTimeout(typeNextChar, 41)
        } else {
          setIsTypingComplete(true)
        }
      }

      typeNextChar()
    }
  }, [phase, isNavigatingFromPage])

  // Preload profile image (start immediately when phase >= 1)
  useEffect(() => {
    if (phase >= 1 && !isImageLoaded) {
      const img = new Image()
      img.src = "/placeholder.svg?height=400&width=400"
      img.onload = () => {
        setIsImageLoaded(true)
      }

      const imgTimeout = setTimeout(() => {
        if (!isImageLoaded) {
          console.log("Image load fallback timeout triggered")
          setIsImageLoaded(true)
        }
      }, 1000)

      return () => clearTimeout(imgTimeout)
    }
  }, [phase, isImageLoaded])

  // Set scramble flag when both image is loaded and typing is complete (or skipped)
  useEffect(() => {
    if (isImageLoaded && (isTypingComplete || isNavigatingFromPage) && !shouldScramble) {
      setShouldScramble(true)
    }
  }, [isImageLoaded, isTypingComplete, isNavigatingFromPage, shouldScramble])

  //  Run scramble effect when should scramble flag is true
  useEffect(() => {
    if (shouldScramble && !isScrambleComplete) {
      onScramble()
      const done = setTimeout(() => setIsScrambleComplete(true), 500)
      return () => clearTimeout(done)
    }
  }, [shouldScramble, isScrambleComplete, onScramble])

  //  Force‑complete safety net (1.2 s)
  useEffect(() => {
    if (phase >= 1 && !isAnimationComplete) {
      const forceCompleteTimeout = setTimeout(() => {
        if (!isAnimationComplete) {
          console.log("Force completing animations after timeout")
          setIsTypingComplete(true)
          setIsScrambleComplete(true)
          setIsImageLoaded(true)
          setShouldScramble(true)
          setIsAnimationComplete(true)
        }
      }, 1200)

      return () => clearTimeout(forceCompleteTimeout)
    }
  }, [phase, isAnimationComplete])

  // Handle typing animation completion
  useEffect(() => {
    if (isTypingComplete && isScrambleComplete && isImageLoaded && typingRef.current && headingRef.current) {
      // Simply hide the typing animation and show the heading
      if (typingRef.current) {
        typingRef.current.style.opacity = "0"
      }

      setTimeout(() => {
        setIsAnimationComplete(true)
      }, 300)
    }
  }, [isTypingComplete, isScrambleComplete, isImageLoaded])

  // Theme Token
  const themes = {
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
  } as const

  const scrollbarColor = theme === "bunny" ? themes.bunny["--button-bg"] : themes.water["--button-bg"]

  const globalStyles = `
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
      background-color: ${theme === "bunny" ? themes.bunny["--color-accent-primary"] : themes.water["--color-accent-primary"]
    };
      margin-left: 2px;
      vertical-align: text-bottom;
      animation: blink 0.7s infinite;
    }
  `

  const imageSize = isSmallScreen ? (isMobile ? "120px" : "180px") : isMobile ? "180px" : "220px"
  const contentHeight = isSmallScreen ? "auto" : "100vh"

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
          padding: window.innerWidth < 510 ? "15px" : isMobile ? "50px" : "20px",
        }}
        onClick={() => {
          if (isAnimationComplete) onScramble()
        }}
      >
        <div
          ref={contentRef}
          style={{
            maxWidth: "980px",
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
          {/* Initial typing */}

          {!isAnimationComplete && !isNavigatingFromPage && (
            <div
              ref={typingRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontFamily: "monospace",
                fontSize: isMobile ? "40px" : "48px",
                fontWeight: "bold",
                color:
                  theme === "bunny" ? themes.bunny["--color-accent-primary"] : themes.water["--color-accent-primary"],
                textAlign: "center",
                zIndex: 10,
                transition: "opacity 0.3s ease",
              }}
            >
              {typingText}
              <span className="typing-cursor"></span>
            </div>
          )}

          {/* Image + Heading */}
          <div
            className={`fade ${phase >= 1 && isAnimationComplete ? "show" : ""}`}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? "15px" : "20px",
              marginTop: isMobile ? "30px" : "20px",
              marginBottom: isMobile ? "25px" : "40px",
              width: "100%",
              visibility: isAnimationComplete ? "visible" : "hidden",
            }}
          >
            {/* Profile Image with ASCII effect */}
            <div className={`fade ${phase >= 2 && isAnimationComplete ? "show" : ""}`}>
              <AsciiImage src="/images/ximing.jpg" alt="Ximing Luo" size={imageSize} theme={theme} />
            </div>

            {/* Text Content */}
            <div style={{ textAlign: isMobile ? "center" : "left" }}>
              <p
                className={`fade ${phase >= 3 && isAnimationComplete ? "show" : ""}`}
                style={{
                  fontFamily: "monospace",
                  fontSize: isMobile ? 15 : 16,
                  fontWeight: "bold",
                  color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
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
                  fontSize: isMobile ? 30 : 32,
                  fontWeight: "bold",
                  color:
                    theme === "bunny" ? themes.bunny["--color-accent-primary"] : themes.water["--color-accent-primary"],
                  margin: isMobile ? "5px 0" : "10px 0",
                }}
              >
                Hi, I'm Ximing!
              </h1>

              <p
                className={`fade ${phase >= 3 && isAnimationComplete ? "show" : ""}`}
                style={{
                  fontFamily: "monospace",
                  fontSize: isMobile ? 15 : 16,
                  fontWeight: "bold",
                  color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
                  margin: isMobile ? "5px 0" : "10px 0",
                }}
              >
                {roleBot}
              </p>
            </div>
          </div>

          {/* Bio Section */}
          <div
            className={`fade ${phase >= 4 && isAnimationComplete ? "show" : ""}`}
            style={{
              maxWidth: "700px",
              textAlign: "center",
              fontFamily: "monospace",
              fontSize: isMobile ? "11px" : "13px",
              lineHeight: 1.4,
              opacity: phase >= 4 && isAnimationComplete ? 1 : 0,
              transform: `translateY(${phase >= 4 && isAnimationComplete ? "0" : "20px"})`,
              transition: "opacity 0.8s ease, transform 0.8s ease",
              color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
              marginBottom: isMobile ? "20px" : "40px",
              padding: isMobile ? "0 10px" : "0",
            }}
          >
            <p style={{ marginBottom: isMobile ? "10px" : "20px" }}>
              I'm a student at the University of Pennsylvania, studying Computer Science (DMD) and Economics. I love
              exploring the intersection of design and technology to develop impactful solutions. I dabble in web and
              iOS dev, AI/ML, CG, AR/VR, HCI, and DevOps.
            </p>
            <p style={{ marginBottom: isMobile ? "10px" : "20px" }}>
              I'm an incoming summer analyst at Apollo Global Management. My work has been recognized by Adobe and{" "}
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
              Say hello:{" "}
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
              </a>{" "}
              |{" "}
              <a
                href="https://linkedin.com/in/"
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

        {/* Awards Modal */}
        {showAwards && <AwardsModal onClose={() => setShowAwards(false)} theme={theme} />}
      </div>
    </>
  )
}

export default Home
