/* The project pane: opens with a split cut beside the docked list, swaps pages through a horizontal cut, and
   keeps the browser history so Back closes it. */
import { trackProjectOpen } from "../analytics"
import { isPhone } from "../env"
import { split } from "../film/split"
import { setTint } from "../film/tint"
import { nav } from "../routing"
import type { Actions, Ctx } from "./ctx"
import { setBodyClass, setMenuQ, syncScrolled } from "./ctx"
import { saveSeen } from "./state"

export function createProject(ctx: Ctx) {
  const { store, dom, cat, f } = ctx
  const s = () => store.get()
  const on = () => s().projOn

  /** An info page that was open and is now left: its pill's mark goes grey for the rest of the session. */
  function leave(id: string | null) {
    if (!id || cat.get(id)?.kind !== "page" || s().seen.includes(id)) return
    const seen = [...s().seen, id]
    store.set({ seen })
    saveSeen(seen)
  }

  function change(id: string) {
    if (s().projId !== id) leave(s().projId)
    const w = cat.entry(id)
    store.set({ projId: id })
    setTint(w)
    nav.replaceOpen(id)
    ctx.a.selectFor(w)
    syncScrolled(ctx)
    trackProjectOpen(id, w.title, "project_pane")
  }

  const swapTo = (id: string) => split.swap(() => store.set({ pageId: id }), dom.proj)

  async function projOpen(id: string) {
    if (on()) return projJump(id)
    const w = cat.entry(id)
    store.set({ projOn: true, projId: id, pageId: id })
    setBodyClass("m-proj", true)
    setTint(w)
    if (!f.direct) nav.pushOpen(id)
    ctx.a.selectFor(w)
    syncScrolled(ctx)
    if (isPhone()) ctx.a.setSnap("peek")
    trackProjectOpen(id, w.title, "reel")
    await split.enter(dom.proj)
  }

  /** From the list while the pane is open: the entry changes at once, the page at the midpoint of the cut. */
  async function projJump(id: string) {
    if (id === s().projId) return
    change(id)
    await swapTo(id)
  }

  /** From inside a page (Next up, Then, a recognition link). */
  async function projGo(id: string) {
    if (!cat.get(id) || id === s().projId) return
    const p = swapTo(id)
    change(id)
    await p
  }

  function projNav(d: number) {
    const id = s().projId
    if (!id) return
    void projGo(cat.next(id, d).id)
  }

  function onHide() {
    ctx.a.closeFull()
    if (isPhone()) ctx.a.setSnap("peek")
    setMenuQ(ctx, false)
  }

  function projClose() {
    if (nav.openedHere() && !f.direct) history.back()
    else void projHide()
  }

  async function projHide() {
    if (!on() || f.closing) return
    f.closing = true
    leave(s().projId)
    onHide()
    setBodyClass("m-proj", false)
    await split.leave(dom.proj)
    f.closing = false
    f.direct = false
    store.set({ projOn: false, projId: null, pageId: null })
    nav.clear()
  }

  /* instant teardown, used while the leader covers the screen */
  function projReset() {
    if (!on()) return
    leave(s().projId)
    onHide()
    setBodyClass("m-proj", false)
    dom.proj.hidden = true
    dom.proj.style.clipPath = ""
    f.closing = false
    f.direct = false
    store.set({ projOn: false, projId: null, pageId: null })
  }

  function attach() {
    const onPop = () => {
      if (on()) void projHide()
    }
    addEventListener("popstate", onPop)
    /* the pills leave while the page scrolls down and come back on any scroll up, or near the top */
    let lastTop = 0
    const onScroll = () => {
      const t = dom.proj.scrollTop
      const down = t > lastTop + 2
      const up = t < lastTop - 2
      lastTop = t
      if (!on() || t <= 60 || up) setBodyClass("pj-scrolled", false)
      else if (down) setBodyClass("pj-scrolled", true)
    }
    dom.proj.addEventListener("scroll", onScroll, { passive: true })
    ctx.cleanups.push(() => {
      removeEventListener("popstate", onPop)
      dom.proj.removeEventListener("scroll", onScroll)
    })
  }

  const actions = {
    projOpen,
    projJump,
    projGo,
    projNav,
    projClose,
    projHide,
    projReset,
  } satisfies Partial<Actions>
  return { actions, attach }
}
