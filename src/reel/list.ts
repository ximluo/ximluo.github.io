/* The project list, read the way the layout reads it: which rows are visible and in what order, which row is lit,
   and which titles would collide with the label on their right. */
import { isPhone, TOUCH } from "../env"
import type { Actions, Ctx } from "./ctx"

export function createList(ctx: Ctx) {
  const { store, dom, f } = ctx
  const rows = () => Array.from(dom.blist.querySelectorAll<HTMLAnchorElement>(".lr[data-id]"))
  const rowOf = (id: string) => rows().find((a) => a.dataset.id === id) ?? null
  /** Every listed row: Home, About, the works and the wall row. */
  const visible = () => rows().filter((a) => !a.hidden)

  const order = () =>
    visible()
      .filter((a) => a.offsetParent !== null && !a.closest(".lu-sec.closed"))
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
      .map((a) => a.dataset.id!)

  const homeIds = () =>
    visible()
      .filter((a) => !a.closest(".lu-sec.closed"))
      .map((a) => a.dataset.id!)

  const setActive: Actions["setActive"] = (id, o = {}) => {
    store.set({ activeId: id })
    const a = rowOf(id)
    if (!a) return
    const sec = a.closest<HTMLElement>(".lu-sec")
    if (sec?.classList.contains("closed") && sec.dataset.s)
      store.set({ fold: { ...store.get().fold, [sec.dataset.s]: false } })
    const scroll = dom.blist.querySelector<HTMLElement>(".lu-scroll")
    if (o.scroll && scroll?.contains(a)) {
      const sr = scroll.getBoundingClientRect()
      const ar = a.getBoundingClientRect()
      if (ar.top < sr.top + 4 || ar.bottom > sr.bottom - 4)
        scroll.scrollTo({
          top: Math.max(
            0,
            scroll.scrollTop + ar.top - sr.top - (isPhone() ? 12 : sr.height / 2 - ar.height / 2),
          ),
          behavior: o.smooth ? "smooth" : "auto",
        })
    }
  }

  const toggleFold = (key: string) => {
    const fold = store.get().fold
    store.set({ fold: { ...fold, [key]: !fold[key] } })
  }

  const canHover = () => store.get().view === "code" && !store.get().projOn
  const tap2 = () => !store.get().projOn && !store.get().menuQ

  const listClick: Actions["listClick"] = (w, row, e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    /* a double-click's second click lands on whatever the first one revealed (the docked list, the pane): on a
       desktop it does nothing. Phones and touch screens keep their two-tap flow below. */
    if (e.detail > 1 && !(TOUCH || isPhone())) return
    if ((TOUCH || isPhone()) && tap2() && row.dataset.k !== "page" && f.tapId !== w.id) {
      f.tapId = w.id
      setActive(w.id)
      ctx.a.touch()
      ctx.a.select(w)
      return
    }
    void ctx.a.pick(w)
  }

  const listHover: Actions["listHover"] = (w) => {
    if (TOUCH) return
    if (w.id === f.hov || !canHover()) return
    f.hov = w.id
    store.set({ listHov: true })
    setActive(w.id)
    ctx.a.touch()
    ctx.a.select(w)
  }

  const listLeave = () => {
    if (TOUCH) return
    f.hov = null
    store.set({ listHov: false })
  }

  /* desktop list: a title that would run into the label on its right hides that label (and may wrap instead).
     Measured, not guessed: each title is laid on one line for a frame and compared with the room it has */
  let raf = 0
  const run = () => {
    raf = 0
    const rs = rows().filter((a) => !a.classList.contains("aw"))
    if (isPhone()) {
      if (store.get().tight.length) store.set({ tight: [] })
      return
    }
    const bs = rs.map((a) => a.querySelector("b"))
    rs.forEach((a) => a.classList.remove("tight"))
    bs.forEach((b) => b && (b.style.whiteSpace = "nowrap"))
    const over = bs.map(
      (b, i) => !!b && rs[i]!.offsetParent !== null && b.scrollWidth > b.clientWidth + 1,
    )
    bs.forEach((b) => b && (b.style.whiteSpace = ""))
    const tight = rs.filter((_, i) => over[i]).map((a) => a.dataset.id!)
    const was = store.get().tight
    if (tight.length !== was.length || tight.some((id, i) => id !== was[i])) store.set({ tight })
  }
  const fitRows = () => {
    if (!raf) raf = requestAnimationFrame(run)
  }

  function attach() {
    fitRows()
    addEventListener("resize", fitRows)
    void document.fonts?.ready.then(fitRows)
    const ro = "ResizeObserver" in window ? new ResizeObserver(fitRows) : null
    ro?.observe(dom.blist)
    ctx.cleanups.push(() => {
      removeEventListener("resize", fitRows)
      ro?.disconnect()
      if (raf) cancelAnimationFrame(raf)
    })
  }

  const actions = {
    setActive,
    toggleFold,
    listClick,
    listHover,
    listLeave,
    fitRows,
    order,
    homeIds,
    visibleIds: () => visible().map((a) => a.dataset.id!),
  } satisfies Partial<Actions>
  return { actions, attach }
}
