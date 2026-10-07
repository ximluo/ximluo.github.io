/* The player: what is showing, the hero image stack, the reel's auto-advance, and stepping through the order by
   wheel, swipe or button. */
import { AB } from "../data/about"
import type { ArtEntry, Entry, WorkEntry } from "../data/types"
import { isPhone } from "../env"
import { addFrameHook, flash } from "../film/film"
import { setTint } from "../film/tint"
import { clamp, eio, eout, tween, wait } from "../film/tween"
import { heroOf } from "../media"
import type { Actions, Ctx } from "./ctx"
import { setBodyClass, setMenuQ, syncScrolled } from "./ctx"

/** A frame plays for AUTO_MS once the visitor has been idle for IDLE_MS. */
export const AUTO_MS = 5200
export const IDLE_MS = 8000

export function createPlayer(ctx: Ctx) {
  const { store, dom, cat, f } = ctx
  const AR = cat.artRow
  /** The reel of the first screen: the title card, the Selected works and the wall row. */
  const SEL: Entry[] = [cat.home, ...cat.sections[0]!.items, AR]
  const imgs = new Map<string, HTMLImageElement>()
  const s = () => store.get()

  /* any interaction pauses the reel; it resumes IDLE_MS after the last one */
  const touch = () => {
    f.idleT = performance.now()
  }

  function imgFor(w: WorkEntry | ArtEntry) {
    const had = imgs.get(w.id)
    if (had) return had
    const im = new Image()
    im.className = "pl-img"
    im.alt = w.title
    im.decoding = "async"
    im.onload = () => {
      im.style.setProperty("--nw", String(im.naturalWidth))
      im.style.setProperty("--nh", String(im.naturalHeight))
    }
    im.src = heroOf(w)
    dom.stage.appendChild(im)
    imgs.set(w.id, im)
    return im
  }

  function select(w: Entry) {
    const cur = s().cur
    if (cur === w && !f.first) return
    const prev = cur ? imgs.get(cur.id) : undefined
    const isA = w.kind === "wall"
    /* entries with a picture: projects without a canvas effect (and pieces, should one ever play) */
    const pictured = w.kind === "art" || (w.kind === "work" && !w.fx) ? w : null
    f.first = false
    setTint(w)
    f.autoT = performance.now()
    /* the caption, meta, card and montage follow `cur` */
    store.set((st) => ({ cur: w, curPhone: isPhone(), selectTick: st.selectTick + 1 }))
    const stack = Array.from(dom.stage.querySelectorAll(".pl-img"))
    if (!pictured) {
      stack.forEach((x) => x.classList.remove("on", "prev"))
      if (isA) imgFor(cat.code[0]!)
    } else {
      const im = imgFor(pictured)
      stack.forEach((x) => {
        if (x !== im && x !== prev) x.classList.remove("on", "prev")
      })
      if (prev && prev !== im) {
        prev.classList.remove("on")
        prev.classList.add("prev")
      }
      im.classList.remove("prev", "on")
      void im.offsetWidth
      im.classList.add("on")
      setTimeout(() => {
        const c = s().cur
        imgs.forEach((x, k) => {
          if (c && k !== c.id) x.classList.remove("prev")
        })
      }, 460)
    }
    ctx.a.setActive(w.id, { scroll: true })
    const nx = SEL[(SEL.indexOf(w) + 1) % SEL.length]
    if (nx && nx.kind === "work" && !nx.fx) imgFor(nx)
    syncScrolled(ctx)
  }

  const selectFor = (w: Entry) => {
    if (!(w.kind === "page" && isPhone())) select(w)
  }

  async function pick(w: Entry) {
    const a = ctx.a
    if (isPhone()) setMenuQ(ctx, false)
    /* the Home row: the title card is a frame, not a page. Picking it leaves whatever is open and shows the card */
    if (w.kind === "home") {
      touch()
      if (s().view === "wall") {
        if (s().detailId) await a.closeDetail({ instant: true })
        a.closeMenu()
        await a.closeWall()
      }
      if (s().projOn) {
        a.projClose()
        for (let i = 0; i < 40 && s().projOn; i++) await wait(50)
        setMenuQ(ctx, false)
      }
      if (isPhone()) a.setSnap("peek")
      select(w)
      return
    }
    /* the Artwork row is a toggle like the project rows: clicking it while the wall is up (expanded or not) leaves the wall */
    if (w === AR && s().view === "wall") {
      if (s().detailId) await a.closeDetail({ instant: true })
      a.closeMenu()
      await a.closeWall()
      if (isPhone()) a.setSnap("peek")
      return
    }
    if (w === AR) {
      if (s().projOn) {
        a.projClose()
        for (let i = 0; i < 40 && s().projOn; i++) await wait(50)
        setMenuQ(ctx, false)
      }
      return a.openWall()
    }
    if (s().projOn) {
      if (s().projId === w.id) return a.projClose()
      if (isPhone()) setMenuQ(ctx, false)
      return a.projJump(w.id)
    }
    touch()
    if (s().view === "wall") await a.closeWall({ instant: true })
    if (isPhone()) a.setSnap("peek")
    selectFor(w)
    return a.projOpen(w.id)
  }

  /* copy an address from any element with data-mail; falls back to the mailto link */
  function copyMail(el: HTMLElement) {
    if (!navigator.clipboard) return false
    navigator.clipboard.writeText(el.dataset.mail || AB.email).then(
      () => {
        const b = el.querySelector("b") || el
        const t = b.textContent
        b.textContent = "Copied"
        setTimeout(() => (b.textContent = t), 1400)
      },
      () => {
        const href = (el as HTMLAnchorElement).href
        if (href) location.href = href
      },
    )
    return true
  }

  /* ---------- step through the order from the player ---------- */
  function setOff(axis: "X" | "Y", x: number, o: number) {
    for (const el of [dom.stage, dom.cap]) {
      el.style.transform = x ? `translate${axis}(${x}px)` : ""
      el.style.opacity = o === 1 ? "" : String(o)
    }
  }
  /* a step asked for while one is still landing is queued (net of direction) and runs right after it, so quick swipes
     or taps are never dropped; d may be several rows at once */
  async function stepPlayer(d: number, axis: "x" | "y", from = 0): Promise<boolean> {
    if (s().view !== "code" || s().projOn || !s().started) return false
    if (f.stepBusy) {
      f.stepQ += d
      return true
    }
    const ids = ctx.a.order()
    const k0 = ids.indexOf(s().cur?.id ?? "")
    const k = k0 < 0 ? (d > 0 ? -1 : 0) : k0
    const n = ids.length
    if (n < 2) return false
    const sg = d < 0 ? -1 : 1
    const nw = cat.entry(ids[(((k + d) % n) + n) % n]!)
    const A = axis === "x" ? "X" : "Y"
    /* a vertical step leaves at least as far as the finger already dragged, so the card never turns back first */
    const span = axis === "x" ? innerWidth * 0.45 : Math.max(56, Math.abs(from) + 8)
    f.stepBusy = true
    touch()
    await tween(110, (e) => setOff(A, from + (-sg * span - from) * e, 1 - e), {
      fps: 20,
      ease: eio,
    })
    select(nw)
    f.tapId = nw.id
    flash(0.08)
    await tween(190, (e) => setOff(A, sg * span * (1 - e), e), { fps: 20, ease: eout })
    setOff(A, 0, 1)
    f.stepBusy = false
    if (f.stepQ) {
      const q = f.stepQ
      f.stepQ = 0
      void stepPlayer(q, axis)
    }
    return true
  }

  function attach() {
    const { player } = dom
    /* the reel: auto-advance, drawn as a hairline across the caption rule */
    ctx.cleanups.push(
      addFrameHook((now) => {
        const st = s()
        setBodyClass("m-page", st.projOn && cat.isPage(st.projId ? cat.get(st.projId) : null))
        if (!st.started) return
        /* the title card never autoplays: the reel waits on it, and skips it when it comes round */
        const run =
          st.view === "code" &&
          !st.projOn &&
          !document.hidden &&
          st.cur?.kind !== "home" &&
          now - f.idleT > IDLE_MS
        dom.cap.style.setProperty("--p", run ? clamp((now - f.autoT) / AUTO_MS) * 100 + "%" : "0%")
        if (run && now - f.autoT > AUTO_MS) {
          const ids = ctx.a.order().filter((id) => id !== cat.home.id)
          const k = ids.indexOf(st.cur?.id ?? "")
          if (ids.length) select(cat.entry(ids[(k + 1) % ids.length]!))
        }
        if (!run) f.autoT = now
      }),
    )

    /* phone: swipe the card left / right or up / down for next / previous. With the sheet open, a swipe on the
       player above it moves the sheet instead (up to full, down to closed); the Menu button is what opens it */
    let ps: {
      x: number
      y: number
      t: number
      lock: "x" | "y" | null
      dx: number
      dy: number
    } | null = null
    const live = () => isPhone() && s().view === "code" && !s().projOn && s().started
    const sheetClosed = () => s().snap === "peek"
    const fade = (d: number) => 1 - Math.min(0.6, Math.abs(d) / 420)
    const onStart = (e: TouchEvent) => {
      if (!live() || e.touches.length !== 1 || (e.target as Element).closest("button")) {
        ps = null
        return
      }
      const t = e.touches[0]!
      touch()
      ps = { x: t.clientX, y: t.clientY, t: performance.now(), lock: null, dx: 0, dy: 0 }
    }
    const onMove = (e: TouchEvent) => {
      if (!ps) return
      const t = e.touches[0]!
      const dx = t.clientX - ps.x
      const dy = t.clientY - ps.y
      if (!ps.lock) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        ps.lock = Math.abs(dx) > Math.abs(dy) ? "x" : "y"
      }
      if (ps.lock === "x") {
        ps.dx = dx
        if (!f.stepBusy) setOff("X", dx * 0.6, fade(dx))
      } else if (sheetClosed()) {
        ps.dy = dy
        if (!f.stepBusy) setOff("Y", dy * 0.6, fade(dy))
      }
    }
    /* the finger lifts: a long or quick swipe steps (left or up is next), a short one springs back */
    const settle = (A: "X" | "Y", d: number, dt: number) => {
      const off = f.stepBusy ? 0 : d * 0.6
      const v = d / dt
      if (Math.abs(d) > 56 || (Math.abs(v) > 0.5 && Math.abs(d) > 24))
        void stepPlayer(d < 0 ? 1 : -1, A === "X" ? "x" : "y", off)
      else if (!f.stepBusy)
        void tween(160, (e) => setOff(A, off * (1 - e), 1 - (1 - e) * (1 - fade(d))), {
          fps: 20,
          ease: eout,
        }).then(() => setOff(A, 0, 1))
    }
    const onEnd = (e: TouchEvent) => {
      if (!ps) return
      const sw = ps
      ps = null
      const dt = Math.max(30, performance.now() - sw.t)
      if (sw.lock === "x") settle("X", sw.dx, dt)
      else if (sw.lock === "y") {
        if (sheetClosed()) settle("Y", sw.dy, dt)
        else {
          const dy = e.changedTouches[0]!.clientY - sw.y
          if (dy < -36) ctx.a.setSnap("full")
          else if (dy > 36) ctx.a.setSnap("peek")
        }
      }
    }
    const onCancel = () => {
      if (ps?.lock && !f.stepBusy) setOff(ps.lock === "x" ? "X" : "Y", 0, 1)
      ps = null
    }
    player.addEventListener("touchstart", onStart, { passive: true })
    player.addEventListener("touchmove", onMove, { passive: true })
    player.addEventListener("touchend", onEnd)
    player.addEventListener("touchcancel", onCancel)

    /* wheel / trackpad over the player steps once per gesture, at every width. A new gesture is a pause over GAP ms, a
       direction flip, or the magnitude climbing back after it had decayed (momentum only ever decays).
       Desktop takes vertical scrolling; the phone layout on a computer takes either axis, a sideways trackpad swipe being a swipe. */
    const GAP = 120
    const DEAD = 28
    let acc = 0
    let lastW = 0
    let dir = 0
    let armed = true
    let peak = 0
    let low = 0
    let ax: "x" | "y" | "" = ""
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || s().view !== "code" || s().projOn || !s().started) return
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY
      const dx = e.deltaMode === 1 ? e.deltaX * 32 : e.deltaX
      const now = performance.now()
      const ph = isPhone()
      /* one axis per gesture, chosen on its first event and held: a trackpad swipe jitters on the other axis, and a sign
         flip there must not read as a new gesture (that gave two steps for one swipe) */
      if (now - lastW > GAP) ax = ""
      if (!ax) {
        if (!dx && !dy) return
        const h = Math.abs(dx) > Math.abs(dy)
        if (h && !ph) return
        ax = h ? "x" : "y"
      }
      const dv = ax === "x" ? dx : dy
      if (!dv) return
      e.preventDefault()
      const a = Math.abs(dv)
      const d = Math.sign(dv)
      if (
        now - lastW > GAP ||
        (d && dir && d !== dir) ||
        (!armed && low < peak * 0.5 && a > low * 2 + 8)
      ) {
        armed = true
        acc = 0
      }
      lastW = now
      if (d) dir = d
      if (!armed) {
        if (a > peak) peak = low = a
        else low = Math.min(low, a)
        return
      }
      acc += dv
      if (Math.abs(acc) < DEAD || f.stepBusy) return
      const sg = acc > 0 ? 1 : -1
      armed = false
      peak = low = a
      acc = 0
      void stepPlayer(sg, ax)
    }
    player.addEventListener("wheel", onWheel, { passive: false })

    ctx.cleanups.push(() => {
      player.removeEventListener("touchstart", onStart)
      player.removeEventListener("touchmove", onMove)
      player.removeEventListener("touchend", onEnd)
      player.removeEventListener("touchcancel", onCancel)
      player.removeEventListener("wheel", onWheel)
    })
  }

  const actions = {
    touch,
    select,
    selectFor,
    pick,
    copyMail,
    setOff,
    stepPlayer,
  } satisfies Partial<Actions>
  return { actions, attach, home: () => SEL[0]! }
}
