import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import "./App.css"
import "./components/gradientAnimation.css"
import GradientBackground from "./components/GradientBackground"
import Footer from "./components/Footer"
import AppRoutes from "./app/routes"
import { APP_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "./theme/tokens"
import { scrambleText, type ScrambleSet } from "./utils/scramble"
import useViewportSize from "./hooks/useViewportSize"
import {
  dispatchHomeFlowerTemporaryHide,
  listenHomeFlowerNavVisibility,
} from "./pages/home/home.events"

const themes = APP_THEME_TOKENS
const GA_MEASUREMENT_ID = "G-1QHSNH5G8L"

const SCRAMBLE_SETS_BY_THEME: Record<ThemeType, { top: ScrambleSet; bottom: ScrambleSet }> = {
  bunny: { top: "code", bottom: "japanese" },
  water: { top: "matrix", bottom: "symbols" },
}

const THEME_TOGGLE_ICON: Record<ThemeType, string> = {
  bunny: "☾",
  water: "☼",
}

const ThemeToggle = ({
  currentTheme,
  toggleTheme,
  isMobile,
}: {
  currentTheme: ThemeType
  toggleTheme: () => void
  isMobile: boolean
}) => {
  const buttonSize = isMobile ? 34 : 40
  const [isHovered, setIsHovered] = useState(false)
  const themeTokens = themes[currentTheme]
  const buttonBackground = isHovered ? themeTokens["--button-bg"] : themeTokens["--button-bg-light"]

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: buttonSize,
        height: buttonSize,
        borderRadius: "50%",
        background: buttonBackground,
        color: themeTokens["--color-text"],
        border: "none",
        outline: "none",
        cursor: "pointer",
        fontSize: isMobile ? 16 : 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease, background-color 0.2s ease",
        transform: isHovered ? "scale(1.1)" : "scale(1)",
      }}
    >
      {THEME_TOGGLE_ICON[currentTheme]}
    </button>
  )
}

const NavButton = ({
  label,
  isActive,
  theme,
  onClick,
  isMobile,
  isSuppressed = false,
}: {
  label: string
  isActive: boolean
  theme: ThemeType
  onClick: () => void
  isMobile: boolean
  isSuppressed?: boolean
}) => {
  const themeTokens = themes[theme]
  const visualTokens = THEME_VISUAL_TOKENS[theme]

  return (
    <button
      onClick={onClick}
      className={`app-nav-button ${isSuppressed ? "app-nav-button--suppressed" : ""}`}
      style={{
        ["--app-nav-button-padding" as string]: isMobile ? "9px 14px" : "10px 14px",
        ["--app-nav-button-font-size" as string]: `${isMobile ? 12 : 14}px`,
        ["--app-nav-button-letter-spacing" as string]: isMobile ? "0.08em" : "0.1em",
        ["--app-nav-button-bg" as string]: isActive
          ? themeTokens["--button-bg"]
          : themeTokens["--button-bg-light"],
        ["--app-nav-button-color" as string]: isActive
          ? themeTokens["--button-text"]
          : themeTokens["--color-text"],
        ["--app-nav-button-margin" as string]: isMobile ? "0 2px" : "0 5px",
        ["--app-nav-button-shadow" as string]: isActive ? visualTokens.navGlowActive : "none",
        ["--app-nav-button-shadow-hover" as string]: visualTokens.navGlowHover,
        ["--app-nav-button-opacity" as string]: isSuppressed ? "0" : "1",
        ["--app-nav-button-pointer-events" as string]: isSuppressed ? "none" : "auto",
      }}
    >
      {label}
    </button>
  )
}

function App() {
  const [theme, setTheme] = useState<ThemeType>("water")
  const location = useLocation()
  const navigate = useNavigate()
  const hasTrackedInitialPageRef = useRef(false)
  const [navSuppressed, setNavSuppressed] = useState(false)
  const { width: viewportWidth } = useViewportSize({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes("/portfolio")) return "PROJECTS"
    if (path.includes("/creative")) return "ARTWORK"
    return "HOME"
  }
  const activeTab = getActiveTab()
  const isHomeRoute = location.pathname === "/"

  const [phase, setPhase] = useState(0)

  const [roleTop, setTop] = useState("SOFTWARE ENGINEER")
  const [roleBot, setBot] = useState("DEVELOPER & DESIGNER")
  const [originalTop] = useState("SOFTWARE ENGINEER")
  const [originalBot] = useState("DEVELOPER & DESIGNER")

  const isMobile = viewportWidth <= 480
  const isTablet = viewportWidth <= 768 && viewportWidth > 480
  const safeAreaTop = isMobile ? "max(15px, env(safe-area-inset-top))" : "15px"

  useEffect(() => {
    const cur = themes[theme]
    Object.entries(cur).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v as string),
    )
    document.body.style.background = cur["--border-color"]
    document.body.style.margin = "0"
    document.body.style.overflow = "hidden"
    document.body.style.height = "100%"
    document.documentElement.style.height = "100%"
  }, [theme])

  useEffect(() => {
    setPhase(1)
    const t1 = setTimeout(() => setPhase(2), 600)
    const t2 = setTimeout(() => {
      scrambleText(originalTop, "code", setTop, 45)
      scrambleText(originalBot, "japanese", setBot, 45)
      setPhase(3)
    }, 1200)
    const t3 = setTimeout(() => setPhase(4), 2450)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [originalTop, originalBot])

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "bunny" ? "water" : "bunny"

      const { top: topSet, bottom: botSet } = SCRAMBLE_SETS_BY_THEME[newTheme]

      scrambleText(originalTop, topSet, setTop, 30).then(() => {})
      scrambleText(originalBot, botSet, setBot, 30).then(() => {})

      return newTheme
    })
  }

  const handleNavClick = (tab: string) => {
    if (tab === "HOME") dispatchHomeFlowerTemporaryHide()
    let path = "/"
    if (tab === "PROJECTS") path = "/portfolio"
    if (tab === "ARTWORK") path = "/creative"
    navigate(path)
  }

  const handleHomeScramble = () => {
    if (location.pathname === "/") {
      const { top: topSet, bottom: botSet } = SCRAMBLE_SETS_BY_THEME[theme]

      scrambleText(originalTop, topSet, setTop, 30).then(() => {})
      scrambleText(originalBot, botSet, setBot, 30).then(() => {})
    }
  }

  useEffect(() => {
    const unsubscribe = listenHomeFlowerNavVisibility((detail) => {
      setNavSuppressed(Boolean(detail.hidden))
    })
    return () => {
      unsubscribe()
      setNavSuppressed(false)
    }
  }, [])

  useEffect(() => {
    if (!hasTrackedInitialPageRef.current) {
      hasTrackedInitialPageRef.current = true
      return
    }

    if (typeof window === "undefined") return

    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
    if (typeof gtag !== "function") return

    const pagePath = `${location.pathname}${location.search}${location.hash}`

    gtag("config", GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: document.title,
      page_location: window.location.href,
    })
  }, [location.hash, location.pathname, location.search])

  return (
    <>
      <div
        className={`fade app-viewport-frame ${phase >= 1 ? "show" : ""}`}
        style={{
          ["--app-safe-top" as string]: safeAreaTop,
          ["--app-viewport-border-color" as string]: themes[theme]["--border-color"],
        }}
      >
        <div
          className="App app-shell-frame"
          style={{
            ["--app-shell-border-color" as string]: themes[theme]["--border-color"],
          }}
        >
          <GradientBackground theme={theme}>
            <div className="app-shell-column">
              <div
                className={`fade app-top-nav ${phase >= 4 ? "show" : ""}`}
                style={{
                  ["--app-nav-padding" as string]: isMobile ? "18px 0" : "20px 0",
                  ["--app-nav-gap" as string]: `${isTablet || isMobile ? 6 : 12}px`,
                  ["--app-nav-title-color" as string]: themes[theme]["--color-text"],
                  ["--app-nav-title-display" as string]: isTablet ? "none" : "block",
                }}
              >
                {!isMobile && (
                  <div className="app-top-nav-title">
                    <Link
                      to="/"
                      className="app-top-nav-home-link"
                      onClick={() => {
                        dispatchHomeFlowerTemporaryHide()
                      }}
                    >
                      XIMING LUO
                    </Link>
                  </div>
                )}

                <div className="app-top-nav-row">
                  {["HOME", "PROJECTS", "ARTWORK"].map((lbl) => (
                    <NavButton
                      key={lbl}
                      label={lbl}
                      isActive={activeTab === lbl}
                      theme={theme}
                      onClick={() => handleNavClick(lbl)}
                      isMobile={isMobile}
                      isSuppressed={navSuppressed}
                    />
                  ))}

                  {isMobile ? (
                    <ThemeToggle
                      currentTheme={theme}
                      toggleTheme={toggleTheme}
                      isMobile={isMobile}
                    />
                  ) : (
                    <div className="app-top-nav-theme-slot">
                      <ThemeToggle
                        currentTheme={theme}
                        toggleTheme={toggleTheme}
                        isMobile={isMobile}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`main-content-scroll ${isHomeRoute ? "main-content-scroll--home" : "main-content-scroll--page"}`}
              >
                <AppRoutes
                  theme={theme}
                  phase={phase}
                  roleTop={roleTop}
                  roleBot={roleBot}
                  onScramble={handleHomeScramble}
                />

                <div className={`fade app-footer-shell ${phase >= 4 ? "show" : ""}`}>
                  <Footer theme={theme} />
                </div>
              </div>
            </div>
          </GradientBackground>
        </div>
      </div>
    </>
  )
}

export default App
