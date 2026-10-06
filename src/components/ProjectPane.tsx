/* The docked pane a project or info page opens in. reel/project.ts shows and hides it with the split cut; the
   rendered page follows `pageId`, which changes at the midpoint of a swap. */
import { useLayoutEffect, useRef } from "react"
import { useDomRef, useReel, useReelState } from "../reel/context"
import { AboutPage } from "./AboutPage"
import { RecognitionPage } from "./RecognitionPage"
import { WorkPage } from "./WorkPage"

export function ProjectPane() {
  const { cat } = useReel()
  const pageId = useReelState((s) => s.pageId)
  const domRef = useDomRef("proj")
  const ref = useRef<HTMLDivElement>(null)
  const w = pageId ? cat.get(pageId) : undefined

  /* a new page starts at the top */
  useLayoutEffect(() => {
    if (pageId && ref.current) ref.current.scrollTop = 0
  }, [pageId])

  return (
    <div
      id="proj"
      className="pj"
      hidden
      data-pj={w?.id}
      data-kind={w?.kind}
      ref={(el) => {
        ref.current = el
        domRef(el)
      }}
    >
      {w?.kind === "work" && <WorkPage key={w.id} w={w} />}
      {w?.kind === "page" &&
        (w.id === "about" ? <AboutPage key="about" /> : <RecognitionPage key="recognition" />)}
    </div>
  )
}
