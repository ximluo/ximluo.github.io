/* The player: the hero stack (images are managed by reel/player.ts), the wall's moving preview, the canvas card
   for works drawn by an effect, and the caption with its meta grid and Open pill. The info pages show only their
   tint and caption. */
import { Fragment, useEffect, useLayoutEffect, useRef } from "react"
import type { Entry } from "../data/types"
import { RM } from "../env"
import { wallLoop } from "../media"
import { useDomRef, useReel, useReelState } from "../reel/context"
import { captionOf, pad } from "../text"
import { mountFx, unmountFx } from "../wall/fx"

const WALL_TAG_LONG =
  "Ink, charcoal, woodburn, scratchboard, sculpture, digital and photography. Enter the wall to drag around and enlarge any piece."
const WALL_TAG_SHORT = "Ink, charcoal, woodburn, scratchboard and more."

function PlayerCard({ cur }: { cur: Entry | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const fx = cur?.kind === "work" ? cur.fx : undefined
  useEffect(() => {
    const el = ref.current
    if (!el || !fx) return
    mountFx(el, fx)
    return () => unmountFx(el)
  }, [fx])
  return <div className="pl-card" id="pl-card" hidden={!fx} ref={ref}></div>
}

export function Player() {
  const { cat, actions } = useReel()
  const cur = useReelState((s) => s.cur)
  const curPhone = useReelState((s) => s.curPhone)
  const tick = useReelState((s) => s.selectTick)
  const capRef = useRef<HTMLDivElement>(null)
  const capDom = useDomRef("cap")

  /* the caption rises again on every cut */
  useLayoutEffect(() => {
    const cap = capRef.current
    if (!tick || !cap) return
    cap.classList.remove("in")
    void cap.offsetWidth
    cap.classList.add("in")
  }, [tick])

  const isA = cur?.kind === "wall"
  const isP = cur?.kind === "page" || (cur?.kind === "work" && !!cur.fx)
  const kind = !cur ? undefined : isA ? "wall" : isP ? "card" : "work"
  const page = cur?.kind === "page" ? cur : null
  const sec = cur && (cur.kind === "work" || cur.kind === "wall") ? cat.secOf(cur) : null
  const kick = !cur
    ? ""
    : page
      ? page.kick || "Info"
      : curPhone
        ? `${sec!.name} · ${isA ? cat.art.length + " pieces" : cur.kind === "work" ? cur.group : ""}`
        : `${cat.num(cur)} / ${pad(sec!.n)} · ${sec!.name}`
  const tag = !cur ? "" : isA ? (curPhone ? WALL_TAG_SHORT : WALL_TAG_LONG) : captionOf(cur)
  const meta: [string, string][] = !cur
    ? []
    : isA
      ? [
          ["Pieces", String(cat.art.length)],
          ["Media", cat.mediaList().slice(0, 4).join(", ")],
          ["View", "Drag wall"],
        ]
      : page
        ? page.meta
        : cur.kind === "work"
          ? [
              ["Area", cur.group],
              ["Year", cur.year],
              ["Stack", cur.tags.slice(0, 3).join(", ")],
            ]
          : []
  const openLabel = isA ? "Enter the wall" : page ? "Open " + page.title : "Open project"

  return (
    <main id="player" aria-live="polite" ref={useDomRef("player")} data-kind={kind}>
      <div className="glow pl-glow"></div>
      <p className="pl-pos mono" id="pl-pos" aria-hidden="true"></p>
      <div className="pl-stage" id="pl-stage" ref={useDomRef("stage")}>
        <div className="pl-mont" id="pl-mont" hidden={!isA}>
          <img id="pl-mimg" alt="" src={isA ? wallLoop(false, RM) : undefined} />
          <span className="mono" id="pl-mn">
            {isA ? `The wall · ${cat.art.length} pieces` : ""}
          </span>
        </div>
        <PlayerCard cur={cur} />
      </div>
      <div
        className="pl-cap"
        id="pl-cap"
        ref={(el) => {
          capRef.current = el
          capDom(el)
        }}
      >
        <div className="pl-l">
          <p className="mono pl-kick" id="pl-kick">
            {kick}
          </p>
          <h2 id="pl-title">{cur?.title ?? ""}</h2>
          <p id="pl-tag">{tag}</p>
        </div>
        <div className="pl-r">
          <dl id="pl-meta">
            {meta
              .filter((r) => r[1])
              .map(([k, v]) => (
                <Fragment key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </Fragment>
              ))}
          </dl>
          <button
            className="open btn"
            id="pl-open"
            data-hot=""
            onClick={() => cur && void actions.pick(cur)}
          >
            {openLabel} <i>→</i>
          </button>
        </div>
      </div>
    </main>
  )
}
