/* Wires the reel together: one store React renders from, the elements the components register, and the typed
   sequences that drive them. `start()` runs once everything is mounted and plays the opening. */
import { catalog } from "../data/catalog"
import type { Entry } from "../data/types"
import { isPhone } from "../env"
import { startFilm } from "../film/film"
import { createIntro, type Intro } from "../film/leader"
import { artPath, INDEX_PATH, openPath } from "../paths"
import { nav, type Route } from "../routing"
import type { Store } from "../store"
import type { Actions, Ctx } from "./ctx"
import type { ReelDom } from "./dom"
import { createList } from "./list"
import { createPlayer } from "./player"
import { createProject } from "./project"
import { createShell } from "./shell"
import { readListMemory, readSeen, type ReelState } from "./state"
import { createWall } from "./wall"

export interface Reel {
  actions: Actions
  start(): void
  destroy(): void
}

/** The entry the URL asks for, when it is a project or an info page. */
function directEntry(route: Route): Entry | null {
  const e = route.open ? catalog.get(route.open) : undefined
  return e && (e.kind === "work" || e.kind === "page") ? e : null
}

/** The first frame: the deep-linked entry (info pages stay off a phone's player) or the first Selected work. */
export function homeEntry(route: Route): Entry {
  const direct = directEntry(route)
  return direct && !(direct.kind === "page" && isPhone()) ? direct : catalog.sections[0]!.items[0]!
}

export function initialState(route: Route): ReelState {
  return {
    started: false,
    phone: isPhone(),
    cur: homeEntry(route),
    curPhone: isPhone(),
    selectTick: 0,
    view: "code",
    lineId: null,
    lineOn: false,
    detailId: null,
    adShown: false,
    projOn: false,
    projId: null,
    pageId: null,
    snap: "peek",
    menuQ: false,
    av: null,
    activeId: null,
    listHov: false,
    fold: readListMemory().fold ?? {},
    tight: [],
    seen: readSeen(),
  }
}

export function createReel(store: Store<ReelState>, dom: ReelDom, route: Route): Reel {
  const ctx: Ctx = {
    store,
    dom,
    cat: catalog,
    route,
    intro: null as unknown as Intro,
    f: {
      idleT: -1e9,
      autoT: performance.now(),
      first: true,
      busy: false,
      dBusy: false,
      stepBusy: false,
      stepQ: 0,
      hoverId: null,
      lastWallId: null,
      tapId: null,
      hov: null,
      direct: false,
      closing: false,
    },
    hoverRect: {},
    wallApi: null,
    a: {} as Actions,
    cleanups: [],
  }
  const list = createList(ctx)
  const player = createPlayer(ctx)
  const project = createProject(ctx)
  const wall = createWall(ctx)
  const shell = createShell(ctx, player.home)
  Object.assign(ctx.a, list.actions, player.actions, project.actions, wall.actions, shell.actions)
  let stopFilm = () => {}

  async function startup() {
    const a = ctx.a
    const openE = route.open ? catalog.get(route.open) : undefined
    const artQ = route.art || openE?.kind === "art"
    const artId = route.artId || (openE?.kind === "art" ? openE.id : "")
    const direct = directEntry(route)
    /* a link of the old shape: the address becomes the path it means */
    if (route.legacy)
      nav.replace(
        direct
          ? openPath(direct.id)
          : artQ
            ? artPath(artId && catalog.get(artId)?.kind === "art" ? artId : "")
            : route.index
              ? INDEX_PATH
              : null,
      )
    a.select(homeEntry(route))
    if (route.noIntro) dom.leader.hidden = true
    else await ctx.intro.run()
    store.set({ started: true })
    ctx.f.autoT = performance.now()
    if (route.index) {
      a.touch()
      store.set({ fold: Object.fromEntries(catalog.sections.map((s) => [s.key, false])) })
      if (isPhone()) a.setSnap("full")
    }
    if (direct) {
      a.touch()
      ctx.f.direct = true
      void a.projOpen(direct.id)
    }
    if (artQ && !direct) {
      await a.openWall({ instant: true })
      if (artId && catalog.get(artId)?.kind === "art") {
        ctx.f.lastWallId = artId
        await a.openDetail(artId, { instant: true })
      }
    }
  }

  return {
    actions: ctx.a,
    start() {
      ctx.intro = createIntro(dom.leader)
      stopFilm = startFilm(dom.grain, dom.cursor, dom.flash)
      list.attach()
      player.attach()
      project.attach()
      wall.attach()
      shell.attach()
      void startup()
    },
    destroy() {
      stopFilm()
      ctx.cleanups.forEach((f) => f())
      ctx.cleanups.length = 0
    },
  }
}
