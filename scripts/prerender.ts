/* Runs after `vite build`: one HTML file per route, so GitHub Pages answers /painterly, /about, /art and
   /art/<id> directly with a 200 and each page carries its own title, description and preview image. Every file
   is dist/index.html with its head tags swapped; the app then reads the path. Also writes the sitemap. Imports
   only the content and src/paths.ts, since nothing here can touch the DOM. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { ART } from "../src/data/art"
import { PAGES } from "../src/data/pages"
import { WORK } from "../src/data/work"
import { artPath, openPath } from "../src/paths"

const SITE = "https://ximingluo.com"
const NAME = "Ximing Luo"
const DIST = fileURLToPath(new URL("../dist/", import.meta.url))
const DEFAULT_IMAGE = "/logo512.png"
const WALL_DESCRIPTION =
  "Ink, charcoal, woodburn, scratchboard, sculpture, digital and photography. Enter the wall to drag around and enlarge any piece."

interface Page {
  path: string
  title: string
  description: string
  /** Site-relative. */
  image: string
  alt: string
}

/* the same rule as src/media.ts, which this script must not import */
const media = (p: string) => (/^(https?:|data:|\/)/.test(p) ? p : "/media/" + p)

/** The hero when link scrapers can read it (jpg or png), otherwise the JPEG thumbnail. */
const picture = (e: { hero: string; thumb: string }) =>
  media(/\.(jpe?g|png)$/i.test(e.hero) ? e.hero : e.thumb)

/** Plain text for a meta tag: markdown links and bold dropped, cut at a word near `max` characters. */
function plain(s: string, max = 160) {
  const t = s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
  if (t.length <= max) return t
  const head = t.slice(0, max - 1)
  const at = head.lastIndexOf(" ")
  return head.slice(0, at > 80 ? at : head.length).replace(/[,;:.]$/, "") + "…"
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const first = ART[0]!
const pages: Page[] = [
  ...WORK.map((w) => ({
    path: openPath(w.id),
    title: w.title,
    description: plain(w.summary || w.tagline || w.sub),
    image: picture(w),
    alt: w.title,
  })),
  ...PAGES.map((p) => ({
    path: openPath(p.id),
    title: p.title,
    description: plain(p.tagline),
    image: DEFAULT_IMAGE,
    alt: NAME,
  })),
  {
    path: artPath(),
    title: "Artworks",
    description: WALL_DESCRIPTION,
    image: picture(first),
    alt: first.title,
  },
  ...ART.map((a) => ({
    path: artPath(a.id),
    title: a.title,
    description: plain([a.group, a.sub].filter(Boolean).join(" · ")),
    image: picture(a),
    alt: a.title,
  })),
]

/** Swaps the text a head tag carries, however Prettier wrapped it; a tag that is missing fails the build. */
function setTag(html: string, what: string, re: RegExp, value: string) {
  if (!re.test(html)) throw new Error(`index.html has no ${what}`)
  return html.replace(re, `$1${esc(value)}$2`)
}
const meta = (attr: "name" | "property", key: string) =>
  new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`)

function render(shell: string, p: Page) {
  const url = SITE + p.path
  const title = `${p.title} · ${NAME}`
  const image = SITE + p.image
  let h = shell
  h = setTag(h, "title", /(<title>)[^<]*(<\/title>)/, title)
  h = setTag(h, "canonical", /(<link rel="canonical" href=")[^"]*(")/, url)
  h = setTag(h, "description", meta("name", "description"), `${p.title}. ${p.description}`)
  h = setTag(h, "og:url", meta("property", "og:url"), url)
  h = setTag(h, "twitter:url", meta("name", "twitter:url"), url)
  h = setTag(h, "og:title", meta("property", "og:title"), title)
  h = setTag(h, "twitter:title", meta("name", "twitter:title"), title)
  h = setTag(h, "og:description", meta("property", "og:description"), p.description)
  h = setTag(h, "twitter:description", meta("name", "twitter:description"), p.description)
  h = setTag(h, "og:image", meta("property", "og:image"), image)
  h = setTag(h, "twitter:image", meta("name", "twitter:image"), image)
  if (p.image !== DEFAULT_IMAGE) {
    /* the picture's size is not known here, and a wide picture gets the large card */
    h = h.replace(/\s*<meta property="og:image:(?:width|height)" content="\d+" \/>/g, "")
    h = setTag(h, "twitter:card", meta("name", "twitter:card"), "summary_large_image")
  }
  h = h.replace(
    /(<meta property="og:image" content="[^"]*" \/>)/,
    `$1\n    <meta property="og:image:alt" content="${esc(p.alt)}" />`,
  )
  return h
}

function write(file: string, text: string) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
}

const shell = readFileSync(join(DIST, "index.html"), "utf8")
let n = 0
for (const p of pages) {
  const html = render(shell, p)
  write(join(DIST, p.path.slice(1) + ".html"), html)
  n++
  if (p.path === artPath()) {
    /* /art/ with the slash is answered by a folder index */
    write(join(DIST, "art", "index.html"), html)
    n++
  }
}
const urls = ["/", ...pages.map((p) => p.path)]
write(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`,
)
console.log(`prerender: ${n} pages, sitemap with ${urls.length} urls`)
