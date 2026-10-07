/* The project list: the About and Recognition pills pinned above the scroll area, then one section per
   catalogue section with the wall row under Selected. Folds and the scroll position survive a reload within the
   session. */
import { useCallback, useEffect, useRef, type MouseEvent } from "react"
import { cx } from "../cx"
import { WALL_ID, type Section } from "../data/catalog"
import type { Entry, PageEntry, WorkEntry } from "../data/types"
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

function PageRow({ w }: { w: PageEntry }) {
  const on = useReelState((s) => s.activeId === w.id)
  return (
    <a className={cx("lr pg", on && "on")} href={openPath(w.id)} data-id={w.id} data-k="page">
      <span className="n">→</span>
      <b>{w.title}</b>
      <em>{w.sub || ""}</em>
    </a>
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
      <nav className="lu-pin" aria-label="Info">
        {cat.info.map((w) => (
          <PageRow key={w.id} w={w} />
        ))}
      </nav>
      <div
        className="lu-scroll"
        ref={scrollRef}
        onScroll={() => {
          clearTimeout(saveT.current)
          saveT.current = window.setTimeout(save, 200)
        }}
      >
        <div className="lu-inner">
          {cat.sections.map((s) => s.items.length > 0 && <SectionBlock key={s.key} s={s} />)}
          <div className="lu-end"></div>
        </div>
      </div>
    </div>
  )
}
