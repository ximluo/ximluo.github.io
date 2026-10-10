/* The heads-up display in the four corners: the name (returns to Home), the wall's Back button, the timecode,
   the reel and scene numbers, the player toggle and the address. */
import { cx } from "../cx"
import { AB } from "../data/about"
import { useReel, useReelState } from "../reel/context"
import { pad } from "../text"

export function Hud() {
  const { cat, actions } = useReel()
  const cur = useReelState((s) => s.cur)
  const view = useReelState((s) => s.view)
  const detailId = useReelState((s) => s.detailId)
  const projOn = useReelState((s) => s.projOn)

  const page = cur?.kind === "page"
  const sec = cur && (cur.kind === "work" || cur.kind === "wall") ? cat.secOf(cur) : null
  const reel = !cur || page || !sec ? "" : "Reel " + (sec.i + 1)
  const scno =
    view === "wall"
      ? detailId
        ? `Still ${pad(cat.ri(detailId) + 1)}/${pad(cat.art.length)}`
        : `Artworks · ${cat.art.length}`
      : !cur
        ? ""
        : page
          ? cur.title
          : cur.kind === "home"
            ? cur.title
            : `${cat.num(cur)}/${pad(sec!.n)}`

  return (
    <div id="hud">
      <button
        className="h h-tl mono"
        id="home"
        data-hot=""
        aria-label="Ximing Luo: return to the start"
        onClick={(e) => {
          e.currentTarget.blur()
          void actions.goHome()
        }}
      >
        <img className="h-logo" src="/favicon.svg" alt="" width={18} height={18} />
        <span id="hud-lab"></span>
        <b>Ximing Luo</b>
      </button>
      <div className="h h-wt mono">
        <button id="wt-back" data-hot="" onClick={() => void actions.wallBack()}>
          ‹ Back
        </button>
      </div>
      <div className="h h-bl mono ph-x">
        <span className="tc" id="tc">
          00:00:00:00
        </span>
      </div>
      <div className="h h-br mono">
        <span className="h-reel ph-x">
          <span className="dim" id="reel">
            {reel}
          </span>
          <span id="scno">{scno}</span>
          <i id="cue" className="cue"></i>
        </span>
        <i className="sep ph-x"></i>
        <button
          id="tg-p"
          className={cx(!projOn && view === "code" && "on")}
          data-hot=""
          aria-label="Back to the player"
          onClick={() => void actions.togglePlayer()}
        ></button>
        <a
          className="h-mail"
          id="h-mail"
          href={`mailto:${AB.email}`}
          data-mail={AB.email}
          data-hot=""
          onClick={(e) => {
            if (actions.copyMail(e.currentTarget)) e.preventDefault()
          }}
        >
          <span className="dim">Say hello</span>
          <b>{AB.email}</b>
        </a>
      </div>
    </div>
  )
}
