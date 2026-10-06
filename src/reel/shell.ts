/* The frame around the player: the phone sheet and menu, the bottom bar's stepping, the keyboard, the HUD buttons
   and the home replay. */
import { trackExternalLink } from "../analytics"
import type { Entry } from "../data/types"
import { isPhone } from "../env"
import { clamp } from "../film/tween"
import { nav } from "../routing"
import type { Actions, Ctx } from "./ctx"
import { setBodyClass, setMenuQ } from "./ctx"
import type { Snap } from "./state"

const SNAPS: Snap[] = ["peek", "half", "full"]

export function createShell(ctx: Ctx, home: () => Entry) {
  const { store, dom, cat, f } = ctx
  const s = () => store.get()
  const a = ctx.a

  /* ---------- phone sheet ---------- */
  const barH = () => dom.mbar.offsetHeight || 66
  const topH = () =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--top")) || 42
  const H = (): Record<Snap, number> => ({
    peek: 0,
    half: Math.round(innerHeight * 0.56),
    full: innerHeight - barH() - topH() - 8,
  })
  function setSnap(k: Snap) {
    store.set({ snap: k })
    dom.side.style.setProperty("--sh", H()[k] + "px")
    dom.side.classList.toggle("peek", k === "peek")
    if (k === "peek" && (s().projOn || s().view === "wall")) setMenuQ(ctx, false)
  }
  const overlay = () => s().projOn || s().view === "wall"
  const menuOpen = () => (overlay() ? s().menuQ : s().snap !== "peek")
  function openMenu(k: Snap = "half") {
    if (overlay()) setMenuQ(ctx, true)
    setSnap(k)
    setTimeout(() => {
      const c = s().cur
      if (c && menuOpen()) a.setActive(c.id, { scroll: true })
    }, 400)
  }
  function closeMenu() {
    if (overlay()) setMenuQ(ctx, false)
    setSnap("peek")
  }

  function barStep(d: number) {
    if (s().projOn) {
      a.projNav(d)
      return
    }
    if (s().view === "wall") {
      if (s().detailId) void a.stepDetail(d)
      return
    }
    if (a.homeIds().length < 2) return
    void a.stepPlayer(d, "x")
  }

  /* ---------- HUD ---------- */
  async function togglePlayer() {
    if (s().view === "wall") {
      if (s().detailId) await a.closeDetail({ instant: true })
      void a.closeWall()
      setSnap("peek")
    } else if (s().projOn) a.projClose()
    else if (isPhone()) setSnap("peek")
  }
  async function wallBack() {
    if (s().detailId) {
      void a.closeDetail()
      return
    }
    await a.closeWall()
    setSnap("peek")
  }
  function navClose() {
    if (s().projOn) a.projClose()
    else if (s().detailId) void a.closeDetail()
    else if (s().view === "wall") void a.closeWall()
  }

  /* ---------- home: the top-left name replays the opening and returns to the start ---------- */
  async function resetHome() {
    a.closeFull()
    a.projReset()
    if (s().view === "wall") await a.closeWall({ instant: true, force: true })
    for (const c of ["lb", "cutting", "m-wall"]) setBodyClass(c, false)
    setMenuQ(ctx, false)
    setSnap("peek")
    a.setOff("Y", 0, 1)
    f.idleT = -1e9
    f.first = true
    a.select(home())
    const sc = dom.blist.querySelector(".lu-scroll")
    if (sc) sc.scrollTop = 0
    nav.clear()
  }
  async function goHome() {
    if (ctx.intro.on || f.busy || f.dBusy || f.stepBusy) return
    store.set({ started: false })
    await ctx.intro.run({ onCover: resetHome })
    store.set({ started: true })
    f.autoT = performance.now()
  }

  /* ---------- keys: the app layer first, then the open project's, both ahead of the leader and the wall ---------- */
  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement | null
    if (t && /input|textarea/i.test(t.tagName)) return
    const st = s()
    if (st.av) {
      e.stopImmediatePropagation()
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        a.closeFull()
      }
      return
    }
    if (e.key === "Escape" && st.menuQ) {
      e.stopImmediatePropagation()
      closeMenu()
      return
    }
    if (st.view === "wall") {
      if (st.detailId) {
        if (e.key === "Escape" || e.key === "Backspace") {
          e.preventDefault()
          void a.closeDetail()
        } else if (e.key === "ArrowRight" || e.key === "j") {
          e.preventDefault()
          void a.stepDetail(1)
        } else if (e.key === "ArrowLeft" || e.key === "k") {
          e.preventDefault()
          void a.stepDetail(-1)
        } else if (e.key === "v" || e.key === "f") a.openFull()
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        void a.closeWall()
      } else if (e.key === "Enter" && !t?.closest("button")) {
        e.preventDefault()
        void a.openDetail(f.hoverId || f.lastWallId || cat.art[0]!.id)
      }
      return
    }
    if (st.projOn) {
      if (t && /select/i.test(t.tagName)) return
      if (e.key === "ArrowRight" || e.key === "j" || e.key === "J") {
        e.preventDefault()
        a.projNav(1)
      } else if (e.key === "ArrowLeft" || e.key === "k" || e.key === "K") {
        e.preventDefault()
        a.projNav(-1)
      } else if (e.key === "Escape" || e.key === "Backspace") a.projClose()
      return
    }
    if (!st.started) return
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      a.touch()
      const v = a.visibleIds()
      const k = v.indexOf(st.cur?.id ?? "")
      const n = v[clamp(k + (e.key === "ArrowDown" ? 1 : -1), 0, v.length - 1)]
      if (n) a.select(cat.entry(n))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (st.cur) void a.pick(st.cur)
    }
  }

  function attach() {
    const { side } = dom
    addEventListener("keydown", onKey, true)
    const onResize = () => {
      store.set({ phone: isPhone() })
      setSnap(s().snap)
    }
    addEventListener("resize", onResize)
    setSnap("peek")

    /* swipe the sheet: the handle always drags; the list body drags when pulled down from its top, or pulled up while
       the sheet is not full */
    const rubber = (h: number) => {
      const k = H()
      return h > k.full
        ? k.full + (h - k.full) * 0.22
        : h < k.peek
          ? k.peek - (k.peek - h) * 0.22
          : h
    }
    interface Drag {
      x: number
      y: number
      oy: number
      h: number
      last: number
      mode: "sheet" | null
      handle: boolean
      moved: number
      snap0: Snap
      v: number
      pt: number
      py: number
    }
    let ds: Drag | null = null
    const dsEnd = (cancel: boolean) => {
      if (!ds) return
      const d = ds
      ds = null
      side.classList.remove("drag")
      if (d.mode !== "sheet") return
      const k = H()
      const snap = s().snap
      if (!d.moved && d.handle) {
        setSnap(snap === "peek" ? "half" : snap === "half" ? "full" : "peek")
        return
      }
      const cur = clamp(d.last, k.peek, k.full)
      const v = d.v
      const i0 = SNAPS.indexOf(d.snap0)
      let tgt: Snap
      if (cancel) tgt = d.snap0
      else if (Math.abs(v) > 0.6) tgt = SNAPS[clamp(i0 + (v > 0 ? 1 : -1), 0, 2)]!
      else {
        const want = cur + v * 200
        tgt = SNAPS.slice().sort((p, q) => Math.abs(k[p] - want) - Math.abs(k[q] - want))[0]!
      }
      setSnap(tgt)
    }
    const onStart = (e: TouchEvent) => {
      const body = document.body
      if (
        !isPhone() ||
        e.touches.length !== 1 ||
        (body.classList.contains("m-proj") && !body.classList.contains("m-q"))
      ) {
        ds = null
        return
      }
      const t = e.touches[0]!
      const handle = !!(e.target as Element).closest(".sd-grab")
      a.touch()
      ds = {
        x: t.clientX,
        y: t.clientY,
        oy: t.clientY,
        h: side.offsetHeight,
        last: side.offsetHeight,
        mode: handle ? "sheet" : null,
        handle,
        moved: 0,
        snap0: s().snap,
        v: 0,
        pt: performance.now(),
        py: t.clientY,
      }
      if (handle) side.classList.add("drag")
    }
    const onMove = (e: TouchEvent) => {
      if (!ds) return
      const t = e.touches[0]!
      const now = performance.now()
      if (!ds.mode) {
        const dx = t.clientX - ds.x
        const dy = ds.y - t.clientY
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
        if (Math.abs(dx) > Math.abs(dy)) {
          ds = null
          return
        }
        const sc = side.querySelector(".lu-scroll")
        const atTop = !sc || sc.scrollTop <= 0
        if (dy < 0 && atTop) ds.mode = "sheet"
        else if (dy > 0 && s().snap !== "full") ds.mode = "sheet"
        else {
          ds = null
          return
        }
        ds.oy = t.clientY
        ds.h = side.offsetHeight
        side.classList.add("drag")
      }
      const dy = ds.oy - t.clientY
      ds.moved = Math.max(ds.moved, Math.abs(ds.y - t.clientY))
      if (e.cancelable) e.preventDefault()
      ds.last = ds.h + dy
      side.style.setProperty("--sh", rubber(ds.last) + "px")
      if (now - ds.pt > 16) {
        ds.v = ((ds.py - t.clientY) / (now - ds.pt)) * 0.6 + ds.v * 0.4
        ds.pt = now
        ds.py = t.clientY
      }
    }
    const onEnd = () => dsEnd(false)
    const onCancel = () => dsEnd(true)
    side.addEventListener("touchstart", onStart, { passive: true })
    side.addEventListener("touchmove", onMove, { passive: false })
    side.addEventListener("touchend", onEnd)
    side.addEventListener("touchcancel", onCancel)

    /* outbound links, wherever they sit */
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[target="_blank"]')
      if (link)
        trackExternalLink(
          link.href,
          link.closest("#proj") ? "project_page" : link.closest("#hud") ? "hud" : "page",
        )
    }
    document.addEventListener("click", onClick)

    ctx.cleanups.push(() => {
      removeEventListener("keydown", onKey, true)
      removeEventListener("resize", onResize)
      side.removeEventListener("touchstart", onStart)
      side.removeEventListener("touchmove", onMove)
      side.removeEventListener("touchend", onEnd)
      side.removeEventListener("touchcancel", onCancel)
      document.removeEventListener("click", onClick)
    })
  }

  const actions = {
    setSnap,
    openMenu,
    closeMenu,
    menuOpen,
    barStep,
    togglePlayer,
    wallBack,
    navClose,
    goHome,
  } satisfies Partial<Actions>
  return { actions, attach }
}
