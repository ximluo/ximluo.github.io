export interface Section {
  text?: string
  image?: string
  video?: string
}

export interface Project {
  id: string
  name: string
  image: string
  description: string
  languages: string[]
  categories: string[]
  sections: Section[]
}
