/* The full-image overlay: an enlarged piece, or any figure on a project page. */
import { useReel, useReelState } from "../reel/context"

export function FullImage() {
  const { actions } = useReel()
  const av = useReelState((s) => s.av)
  return (
    <div id="av" hidden={!av} aria-label="Full image" onClick={() => actions.closeFull()}>
      <img id="av-img" src={av?.src} alt={av?.alt ?? ""} />
      <button className="mono" id="av-x" data-hot="">
        Close <em>esc</em>
      </button>
    </div>
  )
}
