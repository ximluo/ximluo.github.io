/* The scrubber: one tick per project in the Code room, grouped by section. */
import { cx } from "../cx"
import { useReel, useReelState } from "../reel/context"

export function Ticks() {
  const { cat, actions, store } = useReel()
  const curId = useReelState((s) => s.cur?.id ?? null)
  return (
    <div id="ticks" aria-hidden="true">
      {cat.code.map((w, i, L) => (
        <button
          key={w.id}
          className={cx(
            w.section === "selected" ? "t1" : "t2",
            i > 0 && L[i - 1]!.section !== w.section && "gap",
            curId === w.id && "on",
          )}
          data-id={w.id}
          data-hot=""
          aria-label={w.title}
          onClick={() => {
            if (store.get().view !== "code") return
            actions.touch()
            actions.select(w)
          }}
        >
          <i></i>
        </button>
      ))}
    </div>
  )
}
