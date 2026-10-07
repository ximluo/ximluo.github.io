/* The site has one page and routes by path: /<id> for a project or an info page, /art and /art/<id> for the
   wall and an enlarged piece, /index for the player with every section unfolded, plus two switches read once at
   start (?skipintro, ?tint=grey). Every route is also a prerendered file (scripts/prerender.ts), so a path loads
   straight from GitHub Pages. Links of the old shape (/?open=<id>, /?art=<id>, /?about) are still read, and the
   address is rewritten to the path once the site is up. A project pushes a history entry so the back button
   closes it; everything else replaces the current one. */
import { INTRO_SEEN_KEY } from "./film/leader"
import { openPath, parsePath, type PathRoute } from "./paths"

/** Query keys of the old shape. Any of them on the home path is a deep link, which skips the opening leader. */
const LEGACY_KEYS = ["index", "open", "room", "about", "recognition", "view", "art"]

export interface Route extends PathRoute {
  noIntro: boolean
  tintGrey: boolean
  /** Read from a query string of the old shape; createReel rewrites the address to the path. */
  legacy: boolean
}

export function readRoute(pathname = location.pathname, search = location.search): Route {
  const Q = new URLSearchParams(search)
  const path = parsePath(pathname)
  const home = !path.open && !path.art && !path.index
  const legacy = home && LEGACY_KEYS.some((k) => Q.has(k))
  const r: PathRoute = legacy
    ? {
        open:
          Q.get("open") || (Q.has("about") ? "about" : Q.has("recognition") ? "recognition" : null),
        art: Q.has("art") || Q.get("room") === "art",
        artId: Q.get("art") || "",
        index: Q.has("index") || Q.get("view") === "list",
      }
    : path
  let noIntro = !home || legacy || Q.has("skipintro")
  try {
    /* every visit after the first in this browser skips the leader too; the top-left name still replays it */
    if (localStorage.getItem(INTRO_SEEN_KEY) === "1") noIntro = true
  } catch {
    /* storage may be unavailable */
  }
  return { ...r, noIntro, tintGrey: Q.get("tint") === "grey", legacy }
}

const REEL_STATE = { reel: 1 }

function safely(f: () => void) {
  try {
    f()
  } catch {
    /* history can refuse in sandboxed frames */
  }
}

export const nav = {
  /** A project opened from the site: a new history entry, so Back closes it. */
  pushOpen: (id: string) => safely(() => history.pushState(REEL_STATE, "", openPath(id))),
  /** Moving between projects inside the open pane. */
  replaceOpen: (id: string) => safely(() => history.replaceState(REEL_STATE, "", openPath(id))),
  /** The wall and its pieces keep whatever entry is current; null is the home path. */
  replace: (path: string | null) =>
    safely(() => history.replaceState(history.state, "", path || "/")),
  clear: () => safely(() => history.replaceState(null, "", "/")),
  /** True when the current entry was pushed by `pushOpen`, so closing should go back instead. */
  openedHere: () => (history.state as { reel?: number } | null)?.reel === 1,
}
