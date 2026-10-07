/* The site's content model. Entries come in five kinds: work (projects, in sections), art (pieces on the wall),
   page (About and Recognition, rendered by their own components), the single wall row that stands in for all
   the art inside the project list, and the title card the reel opens on. */

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

/** The title card: the first frame of the reel, listed as the Home row above Selected. */
export interface HomeEntry {
  id: "home"
  kind: "home"
  title: "Home"
  label: "Home"
  /** The row's label on the right, like a page's `sub`. */
  sub: "Title card"
  year: ""
}

export type Entry = WorkEntry | ArtEntry | PageEntry | WallEntry | HomeEntry

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
