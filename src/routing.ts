/* The site has one page and routes by query string: ?open=<id> for a project or an info page, ?art[=<id>] for the
   wall and an enlarged piece, plus a few switches read once at start. A project pushes a history entry so the
   back button closes it; everything else replaces the current one. */
import { INTRO_SEEN_KEY } from "./film/leader"

/** Any of these on the URL means a deep link, which skips the opening leader. */
export const NO_INTRO_KEYS = [
  "skipintro",
  "index",
  "open",
  "room",
  "about",
  "recognition",
  "view",
  "art",
] as const

export interface Route {
  /** `?open=<id>`, with `?about` and `?recognition` as shorthands. */
  open: string | null
  art: boolean
  artId: string
  index: boolean
  noIntro: boolean
  tintGrey: boolean
}

export function readRoute(search = location.search): Route {
  const Q = new URLSearchParams(search)
  let noIntro = NO_INTRO_KEYS.some((k) => Q.has(k))
  try {
    /* every visit after the first in this browser skips the leader too; the top-left name still replays it */
    if (localStorage.getItem(INTRO_SEEN_KEY) === "1") noIntro = true
  } catch {
    /* storage may be unavailable */
  }
  return {
    open: Q.get("open") || (Q.has("about") ? "about" : Q.has("recognition") ? "recognition" : null),
    art: Q.has("art") || Q.get("room") === "art",
    artId: Q.get("art") || "",
    index: Q.has("index") || Q.get("view") === "list",
    noIntro,
    tintGrey: Q.get("tint") === "grey",
  }
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
  pushOpen: (id: string) => safely(() => history.pushState(REEL_STATE, "", "?open=" + id)),
  /** Moving between projects inside the open pane. */
  replaceOpen: (id: string) => safely(() => history.replaceState(REEL_STATE, "", "?open=" + id)),
  /** The wall and its pieces keep whatever entry is current. */
  replace: (q: string | null) =>
    safely(() => history.replaceState(history.state, "", q || location.pathname)),
  clear: () => safely(() => history.replaceState(null, "", location.pathname)),
  /** True when the current entry was pushed by `pushOpen`, so closing should go back instead. */
  openedHere: () => (history.state as { reel?: number } | null)?.reel === 1,
}
