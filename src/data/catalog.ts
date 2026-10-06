/* The catalogue: every entry by id, the three rooms (Code, Art, Info) in their orders, the sections of the Code
   room with their numbering, and the one wall row that stands for all the art inside the project list.
   Built once from the data; nothing here is mutated afterwards. */
import { ART } from "./art"
import { PAGES, recognitionOf } from "./pages"
import { pad } from "../text"
import type { ArtEntry, Entry, PageEntry, SectionKey, WallEntry, WorkEntry } from "./types"
import { WORK } from "./work"

export type Room = "code" | "art" | "info"

export interface Section {
  key: SectionKey
  name: string
  i: number
  items: WorkEntry[]
  /** Rows counted in the section's "01 / 05": the wall row counts in Selected. */
  n: number
}

export interface Pos {
  i: number
  n: number
  room: Room
  sec?: Section
}

export const ROOM_NAME: Record<Room, string> = { code: "Code", art: "Art", info: "Info" }

const SECTION_NAMES: [SectionKey, string][] = [
  ["selected", "Selected"],
  ["graphics", "Computational Graphics"],
  ["software", "Software"],
  ["experiments", "Experiments"],
  ["research", "Research"],
]

export const WALL_ID = "__art"

export const roomOf = (e: Entry): Room =>
  e.kind === "art" ? "art" : e.kind === "page" ? "info" : "code"

function build() {
  const sections: Section[] = SECTION_NAMES.map(([key, name], i) => ({
    key,
    name,
    i,
    items: [],
    n: 0,
  }))
  const secByKey = new Map(sections.map((s) => [s.key, s]))
  const last = sections[sections.length - 1]!
  const secOfWork = (w: WorkEntry) => secByKey.get(w.section) ?? last

  const code = WORK.slice().sort((a, b) => secOfWork(a).i - secOfWork(b).i)
  const art = ART.slice()
  const info = PAGES.slice()
  const roomIndex = new Map<string, number>()
  const sectionIndex = new Map<string, number>()
  code.forEach((w, i) => {
    roomIndex.set(w.id, i)
    const s = secOfWork(w)
    sectionIndex.set(w.id, s.items.length)
    s.items.push(w)
    s.n = s.items.length
  })
  art.forEach((w, i) => roomIndex.set(w.id, i))
  info.forEach((p, i) => roomIndex.set(p.id, i))

  const selected = sections[0]!
  const artRow: WallEntry = {
    id: WALL_ID,
    kind: "wall",
    title: "Artworks",
    label: "Artwork",
    group: "Artworks",
    thumb: (art.find((w) => w.id === "photo-1") ?? art[0]!).thumb,
    year: "",
  }
  sectionIndex.set(WALL_ID, selected.items.length)
  selected.n = selected.items.length + 1

  const byId = new Map<string, Entry>()
  for (const e of [...code, ...art, ...info, artRow]) byId.set(e.id, e)
  const rooms: Record<Room, readonly Entry[]> = { code, art, info }

  const ri = (id: string) => roomIndex.get(id) ?? 0
  const si = (id: string) => sectionIndex.get(id)
  const secOf = (e: WorkEntry | WallEntry): Section => (e.kind === "wall" ? selected : secOfWork(e))
  const pos = (id: string): Pos => {
    const e = byId.get(id)
    if (!e || e.kind === "wall") return { i: 0, n: 0, room: "code" }
    if (e.kind === "work") {
      const s = secOfWork(e)
      return { i: (si(id) ?? 0) + 1, n: s.n, room: "code", sec: s }
    }
    const room = roomOf(e)
    return { i: ri(id) + 1, n: rooms[room].length, room }
  }
  const next = (id: string, d = 1): Entry => {
    const e = byId.get(id)!
    const L = rooms[roomOf(e)]
    return L[(ri(id) + d + L.length * 4) % L.length]!
  }
  const mediaList = () => {
    const seen: string[] = []
    art.forEach((w) => {
      if (!seen.includes(w.group)) seen.push(w.group)
    })
    return seen.map((k) => k.toLowerCase())
  }

  return {
    byId,
    code,
    art,
    info,
    sections,
    artRow,
    /** Index within the entry's room. */
    ri,
    /** Index within the section, for the Code room and the wall row. */
    si,
    /** The two-digit number shown beside a list row. */
    num: (e: Entry) => pad((si(e.id) ?? ri(e.id)) + 1),
    secOf,
    pos,
    next,
    recOf: recognitionOf,
    mediaList,
    get: (id: string) => byId.get(id),
    entry: (id: string) => byId.get(id)!,
    isPage: (e: Entry | null | undefined): e is PageEntry => !!e && e.kind === "page",
    isArt: (e: Entry | null | undefined): e is ArtEntry => !!e && e.kind === "art",
  }
}

export type Catalog = ReturnType<typeof build>

export const catalog: Catalog = build()
