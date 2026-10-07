import type { Entry } from "../data/types"

export type View = "code" | "wall"
export type Snap = "peek" | "half" | "full"

/** The parts of the reel's state that React renders from. Transient animation state stays on the elements. */
export interface ReelState {
  /** The leader has finished (or was skipped); interaction and auto-advance are live. */
  started: boolean
  /** The phone layout (window at or under 760px), kept live on resize. */
  phone: boolean
  /** What the player shows. */
  cur: Entry | null
  /** Whether the phone layout was on when `cur` was selected; the caption copy differs. */
  curPhone: boolean
  /** Bumps on every selection so the caption animation restarts. */
  selectTick: number
  view: View
  /** The wall's hover line: the piece it names, and whether it is showing. */
  lineId: string | null
  lineOn: boolean
  /** The enlarged piece, and whether its dialog is visible yet (it waits for the image). */
  detailId: string | null
  adShown: boolean
  /** The project pane: open, the current entry (tint, history, nav labels), and the rendered page, which
      swaps at the midpoint of the split cut. */
  projOn: boolean
  projId: string | null
  pageId: string | null
  /** The phone sheet position and whether the menu is open over a project or the wall. */
  snap: Snap
  menuQ: boolean
  /** The full-image overlay. */
  av: { src: string; alt: string } | null
  /** The project list: the lit row, hover dimming, folded sections and rows whose label had to go. */
  activeId: string | null
  listHov: boolean
  fold: Readonly<Record<string, boolean>>
  tight: readonly string[]
  /** Info pages opened and then left in this session; their pill's mark is grey. */
  seen: readonly string[]
}

export const LIST_STORE_KEY = "np-l2-sec"

export interface ListMemory {
  fold?: Record<string, boolean>
  top?: number
}

export function readListMemory(): ListMemory {
  try {
    const raw = sessionStorage.getItem(LIST_STORE_KEY)
    return raw ? (JSON.parse(raw) as ListMemory) : {}
  } catch {
    return {}
  }
}

export function saveListMemory(m: ListMemory) {
  try {
    sessionStorage.setItem(LIST_STORE_KEY, JSON.stringify(m))
  } catch {
    /* storage may be unavailable */
  }
}

export const SEEN_STORE_KEY = "np-seen"

export function readSeen(): string[] {
  try {
    const raw = sessionStorage.getItem(SEEN_STORE_KEY)
    const v: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

export function saveSeen(ids: readonly string[]) {
  try {
    sessionStorage.setItem(SEEN_STORE_KEY, JSON.stringify(ids))
  } catch {
    /* storage may be unavailable */
  }
}
