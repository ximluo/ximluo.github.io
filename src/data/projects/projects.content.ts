import type { ProjectContent } from "./types"
import featuredProjects from "./content/featured"
import interactiveProjects from "./content/interactive"
import researchProjects from "./content/research"

const projects: ProjectContent[] = [
  ...featuredProjects,
  ...interactiveProjects,
  ...researchProjects,
]

export default projects
