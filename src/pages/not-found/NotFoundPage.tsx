import React, { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import "./NotFoundPage.css"
import { scrambleText } from "../../utils/scramble"
import { CONTENT_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../../theme/tokens"

interface NotFoundProps {
  theme: ThemeType
  backPath?: string
}

const NOT_FOUND_THEME_CONFIG = {
  bunny: {
    glitchSet: "code",
    messageSet: "symbols",
  },
  water: {
    glitchSet: "matrix",
    messageSet: "code",
  },
} as const

const NotFound: React.FC<NotFoundProps> = ({ theme, backPath = "/" }) => {
  const [fadeIn, setFadeIn] = useState<boolean>(false)
  const [glitchText, setGlitchText] = useState<string>("404")
  const [messageText, setMessageText] = useState<string>("PAGE NOT FOUND")
  const themeTokens = CONTENT_THEME_TOKENS[theme]
  const themeConfig = NOT_FOUND_THEME_CONFIG[theme]
  const visualTokens = THEME_VISUAL_TOKENS[theme]

  const scrambleEffect = useCallback((): void => {
    void scrambleText("404", themeConfig.glitchSet, setGlitchText, 30)
    setTimeout(() => {
      void scrambleText("PAGE NOT FOUND", themeConfig.messageSet, setMessageText, 25)
    }, 300)
  }, [themeConfig])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true)
      scrambleEffect()
    }, 200)
    return () => clearTimeout(timer)
  }, [scrambleEffect])

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        scrambleEffect()
      }
    }, 4000)
    return () => clearInterval(glitchInterval)
  }, [scrambleEffect])

  return (
    <div
      className={`fade not-found-page ${fadeIn ? "show" : ""}`}
      style={{
        ["--not-found-accent" as string]: themeTokens["--color-accent-primary"],
        ["--not-found-text" as string]: themeTokens["--color-text"],
        ["--not-found-code-glow" as string]: visualTokens.textGlowStrong,
        ["--not-found-button-bg" as string]: themeTokens["--button-bg"],
        ["--not-found-button-text" as string]: themeTokens["--button-text"],
        ["--not-found-button-glow" as string]: visualTokens.buttonGlow,
        ["--not-found-button-glow-hover" as string]: visualTokens.buttonGlowHover,
      }}
    >
      <div className="not-found-code">{glitchText}</div>

      <div className="not-found-message">{messageText}</div>

      <Link to={backPath} className="not-found-link">
        {backPath === "/portfolio" ? "Back to Portfolio" : "Back to Home"}
      </Link>
    </div>
  )
}

export default NotFound
