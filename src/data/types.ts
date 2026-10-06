/* The site's content model. Entries come in four kinds: work (projects, in sections), art (pieces on the wall),
   page (About and Recognition, rendered by their own components) and the single wall row that stands in for all
   the art inside the project list. */

export type SectionKey = "selected" | "graphics" | "software" | "experiments" | "research"

export type FxName = "code-apple"

/** An image in a story block: a path under /media, or a sized image. */
export type ImgRef = string | { src: string; w: number; h: number; alt?: string }

/** One story block on a project page. `h` is a heading when it stands alone and a pixel height beside `img`. */
export type Block =
  | { p: string }
  | { h: string }
  | { img: string; w?: number; h?: number; alt?: string; cap?: string }
  | { row: ImgRef[]; cap?: string }
  | { embed: string; cap?: string }
  | { live: string; poster?: string; cap?: string }
  | { link: string; cap?: string }

export interface WorkEntry {
  id: string
  kind: "work"
  section: SectionKey
  /** Short name shown in the list (the title when empty). */
  label: string
  /** Small label beside the list row. */
  meta: string
  group: string
  title: string
  sub: string
  year: string
  tags: string[]
  tagline: string
  /** [label, href] pairs for the Links row of the page. */
  links?: [string, string][]
  summary?: string
  hero: string
  thumb: string
  blocks: Block[]
  /** A page with no hero and only a lead paragraph. */
  minimal?: boolean
  /** A canvas effect drawn in place of the hero image. */
  fx?: FxName
}

export interface ArtEntry {
  id: string
  kind: "art"
  group: string
  title: string
  sub: string
  /** Free text, or `Link: host/path` for a link shown in its place. */
  award: string
  tagline: string
  hero: string
  thumb: string
  year: string
}

export type PageId = "about" | "recognition"

export interface PageEntry {
  id: PageId
  kind: "page"
  title: string
  sub: string
  kick: string
  tagline: string
  /** Lines of the typographic card shown in the player. */
  card: string[]
  /** Rows of the player's meta grid. */
  meta: [string, string][]
}

export interface WallEntry {
  id: "__art"
  kind: "wall"
  title: "Artworks"
  label: "Artwork"
  group: "Artworks"
  thumb: string
  year: ""
}

export type Entry = WorkEntry | ArtEntry | PageEntry | WallEntry

export interface Experience {
  org: string
  role: string
  year: string
  kind: "work" | "teach" | "lead" | "award"
}

export type RecognitionType = "award" | "fellowship" | "exhibition" | "scholarship" | "residency"

export interface Recognition {
  type: RecognitionType
  year: string
  title: string
  org: string
  detail: string
  link: string
  /** Ids of the works or pieces this belongs to. */
  works: string[]
  /** Shown under Highlights. */
  top?: true
  /** Folded under Earlier. */
  early?: true
}

/** Average thumbnail colour per thumb path, used for the page tint. */
export type Tints = Record<string, [number, number, number]>
