"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import "./Portfolio.css"
import projects from "../../data/projects"
import { CONTENT_THEME_TOKENS, type ThemeType } from "../../theme/tokens"
import OptimizedImage from "../../components/ui/OptimizedImage"

interface PortfolioProps {
  theme: ThemeType
}

const PROGRESSIVE_GIF_THUMBNAIL_PROJECT_IDS = new Set(["penn-capsule", "mini-minecraft"])

function isGifAsset(source: string) {
  return /\.gif(?:$|[?#])/i.test(source)
}

// Lazy Image Component with intersection observer
const LazyImage: React.FC<{
  projectId?: string
  src: string
  alt: string
  style: React.CSSProperties
}> = ({ projectId, src, alt, style }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [shouldAnimateGif, setShouldAnimateGif] = useState(false)
  const [imgRef, setImgRef] = useState<HTMLDivElement | null>(null)
  const canAnimateGifThumbnail =
    Boolean(projectId && PROGRESSIVE_GIF_THUMBNAIL_PROJECT_IDS.has(projectId)) && isGifAsset(src)

  useEffect(() => {
    if (!imgRef) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "350px",
        threshold: 0.01,
      }
    )

    observer.observe(imgRef)
    return () => observer.disconnect()
  }, [imgRef])

  useEffect(() => {
    if (!isInView || !canAnimateGifThumbnail || shouldAnimateGif) return

    // Delay the animated GIF swap slightly so the poster paints first and the grid remains responsive.
    const timeoutId = window.setTimeout(() => {
      setShouldAnimateGif(true)
    }, 180)

    return () => window.clearTimeout(timeoutId)
  }, [canAnimateGifThumbnail, isInView, shouldAnimateGif])

  return (
    <div
      ref={setImgRef}
      style={style}
      onPointerEnter={() => {
        if (canAnimateGifThumbnail) setShouldAnimateGif(true)
      }}
    >
      {isInView && (
        <>
          {}
          {!isLoaded && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(128, 128, 128, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(128, 128, 128, 0.6)",
                fontSize: "14px",
                fontFamily: "monospace",
              }}
            >
              Loading...
            </div>
          )}
          <OptimizedImage
            src={src}
            alt={alt}
            preferPosterForGif={!(canAnimateGifThumbnail && shouldAnimateGif)}
            preferAnimatedGifVariant={canAnimateGifThumbnail && shouldAnimateGif}
            sizes="(max-width: 960px) 100vw, 460px"
            fetchPriority={canAnimateGifThumbnail && shouldAnimateGif ? "auto" : "low"}
            onLoad={() => setIsLoaded(true)}
            style={{
              ...style,
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          />
        </>
      )}
    </div>
  )
}

const Portfolio: React.FC<PortfolioProps> = ({ theme }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024)
  const navigate = useNavigate()

  const themes = CONTENT_THEME_TOKENS

  // Memoize filtered projects to prevent unnecessary recalculations
  const filteredProjects = useMemo(() => {
    if (activeFilter) {
      return projects.filter((project) => project.categories.includes(activeFilter))
    }
    return projects
  }, [activeFilter])

  // Debounced resize handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsDesktop(window.innerWidth > 1024)
      }, 150)
    }

    window.addEventListener("resize", handleResize, { passive: true })
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  // Memoized event handlers
  const handleFilterClick = useCallback((filter: string) => {
    setActiveFilter(current => current === filter ? null : filter)
  }, [])

  const handleProjectClick = useCallback((projectId: string) => {
    navigate(`/portfolio/${projectId}`)
  }, [navigate])

  const currentTheme = themes[theme]

  return (
    <div
      className="portfolio-container"
      style={{
        width: "100%",
        height: "100%",
        padding: "20px",
        overflow: "auto",
        boxSizing: "border-box",
        ["--portfolio-scrollbar-thumb" as string]: currentTheme["--button-bg"],
      }}
    >
      {}
      <div
        style={{
          width: "100%",
          maxWidth: "940px",
          margin: "0 auto 30px",
          padding: "0 20px 15px",
          boxSizing: "border-box",
          borderBottom: `1px solid ${currentTheme["--border-color"]}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px 20px",
        }}
      >
        <h3
          style={{
            fontFamily: "monospace",
            color: currentTheme["--color-text"],
            margin: 0,
          }}
        >
          Projects:
        </h3>

        <div style={{ display: "flex", gap: "8px" }}>
          {["software", "graphics"].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              style={{
                padding: "7px 14px",
                backgroundColor: activeFilter === filter
                  ? currentTheme["--button-bg"]
                  : currentTheme["--button-bg-light"],
                color: activeFilter === filter
                  ? currentTheme["--button-text"]
                  : currentTheme["--color-text"],
                border: "none",
                borderRadius: "20px",
                fontFamily: "monospace",
                cursor: "pointer",
                textTransform: "lowercase",
              }}
            >
              {activeFilter === filter ? `${filter} ×` : filter}
            </button>
          ))}
        </div>
      </div>

      {}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          width: "100%",
          maxWidth: "940px",
          margin: "0 auto",
          padding: "0 0px",
          boxSizing: "border-box",
        }}
      >
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: theme === "bunny"
                ? "rgba(121, 85, 189, 0.1)"
                : "rgba(8, 34, 163, 0.25)",
              cursor: "pointer",
              transition: "transform 0.3s ease",
              height: isDesktop ? "290px" : "auto",
              // Add will-change for better transform performance
              willChange: "transform",
            }}
            className="project-card"
          >
            {}
            <div
              style={{
                width: "100%",
                height: "200px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <LazyImage
                projectId={project.id}
                src={project.image || "/placeholder.svg"}
                alt={project.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  willChange: "transform", // Optimize for transform animations
                }}
              />
            </div>

            {}
            <div
              style={{
                padding: "15px",
                position: "relative",
                height: isDesktop ? "85px" : "auto",
                overflow: "hidden",
              }}
            >
              {}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: "0 0 5px 0",
                      fontFamily: "monospace",
                      color: currentTheme["--color-accent-primary"],
                      textAlign: "left",
                    }}
                  >
                    {project.name}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "5px",
                      marginBottom: "0",
                    }}
                  >
                    {project.languages.map((lang, index) => (
                      <span
                        key={lang}
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: currentTheme["--color-text"],
                          opacity: 0.8,
                        }}
                      >
                        {lang}
                        {index < project.languages.length - 1 ? " / " : ""}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div
                  className="hover-arrow"
                  style={{
                    minWidth: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: currentTheme["--button-bg"],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color: currentTheme["--button-text"],
                    opacity: 1,
                    transform: "none",
                    transition: "background 0.3s ease",
                  }}
                >
                  →
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Portfolio
