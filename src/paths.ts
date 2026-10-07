/* The site's paths, shared by the router in the browser and the prerender step in Node, so this file imports
   nothing. A project or an info page sits at the root (/painterly, /about), the wall at /art and an enlarged
   piece at /art/<id>; /index is the player with every section unfolded. */

export const ART_PATH = "/art"
export const INDEX_PATH = "/index"

export const openPath = (id: string) => "/" + id
export const artPath = (id = "") => (id ? `${ART_PATH}/${id}` : ART_PATH)

export interface PathRoute {
  /** `/<id>`: a project or an info page. */
  open: string | null
  art: boolean
  artId: string
  index: boolean
}

const ID = /^[a-z0-9-]+$/

/** What a pathname names. Trailing slashes and the `.html` GitHub Pages also answers to are ignored; anything
    unknown is the home page. */
export function parsePath(pathname: string): PathRoute {
  const r: PathRoute = { open: null, art: false, artId: "", index: false }
  const parts = pathname.split("/").filter(Boolean)
  const last = parts[parts.length - 1]
  if (last === "index.html") parts.pop()
  else if (last?.endsWith(".html")) parts[parts.length - 1] = last.slice(0, -5)
  const [a, b] = parts
  if (!a) return r
  if (a === "art" && parts.length <= 2) {
    r.art = true
    if (b && ID.test(b)) r.artId = b
  } else if (parts.length === 1 && a === "index") r.index = true
  else if (parts.length === 1 && ID.test(a)) r.open = a
  return r
}
