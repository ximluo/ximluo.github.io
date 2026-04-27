import projectsContent from "./projects.content"
import type { ProjectContent } from "./types"

export type ProjectCore = Omit<ProjectContent, "sections">

const projectsCore: ProjectCore[] = projectsContent.map(({ sections, ...core }) => core)

export default projectsCore
