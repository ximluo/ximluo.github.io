"use client"

import { useEffect, useState, useRef } from "react"
import { Routes, Route, useLocation, useNavigate, Link } from "react-router-dom"
import "./App.css"
import "./components/gradientAnimation.css"
import CustomCursor from "./components/customCursor"
import GradientBackground from "./components/GradientBackground"
import Home from "./pages/Home"
import Portfolio from "./pages/Portfolio"
import Creative from "./pages/Creative"
import ProjectDetail from "./pages/ProjectDetail"
import Footer from "./components/Footer"
import NotFound from "./pages/NotFound"


type ThemeType = "bunny" | "water"

const themes = {
  bunny: {
    "--color-text": "rgb(121, 85, 189)",
    "--color-text-secondary": "rgba(249, 240, 251, 1)",
    "--color-accent-primary": "rgba(223, 30, 155, 1)",
    "--button-bg": "rgba(223, 30, 155, 0.8)",
    "--button-bg-light": "rgba(223, 30, 155, 0.2)",
    "--button-text": "rgba(249, 240, 251, 1)",
    "--border-color": "rgb(152, 128, 220)",
    "--outer-bg": "#a892e7",
    "--cursor-color": "rgba(223, 30, 155, 0.7)",
    "--cursor-glow": "0 0 8px rgba(223, 30, 155, 0.6)",
    "--cursor-hover-color": "rgba(223, 30, 155, 0.6)",
    "--cursor-hover-glow": "0 0 12px rgba(223, 30, 155, 0.6)",
  },
  water: {
    "--color-text": "rgb(191, 229, 249)",
    "--color-accent-primary": "rgb(134, 196, 240)",
    "--button-bg": "rgba(214, 235, 251, 0.8)",
    "--button-bg-light": "rgba(214, 220, 251, 0.2)",
    "--button-text": "rgb(46, 80, 192)",
    "--border-color": "rgba(8, 34, 163, 1)",
    "--outer-bg": "#1d0298",
    "--cursor-color": "rgba(230, 214, 251, 0.7)",
    "--cursor-glow": "0 0 8px rgba(230, 214, 251, 0.6)",
    "--cursor-hover-color": "rgba(230, 214, 251, 0.6)",
    "--cursor-hover-glow": "0 0 12px rgba(230, 214, 251, 0.6)",
  },
}

const ThemeToggle = ({
  currentTheme,
  toggleTheme,
  isMobile,
}: { currentTheme: ThemeType; toggleTheme: () => void; isMobile: boolean }) => {
  const moonIcon = "☾"
  const sunIcon = "☼"
  const buttonSize = isMobile ? 34 : 40

  return (
    <button
      onClick={toggleTheme}
      style={{
        width: buttonSize,
        height: buttonSize,
        borderRadius: "50%",
        background: currentTheme === "bunny" ? themes.bunny["--button-bg-light"] : themes.water["--button-bg-light"],
        color: currentTheme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
        border: "none",
        outline: "none",
        cursor: "pointer",
        fontSize: isMobile ? 16 : 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
}: {
  label: string
  isActive: boolean
  theme: ThemeType
  onClick: () => void
  isMobile: boolean
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
    }}
  >
    {label}
  </button>
)

const CustomCursorWrapper = ({ theme }: { theme: ThemeType }) => {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Check if the device is desktop (wider than iPad width)
    const checkDevice = () => {
      setIsDesktop(window.innerWidth > 1024)
    }
    checkDevice()
    window.addEventListener("resize", checkDevice)

    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  useEffect(() => {
    if (isDesktop) {
      document.documentElement.style.setProperty(
        "--cursor-border-color",
        theme === "bunny" ? themes.bunny["--cursor-color"] : themes.water["--cursor-color"],
      )
      document.documentElement.style.setProperty(
        "--cursor-box-shadow",
        theme === "bunny" ? themes.bunny["--cursor-glow"] : themes.water["--cursor-glow"],
      )
      document.documentElement.style.setProperty(
        "--cursor-hover-border-color",
        theme === "bunny" ? themes.bunny["--cursor-hover-color"] : themes.water["--cursor-hover-color"],
      )
      document.documentElement.style.setProperty(
        "--cursor-hover-box-shadow",
        theme === "bunny" ? themes.bunny["--cursor-hover-glow"] : themes.water["--cursor-hover-glow"],
      )
    }
  }, [theme, isDesktop])

  // Only render the custom cursor on desktop
  return isDesktop ? <CustomCursor /> : null
}

// Scramble helper + minimal fade‑in CSS 

const scrambleSets = {
  japanese: "プロダクトデザイナーノーコードエンジニア",
  binary: "01",
  symbols: "!<>-_\\/[]{}—=+*^?#",
  matrix: "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ",
  code: "{([/\\])}@#$%^&*<>+=",
}

function scramble(
  target: string,
  set: keyof typeof scrambleSets,
  steps = 15,
  updateFn: (text: string) => void,
): Promise<string> {
  return new Promise((res) => {
    let frame = 0
    const chars = scrambleSets[set]
    let out = Array.from(target)

    const tick = () => {
      out = out.map((c, i) =>
        frame >= steps
          ? target[i]
          : Math.random() < frame / steps
            ? target[i]
            : chars[Math.floor(Math.random() * chars.length)],
      )

      // Update the state with the current scrambled text
      updateFn(out.join(""))

      frame++
      if (frame <= steps) requestAnimationFrame(tick)
      else res(target)
    }

    tick()
  })
}

const fadeCSS = `
.fade { opacity: 0; transition: opacity .8s ease; }
.fade.show { opacity: 1; }
`
if (!document.getElementById("fade-css")) {
  const style = document.createElement("style")
  style.id = "fade-css"
  style.innerHTML = fadeCSS
  document.head.appendChild(style)
}

function App() {
  // theme + nav 
  const [theme, setTheme] = useState<ThemeType>("water")
  const location = useLocation()
  const navigate = useNavigate()
  const navRef = useRef<HTMLDivElement>(null)

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes("/portfolio")) return "PORTFOLIO"
    if (path.includes("/creative")) return "CREATIVE"
    return "HOME"
  }
  const activeTab = getActiveTab()

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
  const [safeAreaBottom, setSafeAreaBottom] = useState("15px")

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
        setSafeAreaBottom("max(15px, env(safe-area-inset-bottom))")
      } else {
        // Standard padding for desktop
        setSafeAreaTop("15px")
        setSafeAreaBottom("15px")
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
      scramble(originalTop, "code", 45, setTop)
      scramble(originalBot, "japanese", 45, setBot)
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
      scramble(originalTop, topSet, 30, setTop).then(() => { })
      scramble(originalBot, botSet, 30, setBot).then(() => { })

      return newTheme
    })
  }

  // Handle navigation
  const handleNavClick = (tab: string) => {
    let path = "/"
    if (tab === "PORTFOLIO") path = "/portfolio"
    if (tab === "CREATIVE") path = "/creative"
    navigate(path)
  }

  // Handle home click scramble
  const handleHomeScramble = () => {
    if (location.pathname === "/") {
      const topSet = theme === "bunny" ? "code" : "matrix"
      const botSet = theme === "bunny" ? "japanese" : "symbols"

      scramble(originalTop, topSet, 30, setTop).then(() => { })
      scramble(originalBot, botSet, 30, setBot).then(() => { })
    }
  }

  return (
    <>
      <CustomCursorWrapper theme={theme} />
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
                  <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>XIMING LUO</Link>
                </div>
              )}

              {/* main row */}
              <div
                style={{
                  display: "flex",
                  gap: isMobile ? 8 : 12,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {["HOME", "PORTFOLIO", "CREATIVE"].map((lbl) => (
                  <NavButton
                    key={lbl}
                    label={lbl}
                    isActive={activeTab === lbl}
                    theme={theme}
                    onClick={() => handleNavClick(lbl)}
                    isMobile={isMobile}
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
              style={{
                width: "100%",
                height: "calc(100% - 80px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto", // Allow scrolling if content is too tall
                position: "relative",
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <Home
                      theme={theme}
                      phase={phase}
                      roleTop={roleTop}
                      roleBot={roleBot}
                      onScramble={handleHomeScramble}
                    />
                  }
                />
                <Route path="/portfolio" element={<Portfolio theme={theme} />} />
                <Route path="/portfolio/:projectId" element={<ProjectDetail theme={theme} />} />
                <Route path="/creative" element={<Creative theme={theme} />} />
                <Route path="*" element={<NotFound theme={theme} />} />
              </Routes>

              {/* Footer */}
              <div
                className={`fade ${phase >= 4 ? "show" : ""}`}
                style={{
                  width: "100%",
                  marginTop: "auto",
                  flexShrink: 0,
                }}
              >
                <Footer theme={theme} />
              </div>
            </div>
          </GradientBackground>
        </div>
      </div>
    </>
  )
}

export default App
