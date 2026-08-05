import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../../components/Footer"
import OptimizedImage from "../../components/ui/OptimizedImage"
import projects from "../../data/projects"
import useIntersectionOnce from "../../hooks/useIntersectionOnce"
import usePageMeta from "../../hooks/usePageMeta"
import { CONTENT_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../../theme/tokens"
import { trackProjectCardClick } from "../../utils/analytics"
import "../../components/ui/card.css"
import "./Portfolio.css"

interface PortfolioProps {
  theme: ThemeType
}

const PROGRESSIVE_GIF_THUMBNAIL_PROJECT_IDS = new Set(["penn-capsule", "mini-minecraft"])

function isGifAsset(source: string) {
  return /\.gif(?:$|[?#])/i.test(source)
}

const LazyImage: React.FC<{
  projectId?: string
  src: string
  alt: string
  style: React.CSSProperties
  priority?: boolean
}> = ({ projectId, src, alt, style, priority = false }) => {
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
                fontFamily: '"Raleway", sans-serif',
              }}
            >
              Loading...
            </div>
          )}
          <OptimizedImage
            src={src}
            alt={alt}
            priority={priority}
            preferPosterForGif={!(canAnimateGifThumbnail && shouldAnimateGif)}
            preferAnimatedGifVariant={canAnimateGifThumbnail && shouldAnimateGif}
            sizes="(max-width: 640px) 92vw, (max-width: 960px) 46vw, 460px"
            fetchPriority={
              canAnimateGifThumbnail && shouldAnimateGif ? "auto" : priority ? "high" : "low"
            }
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
  const navigate = useNavigate()
  usePageMeta("Projects", "Software, interface, and immersive projects by Ximing Luo.")

  const handleProjectClick = useCallback(
    (projectId: string, projectName: string) => {
      trackProjectCardClick({
        projectId,
        projectName,
        uiRegion: "portfolio_grid",
      })
      navigate(`/portfolio/${projectId}`)
    },
    [navigate],
  )

  const currentTheme = CONTENT_THEME_TOKENS[theme]
  const cardBackground = THEME_VISUAL_TOKENS[theme].surfacePortfolioCard

  return (
    <div
      className="portfolio-container"
      style={{
        ["--portfolio-text" as string]: currentTheme["--color-text"],
        ["--portfolio-card-bg" as string]: cardBackground,
      }}
    >
      <div className="portfolio-header">
        <div className="portfolio-heading-copy">
          <h1 className="portfolio-title">Projects</h1>
          <p className="portfolio-subtitle">
            Software, interfaces, and immersive tools
          </p>
        </div>
      </div>

      <div className="portfolio-grid">
        {projects.map((project, index) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id, project.name)}
            className="project-card"
            role="button"
            tabIndex={0}
            aria-label={`View ${project.name}`}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                handleProjectClick(project.id, project.name)
              }
            }}
          >
            <div className="project-card-media-frame">
              <LazyImage
                projectId={project.id}
                src={project.image || "/placeholder.svg"}
                alt={project.name}
                priority={index < 3}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  willChange: "transform",
                }}
              />
              <div className="project-card-hover" aria-hidden>
                <span className="project-card-view">View</span>
              </div>
            </div>

            <div className="project-card-info">
              <div className="project-card-copy">
                <h3 className="project-card-title">{project.name}</h3>
                <p className="project-card-description">{project.tagline}</p>
              </div>

              <div className="project-card-languages" aria-label="Languages">
                {project.languages.slice(0, 3).map((lang) => (
                  <span key={lang} className="project-card-language">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Footer theme={theme} />
    </div>
  )
}

export default Portfolio
