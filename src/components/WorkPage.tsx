/* A project page: head (title, tagline), the hero across the full width with the meta grid and the parts' jump links
   under it, a sticky table of contents with a scroll spy (and the story's parts under it, spied too), the story with
   its images, and the "Next up" band. */
import { Fragment, useEffect, useRef, useState, type MouseEvent } from "react"
import { cx } from "../cx"
import type { WorkEntry } from "../data/types"
import { RM } from "../env"
import { heroOf, thumbOf } from "../media"
import { openPath } from "../paths"
import { useReel } from "../reel/context"
import { pad, rich, slug } from "../text"
import { BlockView, FxHero, PjImg } from "./Blocks"

type SecKey = "overview" | "story" | "next"

export function WorkPage({ w }: { w: WorkEntry }) {
  const { cat, actions } = useReel()
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<SecKey | null>(null)
  const [part, setPart] = useState<string | null>(null)

  /* scroll spy */
  useEffect(() => {
    const el = root.current
    if (!el || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return
          const c = e.target.classList
          setActive(
            c.contains("pj-story") ? "story" : c.contains("pj-nextband") ? "next" : "overview",
          )
        })
      },
      { rootMargin: "-35% 0px -55% 0px" },
    )
    /* the overview is the head, the hero, the meta under it and the summary */
    el.querySelectorAll(".pj-head,.pj-hero,.pj-facts,.pj-lead,.pj-story,.pj-nextband").forEach(
      (s) => io.observe(s),
    )
    return () => io.disconnect()
  }, [w.id])

  /* the parts' spy: the current part is the last heading above a line a third of the way down the pane, none once
     the story has scrolled past it */
  useEffect(() => {
    const el = root.current
    const sc = el?.closest("#proj")
    const hs = el ? [...el.querySelectorAll<HTMLElement>(".pj-story .pj-h")] : []
    if (!el || !sc || hs.length < 2) return
    let raf = 0
    const spy = () => {
      raf = 0
      const line = sc.getBoundingClientRect().top + sc.clientHeight * 0.35
      let cur: string | null = null
      for (const h of hs) if (h.getBoundingClientRect().top <= line) cur = h.id
      const story = el.querySelector(".pj-story")
      if (story && story.getBoundingClientRect().bottom < line) cur = null
      setPart(cur)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(spy)
    }
    /* images loading above a heading move it without a scroll */
    const ro = "ResizeObserver" in window ? new ResizeObserver(onScroll) : null
    sc.addEventListener("scroll", onScroll, { passive: true })
    ro?.observe(el)
    raf = requestAnimationFrame(spy)
    return () => {
      sc.removeEventListener("scroll", onScroll)
      ro?.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [w.id])

  const jumpTo = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const t = root.current?.querySelector(e.currentTarget.getAttribute("href") ?? "")
    t?.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" })
  }
  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    void actions.projGo(id)
  }

  const minimal = !!w.minimal
  const n = cat.next(w.id, 1)
  const n2 = cat.next(w.id, 2)
  const n3 = cat.next(w.id, 3)
  const recs = cat.recOf(w.id)
  /* a lone "code available upon request" mailto is not a Links row; real links still show it alongside them */
  const linkList = w.links ?? []
  const onlyRequest = linkList.length > 0 && linkList.every((l) => /upon request/i.test(l[0]))
  const meta: [string, React.ReactNode][] = minimal
    ? []
    : [
        ["Year", w.year],
        ["Area", w.group],
        ["Stack", w.tags.join(", ")],
        [
          "Recognition",
          recs.length
            ? recs.map((r, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  <a
                    href={openPath("recognition")}
                    data-go="recognition"
                    onClick={go("recognition")}
                  >
                    {r.title + (r.detail ? " · " + r.detail : "")}
                  </a>
                </Fragment>
              ))
            : "",
        ],
        [
          "Links",
          onlyRequest
            ? ""
            : linkList.map(([t, href], i) => (
                <Fragment key={i}>
                  {i > 0 && " · "}
                  <a
                    href={href}
                    target={/^https?:/.test(href) ? "_blank" : undefined}
                    rel={/^https?:/.test(href) ? "noopener" : undefined}
                  >
                    {t}
                  </a>
                </Fragment>
              )),
        ],
      ]
  const metaCells = meta.filter((r) => (Array.isArray(r[1]) ? r[1].length > 0 : !!r[1]))
  const blocks = w.blocks
  const hasStory = blocks.length > 0
  /* several headed parts (Procedural): jump links under the meta, and listed under the table of contents where it
     runs down the side */
  const heads = blocks.flatMap((b) => ("h" in b && !("img" in b) ? [b.h] : []))
  const secs: [SecKey, string][] = [["overview", "Overview"]]
  if (hasStory && !minimal) secs.push(["story", "Story"])
  secs.push(["next", "Next"])
  const np = cat.pos(n.id)
  const nt = "thumb" in n ? thumbOf(n) : ""
  const nextLabel = ("label" in n && n.label) || n.title
  const nextSub =
    n.kind === "work" || n.kind === "art"
      ? n.tagline || n.sub || ""
      : n.kind === "page"
        ? n.tagline || n.sub || ""
        : ""

  return (
    <div className="pj-wrap is-work" ref={root}>
      <header className="pj-head" id="pj-overview">
        <p className="pj-kick">
          {w.group}
          {w.year ? " · " + w.year : ""}
        </p>
        <h1 className={cx("pj-title", /\S{12,}/.test(w.title) && "pj-title--long")}>{w.title}</h1>
        {(w.tagline || w.sub) && <p className="pj-tag">{w.tagline || w.sub}</p>}
      </header>
      {w.fx ? (
        <FxHero fx={w.fx} />
      ) : (
        <figure className="pj-hero">
          <PjImg src={heroOf(w)} alt={w.title} variant="hero" />
        </figure>
      )}
      {(metaCells.length > 0 || heads.length > 1) && (
        <div className="pj-facts">
          {metaCells.length > 0 && (
            <dl className="pj-meta">
              {metaCells.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {heads.length > 1 && (
            <nav className="pj-jump" aria-label="Parts">
              {heads.map((t) => (
                <a key={t} className="btn" href={"#pj-h-" + slug(t)} onClick={jumpTo}>
                  {t}
                </a>
              ))}
            </nav>
          )}
        </div>
      )}
      <nav className="pj-toc" aria-label="On this page">
        <p>On this page</p>
        {secs.map(([k, t]) => (
          <a
            key={k}
            href={"#pj-" + (k === "next" ? "nextband" : k)}
            data-sec={k}
            className={cx(active === k && "on")}
            onClick={jumpTo}
          >
            {t}
          </a>
        ))}
        {heads.length > 1 && (
          <div className="pj-parts">
            <p>Parts</p>
            {heads.map((t) => (
              <a
                key={t}
                href={"#pj-h-" + slug(t)}
                className={cx(part === "pj-h-" + slug(t) && "on")}
                onClick={jumpTo}
              >
                {t}
              </a>
            ))}
          </div>
        )}
      </nav>
      <div className="pj-main">
        {w.summary && (
          <section className="pj-sec pj-lead">
            <p>{rich(w.summary)}</p>
          </section>
        )}
        {minimal ? (
          <section className="pj-sec pj-lead pj-min">
            {blocks.map((b, i) => (
              <BlockView key={i} b={b} />
            ))}
          </section>
        ) : (
          hasStory && (
            <section className="pj-sec pj-story" id="pj-story">
              <h2>Story</h2>
              {blocks.map((b, i) => (
                <BlockView key={i} b={b} />
              ))}
            </section>
          )
        )}
      </div>
      <section className="pj-nextband" id="pj-nextband">
        <p className="pj-nlab">Next up</p>
        <a className="pj-ncard" href={openPath(n.id)} data-act="next" onClick={go(n.id)}>
          {nt ? (
            <PjImg src={nt} alt="" variant="card" />
          ) : (
            <span className="pj-ntile">{nextLabel}</span>
          )}
          <span>
            <small>
              {pad(np.i)} / {pad(np.n)} · {np.sec ? np.sec.name : "group" in n ? n.group : ""}
            </small>
            <b>{n.title}</b>
            <em>{nextSub}</em>
          </span>
          <i>→</i>
        </a>
        <div className="pj-then">
          <span>Then</span>
          <a href={openPath(n2.id)} data-go={n2.id} onClick={go(n2.id)}>
            {n2.title}
          </a>
          <a href={openPath(n3.id)} data-go={n3.id} onClick={go(n3.id)}>
            {n3.title}
          </a>
        </div>
      </section>
    </div>
  )
}
