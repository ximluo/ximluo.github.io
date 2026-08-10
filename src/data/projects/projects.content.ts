import type { ProjectContent } from "./types"
import featuredProjects from "./content/featured"
import interactiveProjects from "./content/interactive"
import researchProjects from "./content/research"

// Display order for the portfolio grid; the home page previews the first six.
// The content files group projects by kind, so ordering lives here instead.
const PROJECT_ORDER = [
  "mini-minecraft",
  "pennos",
  "undertone",
  "penn-mobile",
  "relight",
  "petsteps",
  "painterly",
  "penn-capsule",
  "rewind",
  "neuroscent",
  "gpu-path-tracer",
  "pbr-renderer",
  "web-experiments",
  "lost-at-penn",
  "statistical-learning-returns",
  "hci-research-jhu",
  "ar-mri-point-cloud",
  "next",
  "vr-meta-quest-experiences",
  "glsl-shaders",
]

const allProjects: ProjectContent[] = [
  ...featuredProjects,
  ...interactiveProjects,
  ...researchProjects,
]

const rank = new Map(PROJECT_ORDER.map((id, index) => [id, index]))

// Anything not listed above keeps its source order and lands at the end.
const projects: ProjectContent[] = [...allProjects].sort(
  (a, b) =>
    (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER),
)

export default projects
