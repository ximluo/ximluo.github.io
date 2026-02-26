import type React from "react"
import type { ThemeType } from "../../theme/tokens"
import DeferredEmbed from "./DeferredEmbed"
import ProgressiveDetailImage from "./ProgressiveDetailImage"
import { isPdfSource, parseTextWithLinks, type ProjectRecord } from "./projectDetail.shared"

interface ProjectDetailSectionsProps {
  project: ProjectRecord
  theme: ThemeType
}

const ProjectDetailSections: React.FC<ProjectDetailSectionsProps> = ({ project, theme }) => {
  return (
    <>
      {project.sections.map((section, idx) => {
        if (section.text) {
          return (
            <p key={`txt-${idx}`} className="project-detail-paragraph">
              {parseTextWithLinks(section.text)}
            </p>
          )
        }

        if (section.video) {
          if (isPdfSource(section.video)) return null

          return (
            <DeferredEmbed
              key={`vid-${idx}`}
              src={section.video}
              title={`${project.name} ${isPdfSource(section.video) ? "PDF preview" : "demo video"}`}
              theme={theme}
            />
          )
        }

        if (section.image) {
          return (
            <div
              key={`img-${idx}`}
              className="project-detail-media-frame project-detail-media-frame--section"
            >
              <ProgressiveDetailImage
                src={section.image}
                alt={`${project.name} screenshot ${idx + 1}`}
              />
            </div>
          )
        }

        return null
      })}
    </>
  )
}

export default ProjectDetailSections
