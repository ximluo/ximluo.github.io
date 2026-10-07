/* The artwork wall in the right panel (reel/wall.ts mounts the WebGL wall into #aw-wall), its hover line and
   hint, and the enlarged piece over it. */
import { Fragment, useEffect, useRef, type MouseEvent } from "react"
import { cx } from "../cx"
import { TOUCH } from "../env"
import { useDomRef, useReel, useReelState } from "../reel/context"
import { awardOf, pad, sizeOf } from "../text"

function HoverLine() {
  const { cat } = useReel()
  const id = useReelState((s) => s.lineId)
  const on = useReelState((s) => s.lineOn)
  const w = id ? cat.get(id) : undefined
  return (
    <p className={cx("aw-line mono", on && "on")} id="aw-line">
      {cat.isArt(w) && (
        <>
          {`Still ${pad(cat.ri(w.id) + 1)} / ${cat.art.length}`} <i>·</i> <b>{w.title}</b> <i>·</i>{" "}
          {w.group} <em>click to enlarge</em>
        </>
      )}
    </p>
  )
}

function DetailSide({ id }: { id: string }) {
  const { cat } = useReel()
  const w = cat.get(id)
  if (!cat.isArt(w)) return null
  const L = cat.art.length
  const still = `${pad(cat.ri(w.id) + 1)} / ${pad(L)}`
  const award = awardOf(w.award)
  const notes = [
    award ? (
      award.href ? (
        <a key="a" href={award.href} target="_blank" rel="noopener">
          {award.text}
        </a>
      ) : (
        award.text
      )
    ) : null,
    ...cat.recOf(w.id).map((r) => r.title + (r.detail ? " · " + r.detail : "")),
  ].filter(Boolean)
  const rows: [string, React.ReactNode][] = [
    ["Still", still],
    ["Title", w.title],
    ["Medium", w.group],
    ["Size", sizeOf(w)],
    ["Year", w.year],
    [
      "Note",
      notes.length
        ? notes.map((n, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {n}
            </Fragment>
          ))
        : "",
    ],
  ]
  return (
    <>
      <div className="slate">
        <i className="clap"></i>
        <dl>
          {rows
            .filter((r) => r[1])
            .map(([k, v]) => (
              <Fragment key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </Fragment>
            ))}
        </dl>
      </div>
      <p className="piece-sub">{w.sub || w.tagline || ""}</p>
      <div className="piece-act">
        <button className="piece-wall mono" data-hot="" aria-label="Back to wall">
          <i>‹</i>
          <span className="dl">Back to wall</span>
          <span className="ml">Wall</span>
          <em>esc</em>
        </button>
        <span className="piece-ct mono">{still}</span>
        <div className="piece-pn">
          <button className="piece-p mono" data-d="-1" data-hot="" aria-label="Previous piece">
            <i>‹</i>
            <span>Prev</span>
          </button>
          <button className="piece-n mono" data-d="1" data-hot="" aria-label="Next piece">
            <span>Next</span>
            <i>›</i>
          </button>
        </div>
      </div>
    </>
  )
}

function ArtDetail() {
  const { cat, actions } = useReel()
  const id = useReelState((s) => s.detailId)
  const shown = useReelState((s) => s.adShown)
  const w = id ? cat.get(id) : undefined
  const still = cat.isArt(w) ? `${pad(cat.ri(w.id) + 1)} / ${pad(cat.art.length)}` : ""
  /* when the dialog appeared: the second click of a double-click on the wall lands on the image just revealed, and
     must not open the full view on top */
  const shownAt = useRef(0)
  useEffect(() => {
    if (shown) shownAt.current = performance.now()
  }, [shown])
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const t = e.target as Element
    const step = t.closest<HTMLElement>("[data-d]")
    if (step) {
      void actions.stepDetail(+step.dataset.d!)
      return
    }
    if (t.closest(".piece-wall") || t.id === "piece-back" || t.closest("#piece-handle")) {
      void actions.closeDetail()
      return
    }
    if (t.closest(".piece-full") || t.closest("#piece-img")) {
      if (e.detail > 1 || performance.now() - shownAt.current < 400) return
      actions.openFull()
    }
  }
  return (
    <div
      className="piece"
      id="piece"
      hidden={!shown}
      role="dialog"
      aria-label="Artwork detail"
      ref={useDomRef("ad")}
      onClick={onClick}
    >
      <div className="piece-back" id="piece-back"></div>
      <div className="piece-sheet" id="piece-sheet" ref={useDomRef("adSheet")}>
        <button className="piece-handle" id="piece-handle" aria-label="Close detail">
          <i></i>
        </button>
        <button
          className="piece-bk mono"
          id="piece-bk"
          data-hot=""
          aria-label="Back to wall"
          onClick={() => void actions.closeDetail()}
        >
          <i>‹</i> Back to wall
        </button>
        <div className="piece-fig" id="piece-fig" ref={useDomRef("adFig")}>
          <i className="fb tl"></i>
          <i className="fb tr"></i>
          <i className="fb bl"></i>
          <i className="fb br"></i>
          <p className="piece-tc mono">
            <span className="pt"></span>
            <span className="tc">00:00:00:00</span>
            <span id="piece-st">{still}</span>
          </p>
          <img id="piece-img" alt={cat.isArt(w) ? w.title : ""} ref={useDomRef("adImg")} />
          <button className="piece-full mono" data-hot="">
            View full image <i>↗</i>
          </button>
        </div>
        <aside className="piece-side" id="piece-side" ref={useDomRef("adSide")}>
          {id && <DetailSide id={id} />}
        </aside>
      </div>
    </div>
  )
}

export function WallPanel() {
  return (
    <section id="awp" aria-label="Artworks wall" ref={useDomRef("awp")}>
      <div id="aw-wall" ref={useDomRef("awWall")}></div>
      <div className="aw-top mono">
        <span className="pt"></span>
        <span className="tc">00:00:00:00</span>
      </div>
      <HoverLine />
      <p className="aw-hint mono" id="aw-hint">
        {TOUCH ? <>Drag · tap a piece to enlarge</> : <>Drag · click to enlarge · esc to leave</>}
      </p>
      <i className="pb tl"></i>
      <i className="pb tr"></i>
      <i className="pb bl"></i>
      <i className="pb br"></i>
      <ArtDetail />
    </section>
  )
}
