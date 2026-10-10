/* The site, in the order the stylesheet layers it: the three columns (list, scrubber, player or wall), the ink field
   over them on Home, then the overlays, the HUD, the phone bar, and the film furniture on top. */
import { useEffect } from "react"
import { Corners, Cursor, Flash, Grain, Vignette } from "./components/Film"
import { FullImage } from "./components/FullImage"
import { Hud } from "./components/Hud"
import { InkField } from "./components/InkField"
import { Leader } from "./components/Leader"
import { CloseX, PageNav } from "./components/PageNav"
import { PhoneBar } from "./components/PhoneBar"
import { Player } from "./components/Player"
import { ProjectPane } from "./components/ProjectPane"
import { Sidebar } from "./components/Sidebar"
import { Ticks } from "./components/Ticks"
import { WallPanel } from "./components/WallPanel"

export function App({ start, stop }: { start(): void; stop(): void }) {
  useEffect(() => {
    start()
    return stop
  }, [start, stop])
  return (
    <>
      <div id="split">
        <Sidebar />
        <Ticks />
        <Player />
        <WallPanel />
      </div>
      <InkField />
      <FullImage />
      <ProjectPane />
      <CloseX />
      <PageNav />
      <Flash />
      <Hud />
      <PhoneBar />
      <Corners />
      <Leader />
      <Grain />
      <Vignette />
      <Cursor />
    </>
  )
}
