"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import projects from "../data/projects"

interface PortfolioProps {
  theme: "bunny" | "water"
}

const Portfolio: React.FC<PortfolioProps> = ({ theme }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filteredProjects, setFilteredProjects] = useState(projects)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024)
  const navigate = useNavigate()

  const themes = {
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
  }

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (activeFilter) {
      setFilteredProjects(projects.filter((project) => project.categories.includes(activeFilter)))
    } else {
      setFilteredProjects(projects)
    }
  }, [activeFilter])

  const handleFilterClick = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter)
  }

  const handleProjectClick = (projectId: string) => {
    navigate(`/portfolio/${projectId}`)
  }

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
          maxWidth: "940px", // cap at 3 cards + gaps
          margin: "0 auto 30px",
          padding: "0 20px 15px",
          boxSizing: "border-box",
          borderBottom: `1px solid ${
            theme === "bunny" ? themes.bunny["--border-color"] : themes.water["--border-color"]
          }`,
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
            color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
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
                backgroundColor:
                  activeFilter === filter
                    ? theme === "bunny"
                      ? themes.bunny["--button-bg"]
                      : themes.water["--button-bg"]
                    : theme === "bunny"
                    ? themes.bunny["--button-bg-light"]
                    : themes.water["--button-bg-light"],
                color:
                  activeFilter === filter
                    ? theme === "bunny"
                      ? themes.bunny["--button-text"]
                      : themes.water["--button-text"]
                    : theme === "bunny"
                    ? themes.bunny["--color-text"]
                    : themes.water["--color-text"],
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

      {/* Projects Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // ≤ 3 columns in 940‑px container
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
              backgroundColor:
                theme === "bunny" ? "rgba(121, 85, 189, 0.1)" : "rgba(8, 34, 163, 0.25)",
              cursor: "pointer",
              transition: "transform 0.3s ease",
              height: isDesktop ? "290px" : "auto",
            }}
            className="project-card"
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
                      color:
                        theme === "bunny"
                          ? themes.bunny["--color-accent-primary"]
                          : themes.water["--color-accent-primary"],
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
                    {project.languages.map((lang) => (
                      <span
                        key={lang}
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color:
                            theme === "bunny"
                              ? themes.bunny["--color-text"]
                              : themes.water["--color-text"],
                          opacity: 0.8,
                        }}
                      >
                        {lang}
                        {project.languages.indexOf(lang) < project.languages.length - 1 ? " / " : ""}
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
                    background:
                      theme === "bunny"
                        ? themes.bunny["--button-bg"]
                        : themes.water["--button-bg"],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color:
                      theme === "bunny"
                        ? themes.bunny["--button-text"]
                        : themes.water["--button-text"],
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

      {/* hover effect */}
      <style>
        {`
        .portfolio-container::-webkit-scrollbar{width:8px}
        .portfolio-container::-webkit-scrollbar-track{background:transparent}
        .portfolio-container::-webkit-scrollbar-thumb{
          border-radius:4px;
          background-color:${
            theme === "bunny" ? themes.bunny["--button-bg"] : themes.water["--button-bg"]
          };
        }
        @media (min-width:1025px){
          .project-card:hover{
            transform:scale(1.05); /* grow in place */
            z-index:2;
          }

          .project-card:hover img{
            transform:scale(1.08);
          }

        //   .project-card:hover .project-description{
        //     opacity:1!important;
        //     height:auto!important;
        //   }
        }
        `}
      </style>
    </div>
  )
}

export default Portfolio
