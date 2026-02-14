import projectsContent from "./projects.content"
import type { Project } from "./types"

export type ProjectCore = Omit<Project, "sections">

const projectsCore: ProjectCore[] = projectsContent.map(({ sections, ...core }) => core)

export default projectsCore
