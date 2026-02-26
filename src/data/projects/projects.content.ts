import type { Project } from "./types"
import featuredProjects from "./content/featured"
import interactiveProjects from "./content/interactive"
import researchProjects from "./content/research"

const projects: Project[] = [...featuredProjects, ...interactiveProjects, ...researchProjects]

export default projects
