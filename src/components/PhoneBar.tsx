/* The phone's bottom bar: Menu | prev | position | next, with About, Recognition and the address on a second row.
   The centre reads "number / count" within the open section (or the wall), the section name under it. */
import type { ReactNode } from "react"
import { cx } from "../cx"
import { AB } from "../data/about"
import { WALL_ID, type Section } from "../data/catalog"
import { useDomRef, useReel, useReelState } from "../reel/context"
import type { ReelState } from "../reel/state"
import { pad } from "../text"

interface BarState {
  ct: ReactNode
  sub?: string
  p?: string
  n?: string
}

const SHORT: Partial<Record<string, string>> = { graphics: "Graphics" }
const secName = (s: Section) => SHORT[s.key] ?? s.name
const cnt = (i: string, n: string) => (
  <>
    <b>{i}</b> / {n}
  </>
)

export function PhoneBar() {
  const { cat, actions } = useReel()
  const phone = useReelState((s) => s.phone)
  const st = useReelState((s) => (s.phone ? s : null))
  const bar: BarState = st ? barState(st) : { ct: "" }
  const open = !!st && actions.menuOpen()
  const pid = st?.projOn ? st.projId : ""

  function barState(s: ReelState): BarState {
    if (!s.started) return { ct: "" }
    const ART = cat.art
    if (s.projOn && s.projId) {
      const w = cat.get(s.projId)
      if (w?.kind === "page") {
        /* a page with no neighbour (About is the Info room's only entry) gets no arrows */
        const nb = cat.next(s.projId, 1)
        if (nb.id === s.projId) return { ct: w.title }
        return {
          ct: w.title,
          p: "Previous: " + cat.next(s.projId, -1).title,
          n: "Next: " + nb.title,
        }
      }
      const ps = cat.pos(s.projId)
      const prev = cat.next(s.projId, -1)
      const next = cat.next(s.projId, 1)
      return {
        ct: cnt(pad(ps.i), pad(ps.n)),
        sub: ps.sec ? secName(ps.sec) : ps.room === "art" ? "Art" : "Info",
        p: "Previous: " + prev.title,
        n: "Next: " + next.title,
      }
    }
    if (s.view === "wall") {
      if (!s.detailId) return { ct: "Wall", sub: ART.length + " pieces" }
      const i = cat.ri(s.detailId)
      const L = ART.length
      return {
        ct: cnt(pad(i + 1), pad(L)),
        sub: "Artworks",
        p: "Previous: " + ART[(i - 1 + L) % L]!.title,
        n: "Next: " + ART[(i + 1) % L]!.title,
      }
    }
    const cur = s.cur
    if (!cur) return { ct: "" }
    const ids = [
      cat.home.id,
      ...cat.info.map((p) => p.id),
      ...cat.sections
        .filter((sec) => !s.fold[sec.key])
        .flatMap((sec) => [...sec.items.map((w) => w.id), ...(sec.i === 0 ? [WALL_ID] : [])]),
    ]
    const k = ids.indexOf(cur.id)
    const base: BarState =
      cur.kind === "page"
        ? { ct: cur.title }
        : cur.kind === "home"
          ? { ct: cur.label }
          : {
              ct: cnt(cat.num(cur), pad(cat.secOf(cur as never).n)),
              sub: secName(cat.secOf(cur as never)),
            }
    if (ids.length < 2) return base
    const title = (id: string) => cat.entry(id).title
    return {
      ...base,
      p: "Previous: " + title(ids[(k - 1 + ids.length) % ids.length]!),
      n: "Next: " + title(ids[(k + 1) % ids.length]!),
    }
  }

  return (
    <nav id="mbar" aria-label="Navigate" ref={useDomRef("mbar")}>
      <button
        className={cx("mb-menu mono", open && "is-open")}
        id="mb-menu"
        data-hot=""
        aria-expanded={open}
        aria-controls="side"
        aria-label={phone ? (open ? "Close menu" : "Open menu") : undefined}
        onClick={() => (actions.menuOpen() ? actions.closeMenu() : actions.openMenu("half"))}
      >
        <svg className="i-m" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M2 4.5h14M2 9h14M2 13.5h14" />
        </svg>
        <svg className="i-x" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M3.5 3.5l11 11M14.5 3.5l-11 11" />
        </svg>
        <span>Menu</span>
      </button>
      <button
        className="mb-ar"
        id="mb-p"
        data-hot=""
        aria-label={bar.p || "Previous"}
        disabled={phone && !bar.p}
        onClick={() => actions.barStep(-1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 4 7 12l8 8" />
        </svg>
      </button>
      <div className="mb-ct mono" id="mb-ct" aria-live="polite">
        {phone && (
          <>
            <span className="mb-ln">
              <span>{bar.ct}</span>
              <i className="cue mb-cue"></i>
            </span>
            {bar.sub && <small>{bar.sub}</small>}
          </>
        )}
      </div>
      <button
        className="mb-ar"
        id="mb-n"
        data-hot=""
        aria-label={bar.n || "Next"}
        disabled={phone && !bar.n}
        onClick={() => actions.barStep(1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 4l8 8-8 8" />
        </svg>
      </button>
      <div className="mb-row2" id="mb-row2">
        {cat.info.map((w) => (
          <button
            key={w.id}
            className={cx("mb-pg mono", pid === w.id && "on")}
            data-id={w.id}
            data-hot=""
            onClick={() => {
              actions.touch()
              void actions.pick(w)
            }}
          >
            {w.title}
          </button>
        ))}
        <button
          className="mb-pg mb-mail mono"
          id="mb-mail"
          data-mail={AB.email}
          data-hot=""
          aria-label={`Copy ${AB.email}`}
          onClick={(e) => {
            if (!actions.copyMail(e.currentTarget)) location.href = "mailto:" + AB.email
          }}
        >
          <b>{AB.email}</b>
        </button>
      </div>
    </nav>
  )
}
