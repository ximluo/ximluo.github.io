/* The phone's bottom bar, one row: Menu | position | About | Email. The centre reads "number / count" within the open
   section (or the wall), the section name under it; swiping the player steps the reel. */
import type { ReactNode } from "react"
import { cx } from "../cx"
import { AB } from "../data/about"
import type { Section } from "../data/catalog"
import { useDomRef, useReel, useReelState } from "../reel/context"
import type { ReelState } from "../reel/state"
import { pad } from "../text"

interface BarState {
  ct: ReactNode
  sub?: string
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
      if (w?.kind === "page") return { ct: w.title }
      const ps = cat.pos(s.projId)
      return {
        ct: cnt(pad(ps.i), pad(ps.n)),
        sub: ps.sec ? secName(ps.sec) : ps.room === "art" ? "Art" : "Info",
      }
    }
    if (s.view === "wall") {
      if (!s.detailId) return { ct: "Wall", sub: ART.length + " pieces" }
      return { ct: cnt(pad(cat.ri(s.detailId) + 1), pad(ART.length)), sub: "Artworks" }
    }
    const cur = s.cur
    if (!cur) return { ct: "" }
    return cur.kind === "page"
      ? { ct: cur.title }
      : cur.kind === "home"
        ? { ct: cur.label }
        : {
            ct: cnt(cat.num(cur), pad(cat.secOf(cur as never).n)),
            sub: secName(cat.secOf(cur as never)),
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
        <b>Email</b>
      </button>
    </nav>
  )
}
