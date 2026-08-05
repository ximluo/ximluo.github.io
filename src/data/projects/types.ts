export type Section = {
  text?: string
  image?: string
  video?: string
}

export type Project = {
  id: string
  name: string
  image: string
  description: string
  languages: string[]
  tagline: string
  /** Text shown in the Timeline row on project detail pages. Leave blank to auto-detect years. */
  timeline?: string
  source?: {
    label: string
    href: string
  }
  sections: Section[]
}

export type ProjectContent = Project & {
}
