/* The artwork wall in the right panel, the enlarged piece over it, and the full-image overlay. */
import type { ArtEntry } from "../data/types"
import { isHandheld, isPhone, TOUCH } from "../env"
import { flash } from "../film/film"
import { split } from "../film/split"
import { eio, eout, tween, wait } from "../film/tween"
import { heroOf, thumbOf } from "../media"
import { artPath } from "../paths"
import { nav } from "../routing"
import { mountPhantomWall, type WallItem, type WallTheme } from "../wall/phantomwall"
import type { Actions, Ctx } from "./ctx"
import { setBodyClass, syncScrolled } from "./ctx"

export const WALL_THEME: WallTheme = {
  bg: "#0e0f12",
  line: "rgba(255,255,255,.16)",
  ink: "#e9e6e1",
  accent: "#d4201c",
  mono: '"B612 Mono", monospace',
}

export function createWall(ctx: Ctx) {
  const { store, dom, cat, f } = ctx
  const s = () => store.get()
  const AR = cat.artRow
  const ART = cat.art
  const items: WallItem[] = ART.map((w) => ({
    id: w.id,
    title: w.title,
    group: w.group,
    year: w.year,
    award: w.award,
    thumb: thumbOf(w),
  }))

  let hideT = 0
  function wallHover(
    id: string | null,
    rect: { x: number; y: number; w: number; h: number } | null,
  ) {
    if (s().detailId) return
    if (id && rect) ctx.hoverRect[id] = rect
    clearTimeout(hideT)
    if (id) {
      f.hoverId = f.lastWallId = id
      store.set({ lineId: id, lineOn: true })
    } else
      hideT = window.setTimeout(
        () => {
          f.hoverId = null
          store.set({ lineOn: false })
        },
        TOUCH ? 220 : 60,
      )
  }

  function mountWall() {
    if (ctx.wallApi) return
    ctx.wallApi = mountPhantomWall(dom.awWall, {
      items,
      hint: false,
      captureWheel: true,
      theme: WALL_THEME,
      onOpen: (id) => {
        if (!s().detailId && !f.dBusy) {
          f.lastWallId = id
          void openDetail(id)
        }
      },
      onHover: wallHover,
    })
    if (f.lastWallId) ctx.wallApi.focus(f.lastWallId)
  }
  function unmountWall() {
    if (!ctx.wallApi) return
    try {
      ctx.wallApi.destroy()
    } catch {
      /* already gone */
    }
    ctx.wallApi = null
    f.hoverId = null
    store.set({ lineOn: false })
  }

  async function openWall(o: { instant?: boolean } = {}) {
    if (f.busy || s().view === "wall") return
    f.busy = true
    ctx.a.touch()
    ctx.a.select(AR)
    if (!o.instant) dom.awp.style.clipPath = "inset(0 50% 0 50%)"
    /* m-wall docks the list at 340px like m-proj does; the pane itself is revealed with the same split cut as a project page */
    setBodyClass("cutting", true)
    setBodyClass("m-wall", true)
    store.set({ view: "wall" })
    document.body.dataset.view = "wall"
    ctx.a.setActive(AR.id, { scroll: true })
    if (isPhone()) ctx.a.setSnap("peek")
    mountWall()
    syncScrolled(ctx)
    nav.replace(artPath())
    if (!o.instant) await split.enter(dom.awp)
    else dom.awp.style.clipPath = ""
    setBodyClass("cutting", false)
    f.busy = false
  }

  async function closeWall(o: { instant?: boolean; force?: boolean } = {}) {
    if (s().view !== "wall" || (f.busy && !o.force)) return
    f.busy = true
    if (s().detailId) await closeDetail({ instant: true, force: o.force })
    setBodyClass(
      "m-wall",
      false,
    ) /* the list widens while the pane closes, as a project page does */
    if (!o.instant) {
      setBodyClass("cutting", true)
      await split.leave(dom.awp)
    }
    unmountWall()
    store.set({ view: "code" })
    document.body.dataset.view = "code"
    dom.awp.hidden = false
    setBodyClass("cutting", false)
    dom.awp.style.clipPath = ""
    f.first = true
    ctx.a.select(AR)
    nav.replace(null)
    f.busy = false
  }

  /* ---- enlarged detail (same panel) ---- */
  function fitDetail() {
    const { adImg, adFig } = dom
    const nw = adImg.naturalWidth
    const nh = adImg.naturalHeight
    if (!nw || !adFig.clientWidth) return
    const ph = isHandheld()
    const aw = adFig.clientWidth - (ph ? 36 : 68)
    const ah = adFig.clientHeight - (ph ? 48 : 68)
    const sc = Math.min(aw / nw, ah / nh, 2.4)
    adImg.style.width = Math.round(nw * sc) + "px"
    adImg.style.height = Math.round(nh * sc) + "px"
  }
  async function loadImg(w: ArtEntry) {
    const p = new Image()
    p.src = heroOf(w)
    await Promise.race([p.decode().catch(() => 0), wait(900)])
    dom.adImg.src = p.src
    fitDetail()
  }
  const originOf = (id: string): [number, number] => {
    const r = ctx.hoverRect[id]
    return r ? [r.x + r.w / 2, r.y + r.h / 2] : [dom.awp.clientWidth / 2, dom.awp.clientHeight / 2]
  }
  const refocus = () => {
    dom.adFig.classList.remove("foc")
    void dom.adFig.offsetWidth
    dom.adFig.classList.add("foc")
  }

  async function openDetail(id: string, o: { instant?: boolean } = {}) {
    if (f.dBusy || s().detailId || s().view !== "wall") return
    const w = cat.get(id)
    if (!cat.isArt(w)) return
    f.dBusy = true
    f.lastWallId = id
    setBodyClass("m-ad", true)
    store.set({ detailId: id })
    await loadImg(w)
    store.set({ adShown: true, lineOn: false })
    fitDetail()
    syncScrolled(ctx)
    nav.replace(artPath(id))
    const { ad, adSheet, adFig, awp } = dom
    if (!o.instant) {
      if (isHandheld()) {
        adSheet.style.transform = "translateY(100%)"
        await tween(360, (e) => (adSheet.style.transform = `translateY(${(1 - e) * 100}%)`), {
          fps: 18,
          ease: eout,
        })
        adSheet.style.transform = ""
      } else {
        const [x, y] = originOf(id)
        const Rr = Math.hypot(Math.max(x, awp.clientWidth - x), Math.max(y, awp.clientHeight - y))
        await tween(
          420,
          (e) => {
            ad.style.clipPath = `circle(${e * Rr}px at ${x}px ${y}px)`
            adFig.style.transform = `scale(${0.9 + 0.1 * e})`
          },
          { fps: 30, ease: eout },
        )
        ad.style.clipPath = ""
        adFig.style.transform = ""
      }
    }
    refocus()
    f.dBusy = false
  }

  async function closeDetail(o: { instant?: boolean; force?: boolean } = {}) {
    const id = s().detailId
    if (!id || (f.dBusy && !o.force)) return
    f.dBusy = true
    const { ad, adSheet, adFig, awp } = dom
    if (!o.instant) {
      if (isHandheld())
        await tween(300, (e) => (adSheet.style.transform = `translateY(${e * 100}%)`), { fps: 18 })
      else {
        const [x, y] = originOf(id)
        const Rr = Math.hypot(Math.max(x, awp.clientWidth - x), Math.max(y, awp.clientHeight - y))
        await tween(
          320,
          (e) => {
            ad.style.clipPath = `circle(${(1 - e) * Rr}px at ${x}px ${y}px)`
            adFig.style.transform = `scale(${1 - 0.06 * e})`
          },
          { fps: 30 },
        )
      }
    }
    ad.style.clipPath = ""
    adFig.style.transform = ""
    adSheet.style.transform = ""
    setBodyClass("m-ad", false)
    store.set({ adShown: false, detailId: null })
    dom.adImg.removeAttribute("src")
    syncScrolled(ctx)
    nav.replace(artPath())
    ctx.wallApi?.focus(id)
    f.dBusy = false
  }

  async function stepDetail(d: number) {
    const cur = s().detailId
    if (!cur || f.dBusy) return
    f.dBusy = true
    const w = ART[(cat.ri(cur) + d + ART.length) % ART.length]!
    const px = isHandheld() ? 0.5 : 1
    const { adFig, adSide } = dom
    const pre = new Image()
    pre.src = heroOf(w)
    await tween(
      150,
      (e) => {
        adFig.style.transform = `translateX(${-d * e * 90 * px}px)`
        adFig.style.opacity = String(1 - e)
        adSide.style.opacity = String(1 - e)
      },
      { fps: 18, ease: eio },
    )
    f.lastWallId = w.id
    store.set({ detailId: w.id })
    await Promise.race([pre.decode().catch(() => 0), wait(900)])
    dom.adImg.src = pre.src
    fitDetail()
    syncScrolled(ctx)
    nav.replace(artPath(w.id))
    ctx.wallApi?.focus(w.id)
    refocus()
    adFig.style.transform = `translateX(${d * 90 * px}px)`
    await tween(
      220,
      (e) => {
        adFig.style.transform = `translateX(${d * (1 - e) * 90 * px}px)`
        adFig.style.opacity = String(e)
        adSide.style.opacity = String(e)
      },
      { fps: 18, ease: eout },
    )
    adFig.style.transform = ""
    adFig.style.opacity = ""
    adSide.style.opacity = ""
    f.dBusy = false
  }

  /* full image overlay: art detail, and any figure on a project page */
  function openFull(src?: string, alt?: string) {
    const id = s().detailId
    const w = id ? cat.get(id) : undefined
    const url = src || (cat.isArt(w) ? heroOf(w) : "")
    if (!url) return
    store.set({ av: { src: url, alt: alt || "" } })
    flash(0.1)
  }
  const closeFull = () => {
    if (s().av) store.set({ av: null })
  }

  async function openArt(id: string) {
    if (s().projOn) {
      ctx.a.projClose()
      for (let i = 0; i < 40 && s().projOn; i++) await wait(50)
    }
    await openWall()
    f.lastWallId = id
    await openDetail(id)
  }

  function attach() {
    const { adImg, adFig, adSheet, adSide } = dom
    const onResize = () => s().detailId && fitDetail()
    addEventListener("resize", onResize)
    adImg.addEventListener("load", fitDetail)
    const ro =
      "ResizeObserver" in window ? new ResizeObserver(() => s().detailId && fitDetail()) : null
    ro?.observe(adFig)
    /* phone swipes on the sheet */
    let sw: { x: number; y: number; dy: number; dx: number; t: number } | null = null
    const onStart = (e: TouchEvent) => {
      if ((e.target as Element).closest(".ad-side") && adSide.scrollTop > 0) {
        sw = null
        return
      }
      const t = e.touches[0]!
      sw = { x: t.clientX, y: t.clientY, dy: 0, dx: 0, t: performance.now() }
    }
    const onMove = (e: TouchEvent) => {
      if (!sw) return
      const t = e.touches[0]!
      sw.dx = t.clientX - sw.x
      sw.dy = t.clientY - sw.y
      if (sw.dy > 10 && sw.dy > Math.abs(sw.dx) && adSide.scrollTop <= 0)
        adSheet.style.transform = `translateY(${sw.dy}px)`
    }
    const onEnd = () => {
      if (!sw) return
      const g = sw
      sw = null
      if (g.dy > 80 && g.dy > Math.abs(g.dx)) {
        adSheet.style.transform = ""
        void closeDetail()
        return
      }
      adSheet.style.transform = ""
      if (Math.abs(g.dx) > 60 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6)
        void stepDetail(g.dx < 0 ? 1 : -1)
    }
    adSheet.addEventListener("touchstart", onStart, { passive: true })
    adSheet.addEventListener("touchmove", onMove, { passive: true })
    adSheet.addEventListener("touchend", onEnd)
    ctx.cleanups.push(() => {
      removeEventListener("resize", onResize)
      adImg.removeEventListener("load", fitDetail)
      ro?.disconnect()
      adSheet.removeEventListener("touchstart", onStart)
      adSheet.removeEventListener("touchmove", onMove)
      adSheet.removeEventListener("touchend", onEnd)
      unmountWall()
    })
  }

  const actions = {
    openWall,
    closeWall,
    openDetail,
    closeDetail,
    stepDetail,
    openArt,
    wallHover,
    openFull,
    closeFull,
  } satisfies Partial<Actions>
  return { actions, attach }
}
