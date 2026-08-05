import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation, Link } from "react-router-dom"
import "./App.css"
import "./components/gradientAnimation.css"
import DogCompanion from "./components/DogCompanion"
import GradientBackground from "./components/GradientBackground"
import AppRoutes from "./app/routes"
import { APP_THEME_TOKENS, type ThemeType } from "./theme/tokens"
import useViewportSize from "./hooks/useViewportSize"

const themes = APP_THEME_TOKENS
const GA_MEASUREMENT_ID = "G-1QHSNH5G8L"

const NAV_ITEMS = [
  { label: "work", to: "/portfolio", match: (path: string) => path.startsWith("/portfolio") },
  { label: "art", to: "/creative", match: (path: string) => path.startsWith("/creative") },
  { label: "experience", to: "/about", match: (path: string) => path.startsWith("/about") },
]

function App() {
  const theme: ThemeType = "water"
  const location = useLocation()
  const hasTrackedInitialPageRef = useRef(false)
  const mainContentScrollRef = useRef<HTMLDivElement | null>(null)
  const { width: viewportWidth } = useViewportSize({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  const isHomeRoute = location.pathname === "/"

  const [phase, setPhase] = useState(0)

  const isMobile = viewportWidth <= 480
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
    const t1 = setTimeout(() => setPhase(2), 357)
    const t2 = setTimeout(() => setPhase(3), 1200)
    const t3 = setTimeout(() => setPhase(4), 2450)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
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

  useLayoutEffect(() => {
    const container = mainContentScrollRef.current
    if (!container) return
    container.scrollTop = 0
  }, [location.pathname, location.search, location.hash])

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
                ref={mainContentScrollRef}
                className={`main-content-scroll ${isHomeRoute ? "main-content-scroll--home" : "main-content-scroll--page"}`}
              >
                <div
                  data-top-header
                  className="app-top-nav"
                  style={{
                    ["--app-nav-padding" as string]: isMobile ? "16px 16px 9px" : "20px 28px 12px",
                    ["--app-nav-gap" as string]: `${isMobile ? 8 : 26}px`,
                    ["--app-nav-title-color" as string]: themes[theme]["--color-text"],
                  }}
                >
                  <div className="app-top-nav-title">
                    <Link to="/" className="app-top-nav-home-link">
                      XIMING LUO
                    </Link>
                  </div>

                  <nav className="app-top-nav-links" aria-label="Primary navigation">
                    {NAV_ITEMS.map((item) => {
                      const isActive = item.match(location.pathname)
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`app-nav-text-link ${isActive ? "is-active" : ""}`}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                  </nav>
                </div>

                <AppRoutes theme={theme} phase={phase} />
              </div>
            </div>
            <DogCompanion />
          </GradientBackground>
        </div>
      </div>
    </>
  )
}

export default App
