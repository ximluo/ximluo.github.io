import type React from "react"
import { lazy, Suspense, useEffect, useState } from "react"
import { Github, Mail, Linkedin } from "lucide-react"
import { FOOTER_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../theme/tokens"
import useIsMobile from "../hooks/useIsMobile"
import "./Footer.css"

const BunnyModal = lazy(() => import("../features/bunny"))

let bunnyPrefetchStarted = false

const prefetchBunnyFeature = () => {
  if (bunnyPrefetchStarted) return
  bunnyPrefetchStarted = true

  void import("../features/bunny")
    .then((mod) => {
      if ("preloadBunnyAssets" in mod && typeof mod.preloadBunnyAssets === "function") {
        mod.preloadBunnyAssets()
      }
    })
    .catch(() => {
      bunnyPrefetchStarted = false
    })
}

interface FooterProps {
  theme: ThemeType
}

interface FooterLinkItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ size?: number }>
  external?: boolean
}

const FOOTER_LINK_ITEMS: FooterLinkItem[] = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/ximluo",
    icon: Github,
    external: true,
  },
  {
    id: "email",
    label: "Email",
    href: "mailto:ximluo@seas.upenn.edu",
    icon: Mail,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ximingluo/",
    icon: Linkedin,
    external: true,
  },
]

const Footer: React.FC<FooterProps> = ({ theme }) => {
  const [showBunny, setShowBunny] = useState(false)
  const isMobile = useIsMobile(768)
  const isDesktop = !isMobile

  const themeTokens = FOOTER_THEME_TOKENS[theme]
  const visualTokens = THEME_VISUAL_TOKENS[theme]

  const iconSize = isMobile ? 18 : 22

  useEffect(() => {
    if (typeof window === "undefined") return

    const timeoutId = window.setTimeout(() => {
      prefetchBunnyFeature()
    }, 1200)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const bunnyButton = (
    <button
      type="button"
      aria-label="Show Bunny"
      onMouseEnter={prefetchBunnyFeature}
      onTouchStart={prefetchBunnyFeature}
      onClick={() => {
        prefetchBunnyFeature()
        setShowBunny(true)
      }}
      className="footer-icon-button footer-icon-button--bunny"
    >
      🐰
    </button>
  )

  return (
    <footer
      className={`footer-root ${isDesktop ? "footer-root--desktop" : "footer-root--mobile"}`}
      style={{
        ["--footer-padding" as string]: isMobile ? "10px 15px" : "15px 20px",
        ["--footer-text" as string]: themeTokens["--color-text"],
        ["--footer-accent" as string]: themeTokens["--color-accent-primary"],
        ["--footer-button-bg" as string]: themeTokens["--button-bg-light"],
        ["--footer-button-bg-hover" as string]: themeTokens["--button-bg"],
        ["--footer-bunny-glow" as string]: visualTokens.iconGlowSoft,
        ["--footer-icon-button-size" as string]: isMobile ? "30px" : "36px",
        ["--footer-icon-font-size" as string]: isMobile ? "14px" : "18px",
        ["--footer-font-size" as string]: isMobile ? "12px" : "14px",
        ["--footer-icon-gap" as string]: isMobile ? "10px" : "15px",
        ["--footer-icons-margin-bottom" as string]: isMobile ? "5px" : "10px",
        ["--footer-bunny-slot-width" as string]: isMobile ? "100px" : "120px",
      }}
    >
      {isDesktop && <div className="footer-bunny-slot">{bunnyButton}</div>}

      <div
        className={`footer-icons ${isDesktop ? "footer-icons--desktop" : "footer-icons--mobile"}`}
      >
        {!isDesktop && bunnyButton}

        {FOOTER_LINK_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className="footer-icon-button"
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
            >
              <Icon size={iconSize} />
            </a>
          )
        })}
      </div>

      <div
        className={`footer-copyright ${isDesktop ? "footer-copyright--desktop" : "footer-copyright--mobile"}`}
      >
        © 2026 Ximing Luo •{" "}
        <a
          href="https://github.com/ximluo/ximluo.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-made-link"
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
