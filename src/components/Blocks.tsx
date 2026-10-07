/* Story blocks on a project page: paragraphs, headings, figures (one image, or a row of them), embedded video,
   click-to-load live demos and document links. Images fade in once loaded. */
import { useEffect, useRef, useState, type MouseEvent } from "react"
import { cx } from "../cx"
import type { Block, FxName, ImgRef } from "../data/types"
import { media } from "../media"
import { useReel } from "../reel/context"
import { rich, slug } from "../text"
import { mountFx, unmountFx } from "../wall/fx"

type ImgVariant = "figure" | "hero" | "card" | "poster"

interface PjImgProps {
  src: string
  alt?: string
  w?: number
  h?: number
  /** figure: a story image (lazy, zoomable, cursor hot); hero: the page's picture (zoomable); card: the Next up
      thumbnail; poster: the still inside a click-to-load demo. */
  variant?: ImgVariant
}

/** An image in the page that fades in once it has loaded (cached images count as loaded at once). */
export function PjImg({ src, alt = "", w, h, variant = "figure" }: PjImgProps) {
  const { actions } = useReel()
  const [ok, setOk] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const im = ref.current
    if (im && im.complete && im.naturalWidth) setOk(true)
  }, [src])
  const zoom = variant === "figure" || variant === "hero"
  const lazy = variant === "figure" || variant === "poster"
  return (
    <img
      ref={ref}
      className={cx(ok && "ok")}
      src={media(src)}
      width={w}
      height={w ? h : undefined}
      alt={alt}
      loading={lazy ? "lazy" : undefined}
      decoding={variant === "card" ? undefined : "async"}
      data-hot={lazy ? "" : undefined}
      style={variant === "hero" || variant === "card" ? { filter: "none" } : undefined}
      onLoad={() => setOk(true)}
      onClick={
        zoom
          ? (e: MouseEvent<HTMLImageElement>) =>
              /* a double-click's second click lands on the overlay; neither click may undo the other */
              e.detail < 2 &&
              actions.openFull(
                e.currentTarget.currentSrc || e.currentTarget.src,
                e.currentTarget.alt,
              )
          : undefined
      }
    />
  )
}

const refImg = (o: ImgRef, key: number) =>
  typeof o === "string" ? (
    <PjImg key={key} src={o} />
  ) : (
    <PjImg key={key} src={o.src} w={o.w} h={o.h} alt={o.alt} />
  )

function Fig({ c, cap, children }: { c?: string; cap?: string; children: React.ReactNode }) {
  return (
    <figure className={cx("pj-fig", c)}>
      {children}
      {cap && <figcaption>{rich(cap)}</figcaption>}
    </figure>
  )
}

function Live({ url, poster, cap }: { url: string; poster?: string; cap?: string }) {
  const [loaded, setLoaded] = useState(false)
  if (loaded)
    return (
      <figure className="pj-fig live">
        <iframe
          src={url}
          allow="microphone; autoplay; fullscreen"
          allowFullScreen
          title="Live demo"
        ></iframe>
        <p className="pj-livenote mono">
          <a href={url} target="_blank" rel="noopener">
            Open in a new tab <i>↗</i>
          </a>
        </p>
      </figure>
    )
  return (
    <Fig c="live">
      <a
        className="pj-live"
        href={url}
        target="_blank"
        rel="noopener"
        data-live={url}
        data-hot=""
        onClick={(e) => {
          e.preventDefault()
          setLoaded(true)
        }}
      >
        {poster && <PjImg src={poster} alt={cap || ""} variant="poster" />}
        <span>
          <b>Play live</b>
          <em>{cap || url}</em>
        </span>
      </a>
    </Fig>
  )
}

export function BlockView({ b }: { b: Block }) {
  if ("p" in b) return <p>{rich(b.p)}</p>
  if ("img" in b)
    return (
      <Fig cap={b.cap}>
        <PjImg src={b.img} w={b.w} h={b.h} alt={b.alt} />
      </Fig>
    )
  if ("row" in b)
    return (
      <Fig c={"n" + Math.min(b.row.length, 4)} cap={b.cap}>
        {b.row.map(refImg)}
      </Fig>
    )
  if ("embed" in b)
    return (
      <Fig c="emb" cap={b.cap}>
        <iframe
          src={b.embed}
          loading="lazy"
          allow="autoplay; fullscreen"
          allowFullScreen
          title={b.cap || "Embedded video"}
        ></iframe>
      </Fig>
    )
  if ("live" in b) return <Live url={b.live} poster={b.poster} cap={b.cap} />
  if ("link" in b)
    return (
      <p className="pj-doc">
        <a href={media(b.link)} target="_blank" rel="noopener">
          {b.cap || "Open"} <i>↗</i>
        </a>
      </p>
    )
  return (
    <h3 className="pj-h" id={"pj-h-" + slug(b.h)}>
      {b.h}
    </h3>
  )
}

/** A hero drawn by a canvas effect instead of a picture. */
export function FxHero({ fx }: { fx: FxName }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    mountFx(el, fx)
    return () => unmountFx(el)
  }, [fx])
  return <div className="pj-hero pj-hero--fx" data-fx={fx} ref={ref}></div>
}
