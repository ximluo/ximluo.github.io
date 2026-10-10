/* The film furniture around the site: the flash, viewfinder corners, grain, vignette and the cursor. */
import { useDomRef } from "../reel/context"

export const Flash = () => <div id="flash" aria-hidden="true" ref={useDomRef("flash")}></div>

export const Corners = () => (
  <>
    <i className="vf tl"></i>
    <i className="vf tr"></i>
    <i className="vf bl"></i>
    <i className="vf br"></i>
  </>
)

export const Grain = () => <canvas id="grain" aria-hidden="true" ref={useDomRef("grain")}></canvas>

export const Vignette = () => <div id="vignette" aria-hidden="true"></div>

export const Cursor = () => (
  <div id="cursor" aria-hidden="true" ref={useDomRef("cursor")}>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <b></b>
  </div>
)
