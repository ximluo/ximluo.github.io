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
  sections: Section[]
}

export type ProjectContent = Project & {
  categories: string[]
}
