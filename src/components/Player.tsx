/* The player: the hero stack (images are managed by reel/player.ts), the wall's moving preview, the canvas card
   for works drawn by an effect, the title card (no caption on that frame), the About card (the address and the
   links), and the caption with its meta grid and Open pill. */
import { Fragment, useEffect, useLayoutEffect, useRef } from "react"
import { AB, CLAIM } from "../data/about"
import type { Entry, PageEntry } from "../data/types"
import { RM } from "../env"
import { media, wallLoop } from "../media"
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

/* The title card: the name, the claim, the course line and the reel hint on the left; the stage photo on the
   right, monochrome under the page light, its left edge dissolving into the dark. */
const PHOTO = "img/ximing-stage.webp"
function TitleCard({ on, phone }: { on: boolean; phone: boolean }) {
  return (
    <div className="pl-home" id="pl-home" hidden={!on}>
      <div className="ph-text">
        <h1 className="ph-name">Ximing Luo</h1>
        <p className="ph-line">{CLAIM}</p>
        <p className="ph-sub mono">{AB.study}</p>
        <p className="ph-go mono">
          <span className="pt" aria-hidden="true"></span>
          {phone ? "Swipe to start" : "Scroll to start"}
        </p>
      </div>
      <div className="ph-fig" aria-hidden="true">
        <img src={media(PHOTO)} alt="" width={1254} height={1254} decoding="async" />
      </div>
    </div>
  )
}

/* The About frame's stage, one stack: the title, the bio, the Open pill, then the three link pills on the line
   under it. This frame shows no caption either. */
function AboutCard({ w }: { w: PageEntry | null }) {
  const { actions } = useReel()
  return (
    <div className="pl-about" id="pl-about" hidden={!w}>
      <p className="pa-kick mono">{w?.kick || "Info"}</p>
      <h2 className="pa-title">{w?.title ?? "About"}</h2>
      <p className="pa-bio">{AB.bio}</p>
      <p className="pa-open">
        <button
          className="open btn"
          onClick={(e) => {
            if (!w || e.detail > 1) return
            void actions.pick(w)
          }}
        >
          Open {w?.title ?? "About"} <i>→</i>
        </button>
      </p>
      <p className="pa-ln">
        {AB.links.map(([t, href]) => {
          const ext = /^https?:/.test(href)
          return (
            <a
              key={t}
              className="btn"
              href={href}
              target={ext ? "_blank" : undefined}
              rel={ext ? "noopener" : undefined}
            >
              {t} <i>{ext ? "↗" : "→"}</i>
            </a>
          )
        })}
      </p>
    </div>
  )
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

  const isH = cur?.kind === "home"
  const isA = cur?.kind === "wall"
  const isP = cur?.kind === "work" && !!cur.fx
  const page = cur?.kind === "page" ? cur : null
  const kind = !cur
    ? undefined
    : isH
      ? "home"
      : isA
        ? "wall"
        : page
          ? "page"
          : isP
            ? "card"
            : "work"
  const sec = cur && (cur.kind === "work" || cur.kind === "wall") ? cat.secOf(cur) : null
  const kick = !cur
    ? ""
    : isH
      ? ""
      : page
        ? page.kick || "Info"
        : curPhone
          ? `${sec!.name} · ${isA ? cat.art.length + " pieces" : cur.kind === "work" ? cur.group : ""}`
          : `${cat.num(cur)} / ${pad(sec!.n)} · ${sec!.name}`
  const tag = !cur || isH ? "" : isA ? (curPhone ? WALL_TAG_SHORT : WALL_TAG_LONG) : captionOf(cur)
  const meta: [string, string][] = !cur
    ? []
    : isH
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
        <TitleCard on={isH} phone={curPhone} />
        <AboutCard w={page && page.id === "about" ? page : null} />
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
          <h2 id="pl-title">{isH ? "" : (cur?.title ?? "")}</h2>
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
            onClick={(e) => {
              if (!cur || e.detail > 1) return
              void actions.pick(cur)
            }}
          >
            {openLabel} <i>→</i>
          </button>
        </div>
      </div>
    </main>
  )
}
