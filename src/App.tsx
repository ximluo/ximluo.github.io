"use client"

import { useEffect, useState, useRef } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import "./App.css"
import "./components/gradientAnimation.css"
import GradientBackground from "./components/GradientBackground"
import Footer from "./components/Footer"
import AppRoutes from "./app/routes"
import { APP_THEME_TOKENS, type ThemeType } from "./theme/tokens"
import { scrambleText } from "./utils/scramble"

const themes = APP_THEME_TOKENS

const ThemeToggle = ({
  currentTheme,
  toggleTheme,
  isMobile,
}: { currentTheme: ThemeType; toggleTheme: () => void; isMobile: boolean }) => {
  const moonIcon = "☾"
  const sunIcon = "☼"
  const buttonSize = isMobile ? 34 : 40
  const [isHovered, setIsHovered] = useState(false)

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: buttonSize,
        height: buttonSize,
        borderRadius: "50%",
        background: isHovered
          ? currentTheme === "bunny" ? themes.bunny["--button-bg"] : themes.water["--button-bg"]
          : currentTheme === "bunny" ? themes.bunny["--button-bg-light"] : themes.water["--button-bg-light"],
        color: currentTheme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
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
      {currentTheme === "bunny" ? moonIcon : sunIcon}
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
}) => (
  <button
    onClick={onClick}
    style={{
      padding: isMobile ? "9px 14px" : "10px 14px",
      fontFamily: "monospace",
      fontSize: isMobile ? 12 : 14,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: isMobile ? "0.08em" : "0.1em",
      backgroundColor: isActive
        ? theme === "bunny"
          ? themes.bunny["--button-bg"]
          : themes.water["--button-bg"]
        : theme === "bunny"
          ? themes.bunny["--button-bg-light"]
          : themes.water["--button-bg-light"],
      color: isActive
        ? theme === "bunny"
          ? themes.bunny["--button-text"]
          : themes.water["--button-text"]
        : theme === "bunny"
          ? themes.bunny["--color-text"]
          : themes.water["--color-text"],
      border: "none",
      outline: "none",
      borderRadius: 20,
      cursor: "pointer",
      margin: isMobile ? "0 2px" : "0 5px",
      transition: "all 0.2s ease, opacity 0.3s ease",
      boxShadow: isActive
        ? theme === "bunny"
          ? "0 0 15px rgba(223, 30, 155, 0.4)"
          : "0 0 15px rgba(134, 196, 240, 0.4)"
        : "none",
      opacity: isSuppressed ? 0 : 1,
      pointerEvents: isSuppressed ? "none" : "auto",
    }}
    onMouseEnter={(e) => {
      if (isSuppressed) return
      e.currentTarget.style.transform = "scale(1.05)"
      e.currentTarget.style.boxShadow = theme === "bunny"
        ? "0 0 20px rgba(223, 30, 155, 0.6)"
        : "0 0 20px rgba(134, 196, 240, 0.6)"
    }}
    onMouseLeave={(e) => {
      if (isSuppressed) return
      e.currentTarget.style.transform = "scale(1)"
      e.currentTarget.style.boxShadow = isActive
        ? theme === "bunny"
          ? "0 0 15px rgba(223, 30, 155, 0.4)"
          : "0 0 15px rgba(134, 196, 240, 0.4)"
        : "none"
    }}
  >
    {label}
  </button>
)

// Minimal fade-in CSS

function App() {
  // theme + nav 
  const [theme, setTheme] = useState<ThemeType>("water")
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef<HTMLDivElement>(null)
  const [navSuppressed, setNavSuppressed] = useState(false)

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes("/portfolio")) return "PROJECTS"
    if (path.includes("/creative")) return "ARTWORK"
    return "HOME"
  }
  const activeTab = getActiveTab()
  const isHomeRoute = location.pathname === "/"

  // phased reveal: 0-4 
  const [phase, setPhase] = useState(0)

  // dynamic role text 
  const [roleTop, setTop] = useState("SOFTWARE ENGINEER")
  const [roleBot, setBot] = useState("DEVELOPER & DESIGNER")
  const [originalTop] = useState("SOFTWARE ENGINEER")
  const [originalBot] = useState("DEVELOPER & DESIGNER")

  // track if device is mobile
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // track safe area top and bottom 
  const [safeAreaTop, setSafeAreaTop] = useState("15px")

  // check device type and safe area 
  useEffect(() => {
    const checkDeviceAndSafeArea = () => {
      // Only mobile devices (not tablets) should have different nav behavior
      const mobile = window.innerWidth <= 480
      const tablet = window.innerWidth <= 768 && window.innerWidth > 480
      setIsMobile(mobile)
      setIsTablet(tablet)

      // Check for safe area insets
      if (mobile) {
        // Use safe area inset for mobile devices
        setSafeAreaTop("max(15px, env(safe-area-inset-top))")
      } else {
        // Standard padding for desktop
        setSafeAreaTop("15px")
      }
    }

    checkDeviceAndSafeArea()
    window.addEventListener("resize", checkDeviceAndSafeArea)

    return () => window.removeEventListener("resize", checkDeviceAndSafeArea)
  }, [])

  // theme side‑effects 
  useEffect(() => {
    const cur = themes[theme]
    Object.entries(cur).forEach(([k, v]) => document.documentElement.style.setProperty(k, v as string))
    // outer bg tint = border color 
    document.body.style.background = cur["--border-color"]
    document.body.style.margin = "0"
    document.body.style.overflow = "hidden"
    document.body.style.height = "100%"
    document.documentElement.style.height = "100%"
  }, [theme])

  // drive the timeline on mount 
  useEffect(() => {
    setPhase(1) // container
    const t1 = setTimeout(() => setPhase(2), 600) // greeting
    const t2 = setTimeout(() => {
      // scramble roles
      scrambleText(originalTop, "code", setTop, 45)
      scrambleText(originalBot, "japanese", setBot, 45)
      setPhase(3)
    }, 1200)
    const t3 = setTimeout(() => setPhase(4), 2450) // nav + image + footer
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [originalTop, originalBot])

  // toggle with scramble effect 
  const toggleTheme = () => {
    // Toggle the theme
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "bunny" ? "water" : "bunny"

      // Create a scramble effect based on the new theme
      const topSet = newTheme === "bunny" ? "code" : "matrix"
      const botSet = newTheme === "bunny" ? "japanese" : "symbols"

      // Apply scramble effect to role texts
      scrambleText(originalTop, topSet, setTop, 30).then(() => { })
      scrambleText(originalBot, botSet, setBot, 30).then(() => { })

      return newTheme
    })
  }

  // Handle navigation
  const handleNavClick = (tab: string) => {
    if (tab === "HOME" && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("home-flower-temporary-hide"))
    }
    let path = "/"
    if (tab === "PROJECTS") path = "/portfolio"
    if (tab === "ARTWORK") path = "/creative"
    navigate(path)
  }

  // Handle home click scramble
  const handleHomeScramble = () => {
    if (location.pathname === "/") {
      const topSet = theme === "bunny" ? "code" : "matrix"
      const botSet = theme === "bunny" ? "japanese" : "symbols"

      scrambleText(originalTop, topSet, setTop, 30).then(() => { })
      scrambleText(originalBot, botSet, setBot, 30).then(() => { })
    }
  }

  // Listen for home flower overlay toggling navigation buttons
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ hidden: boolean }>).detail
      setNavSuppressed(Boolean(detail?.hidden))
    }
    window.addEventListener("home-flower-nav-visibility", handler as EventListener)
    return () => {
      window.removeEventListener("home-flower-nav-visibility", handler as EventListener)
      setNavSuppressed(false)
    }
  }, [])

  return (
    <>
      <div
        className={`fade ${phase >= 1 ? "show" : ""}`}
        style={{
          width: "100vw",
          height: "100dvh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: safeAreaTop,
          paddingBottom: "15px",
          paddingLeft: "15px",
          paddingRight: "15px",
          boxSizing: "border-box",
        }}
      >
        <div
          className="App"
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <GradientBackground theme={theme}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
              }}
            >
              {/* NAV BAR */}
              <div
                ref={navRef}
                className={`fade ${phase >= 4 ? "show" : ""}`}
                style={{
                  width: "100%",
                  padding: isMobile ? "18px 0" : "20px 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  flexShrink: 0,
                  zIndex: 60,
                }}
              >
                {/* desktop/tablet: name on the left */}
                {!isMobile && (
                  <div
                    style={{
                      position: "absolute",
                      left: 28,
                      fontFamily: "monospace",
                      fontSize: 16,
                      fontWeight: "bold",
                      color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
                      display: isTablet ? "none" : "block",
                    }}
                  >
                    <Link
                      to="/"
                      style={{ color: "inherit", textDecoration: "none" }}
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("home-flower-temporary-hide"))
                        }
                      }}
                    >
                      XIMING LUO
                    </Link>
                  </div>
                )}

                {/* main row */}
                <div
                  style={{
                    display: "flex",
                    gap: isTablet || isMobile ? 6 : 12,
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
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

                  {/* mobile: theme toggle in the same row; desktop/tablet: far right */}
                  {isMobile ? (
                    <ThemeToggle
                      currentTheme={theme}
                      toggleTheme={toggleTheme}
                      isMobile={isMobile}
                    />
                  ) : (
                    <div style={{ position: "absolute", right: 20 }}>
                      <ThemeToggle
                        currentTheme={theme}
                        toggleTheme={toggleTheme}
                        isMobile={isMobile}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* MAIN CONTENT */}
              <div
                className="main-content-scroll"
                style={{
                  width: "100%",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  // Keep the Home route scroll-free while allowing other pages to scroll normally
                  overflow: isHomeRoute ? "hidden" : "auto",
                  position: "relative",
                }}
              >
                <AppRoutes
                  theme={theme}
                  phase={phase}
                  roleTop={roleTop}
                  roleBot={roleBot}
                  onScramble={handleHomeScramble}
                />

                {/* Footer */}
                <div
                  className={`fade ${phase >= 4 ? "show" : ""}`}
                  style={{
                    width: "100%",
                    marginTop: "auto",
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 60,
                  }}
                >
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
