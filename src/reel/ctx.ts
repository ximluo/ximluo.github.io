import type { Catalog } from "../data/catalog"
import type { Entry } from "../data/types"
import type { Intro } from "../film/leader"
import type { Route } from "../routing"
import type { Store } from "../store"
import type { WallApi, WallRect } from "../wall/phantomwall"
import type { ReelDom } from "./dom"
import type { ReelState, Snap } from "./state"

/** Flags the sequences read and write but nothing renders. */
export interface Flags {
  idleT: number
  autoT: number
  /** The first selection after a reset repaints even when the entry is unchanged. */
  first: boolean
  busy: boolean
  dBusy: boolean
  stepBusy: boolean
  stepQ: number
  hoverId: string | null
  lastWallId: string | null
  /** The row a first tap on a phone selected, so the second tap opens it. */
  tapId: string | null
  /** The list row under the pointer. */
  hov: string | null
  /** The project was opened from the URL, so closing hides it instead of going back. */
  direct: boolean
  closing: boolean
}

export interface Ctx {
  store: Store<ReelState>
  dom: ReelDom
  cat: Catalog
  route: Route
  intro: Intro
  f: Flags
  hoverRect: Record<string, WallRect>
  wallApi: WallApi | null
  a: Actions
  /** Listener removers collected while the reel runs. */
  cleanups: (() => void)[]
}

export interface Actions {
  /* player */
  touch(): void
  select(w: Entry): void
  pick(w: Entry): Promise<void>
  stepPlayer(d: number, axis: "x" | "y", from?: number): Promise<boolean>
  setOff(axis: "X" | "Y", x: number, o: number): void
  /** Entry ids of the visible list rows, in list order. */
  visibleIds(): string[]
  /** Visible rows of open sections, in screen order. */
  order(): string[]
  /** Rows of open sections, the reel's order from the player. */
  homeIds(): string[]
  /** Info pages opened on a phone leave the player alone; everywhere else they take it over. */
  selectFor(w: Entry): void
  copyMail(el: HTMLElement): boolean
  /* list */
  setActive(id: string, o?: { scroll?: boolean; smooth?: boolean }): void
  toggleFold(key: string): void
  listClick(
    w: Entry,
    row: HTMLElement,
    e: {
      metaKey: boolean
      ctrlKey: boolean
      shiftKey: boolean
      /** The click count: a double-click's second click is ignored on a desktop. */
      detail: number
      preventDefault(): void
    },
  ): void
  listHover(w: Entry, row: HTMLElement): void
  listLeave(): void
  fitRows(): void
  /* project pane */
  projOpen(id: string): Promise<void>
  projJump(id: string): Promise<void>
  projGo(id: string): Promise<void>
  projNav(d: number): void
  projClose(): void
  projHide(): Promise<void>
  projReset(): void
  /* wall and detail */
  openWall(o?: { instant?: boolean }): Promise<void>
  closeWall(o?: { instant?: boolean; force?: boolean }): Promise<void>
  openDetail(id: string, o?: { instant?: boolean }): Promise<void>
  closeDetail(o?: { instant?: boolean; force?: boolean }): Promise<void>
  stepDetail(d: number): Promise<void>
  openArt(id: string): Promise<void>
  wallHover(id: string | null, rect: WallRect | null): void
  openFull(src?: string, alt?: string): void
  closeFull(): void
  /* phone sheet and bar */
  setSnap(k: Snap): void
  openMenu(k?: Snap): void
  closeMenu(): void
  menuOpen(): boolean
  barStep(d: number): void
  /* hud */
  togglePlayer(): Promise<void>
  wallBack(): Promise<void>
  navClose(): void
  /** The top-left name: the leader plays again and the reel returns to the Home card. */
  goHome(): Promise<void>
}

export const setBodyClass = (name: string, on: boolean) => document.body.classList.toggle(name, on)

/** The phone menu open over a project or the wall: a body class for the stylesheet and a flag for the bar. */
export function setMenuQ(ctx: Ctx, on: boolean) {
  setBodyClass("m-q", on)
  ctx.store.set({ menuQ: on })
}

/** The page controls leave while an open project scrolls down. */
export function syncScrolled(ctx: Ctx) {
  setBodyClass("pj-scrolled", ctx.store.get().projOn && ctx.dom.proj.scrollTop > 60)
}
