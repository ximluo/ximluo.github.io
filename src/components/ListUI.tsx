/* The project list: the Home and About rows above one section per catalogue section, with the wall row
   under Selected. Folds and the scroll position survive a reload within the session. */
import { useCallback, useEffect, useRef, type MouseEvent } from "react"
import { cx } from "../cx"
import { WALL_ID, type Section } from "../data/catalog"
import type { Entry, WorkEntry } from "../data/types"
import { RM } from "../env"
import { wallLoop } from "../media"
import { artPath, openPath } from "../paths"
import { useDomRef, useReel, useReelState } from "../reel/context"
import { readListMemory, saveListMemory } from "../reel/state"

function WorkRow({ w, section }: { w: WorkEntry; section: Section }) {
  const { cat } = useReel()
  const on = useReelState((s) => s.activeId === w.id)
  const tight = useReelState((s) => s.tight.includes(w.id))
  return (
    <a
      className={cx(
        "lr",
        section.key === "selected" ? "t1" : "t2",
        w.kind,
        on && "on",
        tight && "tight",
      )}
      href={openPath(w.id)}
      data-id={w.id}
      data-k={w.kind}
    >
      <span className="n">{cat.num(w)}</span>
      <b>
        {w.label || w.title}
        {cat.recOf(w.id).length > 0 && <i className="rk" title="Recognised"></i>}
      </b>
      <em>{w.meta || w.year || ""}</em>
    </a>
  )
}

function WallRow() {
  const { cat } = useReel()
  const on = useReelState((s) => s.activeId === WALL_ID)
  const a = cat.artRow
  return (
    <a className={cx("lr aw t1", on && "on")} href={artPath()} data-id={a.id} data-k="wall">
      <span className="n">{cat.num(a)}</span>
      <b>{a.label}</b>
      <em>
        <span className="aw-th">
          <img alt="" src={wallLoop(true, RM)} />
        </span>
      </em>
    </a>
  )
}

/* The rows above Selected: Home (the title card, frame 00) and About (its card previews the page; clicking opens
   it). Both are frames of the reel like any project row. */
function TopRows() {
  const { cat } = useReel()
  const h = cat.home
  const homeOn = useReelState((s) => s.activeId === h.id)
  const pages = cat.info
  const activeId = useReelState((s) => s.activeId)
  const openId = useReelState((s) => (s.projOn ? s.pageId : null))
  return (
    <section className="lu-sec lu-top" data-s="top">
      <div className="lu-rows">
        <a className={cx("lr hm t1", homeOn && "on")} href="/" data-id={h.id} data-k={h.kind}>
          <span className="n">{cat.num(h)}</span>
          <b>{h.label}</b>
          <em>{h.sub}</em>
        </a>
        {pages.map((w) => (
          <a
            key={w.id}
            className={cx("lr t1", (activeId === w.id || openId === w.id) && "on")}
            href={openPath(w.id)}
            data-id={w.id}
            data-k="page"
          >
            <span className="n">{cat.num(w)}</span>
            <b>{w.title}</b>
            <em>{w.sub}</em>
          </a>
        ))}
      </div>
    </section>
  )
}

function SectionBlock({ s }: { s: Section }) {
  const { actions } = useReel()
  const closed = useReelState((st) => !!st.fold[s.key])
  const count = s.items.length + (s.i === 0 ? 1 : 0)
  return (
    <section className={cx("lu-sec", closed && "closed")} data-s={s.key}>
      {s.i === 0 ? (
        <h3>
          {s.name} <i>{count}</i>
        </h3>
      ) : (
        <button
          className="lu-fold"
          data-s={s.key}
          aria-expanded={!closed}
          onClick={() => actions.toggleFold(s.key)}
        >
          {s.name} <i>{count}</i>
          <em>+</em>
        </button>
      )}
      <div className="lu-rows">
        {s.items.map((w) => (
          <WorkRow key={w.id} w={w} section={s} />
        ))}
        {s.i === 0 && <WallRow />}
      </div>
    </section>
  )
}

export function ListUI() {
  const { cat, actions, store } = useReel()
  const hov = useReelState((s) => s.listHov)
  const wall = useReelState((s) => s.view === "wall")
  const fold = useReelState((s) => s.fold)
  const ref = useDomRef("blist")
  const scrollRef = useRef<HTMLDivElement>(null)
  const saveT = useRef(0)
  const save = useCallback(
    () => saveListMemory({ fold: { ...store.get().fold }, top: scrollRef.current?.scrollTop ?? 0 }),
    [store],
  )

  useEffect(() => {
    const top = readListMemory().top
    if (top && scrollRef.current) scrollRef.current.scrollTop = top
  }, [])
  useEffect(() => {
    save()
    actions.fitRows()
  }, [fold, actions, save])

  const entryOf = (e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLElement>(".lr")
    const w: Entry | undefined = a?.dataset.id ? cat.get(a.dataset.id) : undefined
    return a && w ? ([a, w] as const) : null
  }

  return (
    <div
      id="blist"
      ref={ref}
      className={cx("lu", hov && "hov", wall && "aw-on")}
      onClick={(e) => {
        if ((e.target as Element).closest(".lu-fold")) return
        const hit = entryOf(e)
        if (hit) actions.listClick(hit[1], hit[0], e)
      }}
      onMouseOver={(e) => {
        const hit = entryOf(e)
        if (hit) actions.listHover(hit[1], hit[0])
      }}
      onMouseLeave={() => actions.listLeave()}
    >
      <div
        className="lu-scroll"
        ref={scrollRef}
        onScroll={() => {
          clearTimeout(saveT.current)
          saveT.current = window.setTimeout(save, 200)
        }}
      >
        <div className="lu-inner">
          <TopRows />
          {cat.sections.map((s) => s.items.length > 0 && <SectionBlock key={s.key} s={s} />)}
          <div className="lu-end"></div>
        </div>
      </div>
    </div>
  )
}
