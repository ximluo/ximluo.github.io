"use client"

import type React from "react"
import { lazy, Suspense, useState } from "react"
import { Github, Mail, Linkedin } from "lucide-react"
import { FOOTER_THEME_TOKENS, type ThemeType } from "../theme/tokens"
import useIsMobile from "../hooks/useIsMobile"

const BunnyModal = lazy(() => import("../features/bunny"))

interface FooterProps {
  theme: ThemeType
}

const Footer: React.FC<FooterProps> = ({ theme }) => {
  const [showBunny, setShowBunny] = useState(false)
  const isMobile = useIsMobile(768)

  // hover states
  const [bunnyHover, setBunnyHover] = useState(false)
  const [emailHover, setEmailHover] = useState(false)
  const [githubHover, setGithubHover] = useState<boolean>(false)
  const [linkedinHover, setLinkedinHover] = useState(false)
  const [madeHover, setMadeHover] = useState(false)

  const themes = FOOTER_THEME_TOKENS

  const baseTextColor = theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"]
  const accentColor =
    theme === "bunny" ? themes.bunny["--color-accent-primary"] : themes.water["--color-accent-primary"]
  const buttonBg = theme === "bunny" ? themes.bunny["--button-bg-light"] : themes.water["--button-bg-light"]
  const buttonHoverBg = theme === "bunny" ? themes.bunny["--button-bg"] : themes.water["--button-bg"]

  const bunnyGlow = theme === "bunny"
    ? "0 0 15px rgba(223, 30, 155, 0.3)"
    : "0 0 15px rgba(134, 196, 240, 0.3)"

  // Adjust icon size for mobile
  const iconSize = isMobile ? 18 : 22
  const iconFontSize = isMobile ? "14px" : "18px"
  const footerFontSize = isMobile ? "12px" : "14px"

  const iconStyle: React.CSSProperties = {
    width: isMobile ? "30px" : "36px",
    height: isMobile ? "30px" : "36px",
    borderRadius: "50%",
    backgroundColor: buttonBg,
    color: baseTextColor,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: iconFontSize,
    cursor: "pointer",
    transition: "transform .2s, background-color .2s, box-shadow .2s",
    flexShrink: 0,
  }

  const bunnyIconStyle = {
    ...iconStyle,
    boxShadow: bunnyHover ? "none" : bunnyGlow,
  }

  const isDesktopNonHomePage = !isMobile

  return (
    <footer
      style={{
        position: "relative",
        width: "100%",
        padding: isMobile ? "10px 15px" : "15px 20px",
        display: "flex",
        flexDirection: isDesktopNonHomePage ? "row" : "column",
        alignItems: "center",
        color: baseTextColor,
        fontFamily: "monospace",
        fontSize: footerFontSize,
        boxSizing: "border-box",
      }}
    >
      {/* Left: Bunny trigger (desktop) */}
      {isDesktopNonHomePage && (
        <div style={{ width: isMobile ? "100px" : "120px" }}>
          <button
            aria-label="Show Bunny"
            onClick={() => setShowBunny(true)}
            onMouseEnter={() => setBunnyHover(true)}
            onMouseLeave={() => setBunnyHover(false)}
            style={{
              ...bunnyIconStyle,
              backgroundColor: bunnyHover ? buttonHoverBg : buttonBg,
              transform: bunnyHover ? "scale(1.1)" : "scale(1)",
            }}
          >
            🐰
          </button>
        </div>
      )}

        {/* Icons */}
        <div
          style={{
            display: "flex",
            gap: isMobile ? "10px" : "15px",
            justifyContent: "center",
            width: isDesktopNonHomePage ? "auto" : "100%",
            order: isDesktopNonHomePage ? 2 : 1,
            marginBottom: isMobile ? "5px" : "10px",
          }}
        >
          {/* Only show bunny button in the icons section if not desktop */}
          {!isDesktopNonHomePage && (
            <button
              aria-label="Show Bunny"
              onClick={() => setShowBunny(true)}
              onMouseEnter={() => setBunnyHover(true)}
              onMouseLeave={() => setBunnyHover(false)}
              style={{
                ...bunnyIconStyle,
                backgroundColor: bunnyHover ? buttonHoverBg : buttonBg,
                transform: bunnyHover ? "scale(1.1)" : "scale(1)",
              }}
            >
              🐰
            </button>
          )}

          {/* GitHub Icon */}
          <a
            href="https://github.com/ximluo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            onMouseEnter={() => setGithubHover(true)}
            onMouseLeave={() => setGithubHover(false)}
            style={{
              ...iconStyle,
              backgroundColor: githubHover ? buttonHoverBg : buttonBg,
              transform: githubHover ? "scale(1.1)" : "scale(1)",
              textDecoration: "none",
            }}
          >
            <Github size={iconSize} />
          </a>

          {/* Email Icon */}
          <a
            href="mailto:ximluo@seas.upenn.edu"
            aria-label="Email"
            onMouseEnter={() => setEmailHover(true)}
            onMouseLeave={() => setEmailHover(false)}
            style={{
              ...iconStyle,
              backgroundColor: emailHover ? buttonHoverBg : buttonBg,
              transform: emailHover ? "scale(1.1)" : "scale(1)",
              textDecoration: "none",
            }}
          >
            <Mail size={iconSize} />
          </a>

          {/* LinkedIn Icon */}
          <a
            href="https://www.linkedin.com/in/ximingluo/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            onMouseEnter={() => setLinkedinHover(true)}
            onMouseLeave={() => setLinkedinHover(false)}
            style={{
              ...iconStyle,
              backgroundColor: linkedinHover ? buttonHoverBg : buttonBg,
              transform: linkedinHover ? "scale(1.1)" : "scale(1)",
              textDecoration: "none",
            }}
          >
            <Linkedin size={iconSize} />
          </a>
        </div>

        {/* Copyright */}
        <div
          style={{
            textAlign: "center",
            flexGrow: isDesktopNonHomePage ? 1 : 0,
            order: isDesktopNonHomePage ? 1 : 2,
          }}
        >
          © 2025 Ximing Luo •{" "}
          <a
            href="https://github.com/ximluo/ximluo.github.io"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setMadeHover(true)}
            onMouseLeave={() => setMadeHover(false)}
            style={{
              color: accentColor,
              textDecoration: "none",
              textShadow: madeHover ? `0 0 8px ${accentColor}` : "none",
              transition: "text-shadow .2s ease-in-out",
            }}
          >
            Made with ♥
          </a>
        </div>

      {showBunny && (
        <Suspense fallback={null}>
          <BunnyModal onClose={() => setShowBunny(false)} theme={theme} />
        </Suspense>
      )}
    </footer>
  )
}

export default Footer
