/* The ink field over the Home and About frames: mounted while either frame is up and nothing is open over it, torn
   down the moment something is (stepping between the two keeps it running). The reel never sees it; it reads the
   store like any other component. */
import { useEffect, useRef } from "react"
import { mountInkField } from "../gl/inkfield"
import { useReelState } from "../reel/context"

export function InkField() {
  const on = useReelState(
    (s) =>
      s.started &&
      !s.projOn &&
      (s.cur?.kind === "home" || (s.cur?.kind === "page" && s.cur.id === "about")),
  )
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !on) return
    const q = (sel: string) => document.querySelector(sel)
    const fx = mountInkField(el, {
      /* the name's block, the About card's stack and its photo (a hidden frame measures empty and takes no slot),
         the HUD corners with text in them; the phone bar on phones */
      shades: () => [
        { el: q("#pl-home .ph-text"), pad: 24, k: 0.7 },
        { el: q("#pl-about .pa-text"), pad: 24, k: 0.7 },
        { el: q("#pl-about .pa-fig"), pad: 0, k: 0.4 },
        { el: q("#hud .h-tl"), pad: 14, k: 0.65 },
        { el: q("#hud .h-bl"), pad: 14, k: 0.65 },
        { el: q("#hud .h-br"), pad: 14, k: 0.65 },
        { el: q("#mbar"), pad: 0, k: 0.5 },
      ],
    })
    return () => fx?.destroy()
  }, [on])
  return <div id="ink" aria-hidden="true" hidden={!on} ref={ref}></div>
}
