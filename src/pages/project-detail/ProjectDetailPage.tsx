import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import projects from "../../data/projects"
import { CONTENT_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../../theme/tokens"
import NotFound from "../not-found/NotFoundPage"
import ProgressiveDetailImage from "./ProgressiveDetailImage"
import ProjectDetailSections from "./ProjectDetailSections"
import "./ProjectDetail.css"

interface ProjectDetailProps {
  theme: ThemeType
}

interface LanguageBadgesProps {
  languages: string[]
}

const LanguageBadges: React.FC<LanguageBadgesProps> = ({ languages }) => {
  return (
    <div className="project-detail-chips">
      {languages.map((lang) => (
        <span key={lang} className="project-detail-chip">
          {lang}
        </span>
      ))}
    </div>
  )
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ theme }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const themeTokens = CONTENT_THEME_TOKENS[theme]
  const visualTokens = THEME_VISUAL_TOKENS[theme]

  const project = projects.find((entry) => entry.id === projectId)

  if (!project) {
    return <NotFound theme={theme} backPath="/portfolio" />
  }

  return (
    <div
      className="project-detail-container"
      style={{
        ["--project-detail-scrollbar-thumb" as string]: themeTokens["--button-bg"],
        ["--project-detail-text" as string]: themeTokens["--color-text"],
        ["--project-detail-border" as string]: themeTokens["--border-color"],
        ["--project-detail-accent" as string]: themeTokens["--color-accent-primary"],
        ["--project-detail-button-bg" as string]: themeTokens["--button-bg"],
        ["--project-detail-button-bg-light" as string]: themeTokens["--button-bg-light"],
        ["--project-detail-button-text" as string]: themeTokens["--button-text"],
        ["--project-detail-overview-surface" as string]: visualTokens.surfaceProjectOverview,
      }}
    >
      <div className="project-detail-shell">
        <button
          type="button"
          onClick={() => navigate("/portfolio")}
          className="project-detail-back-button"
        >
          ← Back
        </button>

        <h1 className="project-detail-title">{project.name}</h1>

        <LanguageBadges languages={project.languages} />

        {project.image && (
          <div className="project-detail-media-frame project-detail-media-frame--hero">
            <ProgressiveDetailImage src={project.image} alt={`${project.name} hero`} priority />
          </div>
        )}

        <section className="project-detail-overview" aria-label="Project overview">
          <h3 className="project-detail-overview-title">Overview</h3>
          <p className="project-detail-paragraph project-detail-paragraph--compact">
            {project.description}
          </p>
        </section>

        <ProjectDetailSections project={project} theme={theme} />

        <div className="project-detail-cta">
          <button
            type="button"
            onClick={() => navigate("/portfolio")}
            className="project-detail-cta-button"
          >
            View More Projects
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
