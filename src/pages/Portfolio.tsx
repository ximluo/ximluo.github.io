"use client"

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type FC,
} from "react"
import { useNavigate } from "react-router-dom"
import projects from "../data/projects"

interface PortfolioProps {
  theme: "bunny" | "water"
}

const THEMES = {
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
} as const

const Portfolio: FC<PortfolioProps> = ({ theme }) => {
  const navigate = useNavigate()
  const tokens = THEMES[theme]

  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth > 1024 : true
  )

  // derive projects list from filter
  const filteredProjects = useMemo(
    () =>
      activeFilter
        ? projects.filter((p) => p.categories.includes(activeFilter))
        : projects,
    [activeFilter]
  )

  /* resize (throttled) */

  useEffect(() => {
    let ticking = false

    const onResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsDesktop(window.innerWidth > 1024)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const handleFilterClick = useCallback(
    (filter: string) =>
      setActiveFilter((prev) => (prev === filter ? null : filter)),
    []
  )

  const handleProjectClick = useCallback(
    (projectId: string) => navigate(`/portfolio/${projectId}`),
    [navigate]
  )

  /* ----------------------------- render --------------------------------- */

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
      {/* Filter Section */}
      <div
        style={{
          width: "100%",
          maxWidth: "940px",
          margin: "0 auto 30px",
          padding: "0 20px 15px",
          boxSizing: "border-box",
          borderBottom: `1px solid ${tokens["--border-color"]}`,
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
            color: tokens["--color-text"],
            margin: 0,
          }}
        >
          Projects:
        </h3>

        <div style={{ display: "flex", gap: "8px" }}>
          {["software", "graphics"].map((filter) => {
            const isActive = activeFilter === filter
            return (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                style={{
                  padding: "7px 14px",
                  backgroundColor: isActive
                    ? tokens["--button-bg"]
                    : tokens["--button-bg-light"],
                  color: isActive
                    ? tokens["--button-text"]
                    : tokens["--color-text"],
                  border: "none",
                  borderRadius: "20px",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  textTransform: "lowercase",
                }}
              >
                {isActive ? `${filter} ×` : filter}
              </button>
            )
          })}
        </div>
      </div>

      {/* Projects Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          width: "100%",
          maxWidth: "940px",
          margin: "0 auto",
          padding: "0",
          boxSizing: "border-box",
        }}
      >
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            className="project-card"
            style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor:
                theme === "bunny"
                  ? "rgba(121, 85, 189, 0.1)"
                  : "rgba(8, 34, 163, 0.25)",
              cursor: "pointer",
              transition: "transform 0.3s ease",
              height: isDesktop ? "290px" : "auto",
            }}
          >
            {/* Project Image */}
            <div
              style={{
                width: "100%",
                height: "200px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                loading="lazy"
                src={project.image || "/placeholder.svg"}
                alt={project.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
              />
            </div>

            {/* Project Info */}
            <div
              style={{
                padding: "15px",
                position: "relative",
                height: isDesktop ? "85px" : "auto",
                overflow: "hidden",
              }}
            >
              {/* Title + stack + arrow row */}
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
                      color: tokens["--color-accent-primary"],
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
                      marginBottom: 0,
                    }}
                  >
                    {project.languages.map((lang, idx) => (
                      <span
                        key={lang}
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: tokens["--color-text"],
                          opacity: 0.8,
                        }}
                      >
                        {lang}
                        {idx < project.languages.length - 1 ? " / " : ""}
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
                    background: tokens["--button-bg"],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color: tokens["--button-text"],
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

      {/* hover effect */}
      <style>{`
        .portfolio-container::-webkit-scrollbar{width:8px}
        .portfolio-container::-webkit-scrollbar-track{background:transparent}
        .portfolio-container::-webkit-scrollbar-thumb{
          border-radius:4px;
          background-color:${tokens["--button-bg"]};
        }
        @media (min-width:1025px){
          .project-card:hover{
            transform:scale(1.05);
            z-index:2;
          }
          .project-card:hover img{transform:scale(1.08);}
        }
      `}</style>
    </div>
  )
}

export default Portfolio
