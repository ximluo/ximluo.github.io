/* The page controls over the docked pane: close in the corner, and Prev / Next / Close pills that step the open
   project (or the enlarged piece) and leave the top layer, as Esc does. */
import { useReel, useReelState } from "../reel/context"

export function CloseX() {
  const { actions } = useReel()
  return (
    <button
      id="pj-x"
      className="mono"
      data-hot=""
      aria-label="Close project"
      onClick={() => actions.projClose()}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M3 3l10 10M13 3 3 13" />
      </svg>
    </button>
  )
}

export function PageNav() {
  const { cat, actions } = useReel()
  const projId = useReelState((s) => (s.projOn ? s.projId : null))
  const detailId = useReelState((s) => s.detailId)
  const p = projId ? cat.next(projId, -1) : null
  const n = projId ? cat.next(projId, 1) : null
  const label = (e: typeof p) => (e && "label" in e && e.label) || e?.title || ""
  return (
    <div id="pj-nav" role="group" aria-label="Page controls">
      <button
        id="pj-prev"
        className="btn"
        data-hot=""
        aria-label={p ? "Previous: " + p.title : "Previous project"}
        onClick={() => actions.barStep(-1)}
      >
        <i>‹</i> Prev <em>{label(p)}</em>
      </button>
      <button
        id="pj-next"
        className="btn"
        data-hot=""
        aria-label={n ? "Next: " + n.title : "Next project"}
        onClick={() => actions.barStep(1)}
      >
        Next <em>{label(n)}</em> <i>›</i>
      </button>
      <button
        id="pj-close"
        className="btn"
        data-hot=""
        aria-label={projId ? "Close project" : detailId ? "Back to wall" : "Close the wall"}
        onClick={() => actions.navClose()}
      >
        <i>✕</i> Close <em>esc</em>
      </button>
    </div>
  )
}
