import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import OptimizedImage from "../../components/ui/OptimizedImage"
import projects from "../../data/projects"
import useIntersectionOnce from "../../hooks/useIntersectionOnce"
import useMediaQuery from "../../hooks/useMediaQuery"
import { CONTENT_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../../theme/tokens"
import { trackProjectCardClick } from "../../utils/analytics"
import "./Portfolio.css"

interface PortfolioProps {
  theme: ThemeType
}

const PROGRESSIVE_GIF_THUMBNAIL_PROJECT_IDS = new Set(["penn-capsule", "mini-minecraft"])

function isGifAsset(source: string) {
  return /\.gif(?:$|[?#])/i.test(source)
}

function getShortCardDescription(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return ""

  const firstSentenceMatch = trimmed.match(/.*?[.!?](?:\s|$)/)
  return (firstSentenceMatch?.[0] ?? trimmed).trim()
}

const LazyImage: React.FC<{
  projectId?: string
  src: string
  alt: string
  style: React.CSSProperties
}> = ({ projectId, src, alt, style }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [shouldAnimateGif, setShouldAnimateGif] = useState(false)
  const { ref: setImgRef, hasIntersected: isInView } = useIntersectionOnce<HTMLDivElement>({
    rootMargin: "350px",
    threshold: 0.01,
  })

  const canAnimateGifThumbnail =
    Boolean(projectId && PROGRESSIVE_GIF_THUMBNAIL_PROJECT_IDS.has(projectId)) && isGifAsset(src)

  useEffect(() => {
    if (!isInView || !canAnimateGifThumbnail || shouldAnimateGif) return

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
  const isDesktop = useMediaQuery(
    "(min-width: 1025px)",
    typeof window !== "undefined" ? window.innerWidth > 1024 : false,
  )
  const navigate = useNavigate()

  const filteredProjects = useMemo(() => {
    if (activeFilter) {
      return projects.filter((project) => project.categories.includes(activeFilter))
    }
    return projects
  }, [activeFilter])

  const handleFilterClick = useCallback((filter: string) => {
    setActiveFilter((current) => (current === filter ? null : filter))
  }, [])

  const handleProjectClick = useCallback(
    (projectId: string, projectName: string) => {
      trackProjectCardClick({
        projectId,
        projectName,
        uiRegion: activeFilter ? `portfolio_grid_filtered_${activeFilter}` : "portfolio_grid",
      })
      navigate(`/portfolio/${projectId}`)
    },
    [activeFilter, navigate],
  )

  const currentTheme = CONTENT_THEME_TOKENS[theme]
  const cardBackground = THEME_VISUAL_TOKENS[theme].surfacePortfolioCard

  return (
    <div
      className="portfolio-container"
      style={{
        ["--portfolio-scrollbar-thumb" as string]: currentTheme["--button-bg"],
        ["--portfolio-text" as string]: currentTheme["--color-text"],
        ["--portfolio-border" as string]: currentTheme["--border-color"],
        ["--portfolio-card-bg" as string]: cardBackground,
      }}
    >
      <div className="portfolio-header">
        <h3 className="portfolio-title">Projects:</h3>

        <div className="portfolio-filters">
          {["software", "graphics"].map((filter) => {
            const isActive = activeFilter === filter
            return (
              <button
                key={filter}
                type="button"
                onClick={() => handleFilterClick(filter)}
                className="portfolio-filter-button"
                style={{
                  ["--portfolio-filter-bg" as string]: isActive
                    ? currentTheme["--button-bg"]
                    : currentTheme["--button-bg-light"],
                  ["--portfolio-filter-text" as string]: isActive
                    ? currentTheme["--button-text"]
                    : currentTheme["--color-text"],
                }}
              >
                {isActive ? `${filter} ×` : filter}
              </button>
            )
          })}
        </div>
      </div>

      <div className="portfolio-grid">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id, project.name)}
            className="project-card"
            style={{ height: isDesktop ? "290px" : "240px" }}
          >
            <div className="project-card-media">
              <LazyImage
                projectId={project.id}
                src={project.image || "/placeholder.svg"}
                alt={project.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  willChange: "transform",
                }}
              />
              <div className="project-card-overlay" />
              <div className="project-card-meta-panel">
                <div className="project-card-meta-row">
                  <div className="project-card-copy">
                    <h3 className="project-card-title">{project.name}</h3>

                    <div className="project-card-languages">
                      {project.languages.map((lang, index) => (
                        <span key={lang} className="project-card-language">
                          {lang}
                          {index < project.languages.length - 1 ? " / " : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="project-card-arrow">→</div>
                </div>
                <p className="project-card-hover-description">
                  {getShortCardDescription(project.description)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Portfolio
