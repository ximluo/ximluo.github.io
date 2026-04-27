import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import Footer from "../../components/Footer"
import projects from "../../data/projects"
import { CONTENT_THEME_TOKENS, type ThemeType } from "../../theme/tokens"
import NotFound from "../not-found/NotFoundPage"
import ProgressiveDetailImage from "./ProgressiveDetailImage"
import ProjectDetailSections from "./ProjectDetailSections"
import { getFirstSentence, getProjectRelatedLink, getProjectTimeline } from "./projectDetail.shared"
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

interface DetailMetaRowProps {
  label: string
  children: React.ReactNode
}

const DetailMetaRow: React.FC<DetailMetaRowProps> = ({ label, children }) => (
  <div className="project-detail-meta-row">
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
)

const ProjectDetail: React.FC<ProjectDetailProps> = ({ theme }) => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const themeTokens = CONTENT_THEME_TOKENS[theme]

  const project = projects.find((entry) => entry.id === projectId)

  if (!project) {
    return <NotFound theme={theme} backPath="/portfolio" />
  }

  const projectSummary = getFirstSentence(project.description)
  const projectTimeline = getProjectTimeline(project)
  const relatedLink = getProjectRelatedLink(project)

  return (
    <div
      className="project-detail-container"
      style={{
        ["--project-detail-text" as string]: themeTokens["--color-text"],
        ["--project-detail-border" as string]: themeTokens["--border-color"],
        ["--project-detail-accent" as string]: themeTokens["--color-accent-primary"],
      }}
    >
      <div className="project-detail-shell">
        <header className="project-detail-hero">
          <div className="project-detail-hero-main">
            {project.image && (
              <div className="project-detail-media-frame project-detail-media-frame--hero">
                <ProgressiveDetailImage src={project.image} alt={`${project.name} hero`} priority />
              </div>
            )}

            <section className="project-detail-intro" aria-label="Project overview">
              <h1 className="project-detail-title">{project.name}</h1>
              <p className="project-detail-summary">{projectSummary}</p>

              <dl className="project-detail-meta">
                <DetailMetaRow label="Made with:">
                  <LanguageBadges languages={project.languages} />
                </DetailMetaRow>

                <DetailMetaRow label="Timeline:">
                  <span>{projectTimeline}</span>
                </DetailMetaRow>

                {relatedLink && (
                  <DetailMetaRow label="Related:">
                    <a
                      className="project-detail-inline-link"
                      href={relatedLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {relatedLink.label}
                    </a>
                  </DetailMetaRow>
                )}
              </dl>
            </section>
          </div>
        </header>

        <div className="project-detail-body">
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

      <Footer theme={theme} />
    </div>
  )
}

export default ProjectDetail
