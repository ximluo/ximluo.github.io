"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import projects from "../data/projects"

interface PortfolioProps {
  theme: "bunny" | "water"
}

// Lazy Image Component with intersection observer
const LazyImage: React.FC<{
  src: string
  alt: string
  style: React.CSSProperties
}> = ({ src, alt, style }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [imgRef, setImgRef] = useState<HTMLDivElement | null>(null)

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
        rootMargin: "50px", // Start loading 50px before it comes into view
        threshold: 0.1
      }
    )

    observer.observe(imgRef)
    return () => observer.disconnect()
  }, [imgRef])

  return (
    <div ref={setImgRef} style={style}>
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
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
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

  // Memoize theme styles to prevent recalculation
  const themes = useMemo(() => ({
    bunny: {
      "--color-text": "rgb(121, 85, 189)",
      "--color-text-secondary": "rgba(249, 240, 251, 1)",
      "--color-accent-primary": "rgba(223, 30, 155, 1)",
      "--button-bg": "rgba(223, 30, 155, 0.8)",
      "--button-bg-light": "rgba(223, 30, 155, 0.2)",
      "--button-text": "rgba(249, 240, 251, 1)",
      "--border-color": "rgb(152, 128, 220)",
    },
    water: {
      "--color-text": "rgb(191, 229, 249)",
      "--color-accent-primary": "rgb(134, 196, 240)",
      "--button-bg": "rgba(214, 235, 251, 0.8)",
      "--button-bg-light": "rgba(214, 220, 251, 0.2)",
      "--button-text": "rgb(46, 80, 192)",
      "--border-color": "rgba(8, 34, 163, 1)",
    },
  }), [])

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

  // Memoize current theme
  const currentTheme = useMemo(() => themes[theme], [themes, theme])

  return (
    <div
      className="portfolio-container"
      style={{
        width: "100%",
        height: "100%",
        padding: "20px",
        overflow: "auto",
        boxSizing: "border-box",
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

      {}
      <style>
        {`
        .portfolio-container::-webkit-scrollbar{width:8px}
        .portfolio-container::-webkit-scrollbar-track{background:transparent}
        .portfolio-container::-webkit-scrollbar-thumb{
          border-radius:4px;
          background-color:${currentTheme["--button-bg"]};
        }
        @media (min-width:1025px){
          .project-card:hover{
            transform:scale(1.05) translateZ(0); /* GPU acceleration */
            z-index:2;
          }

          .project-card:hover img{
            transform:scale(1.08) translateZ(0); /* GPU acceleration */
          }
        }
        `}
      </style>
    </div>
  )
}

export default Portfolio