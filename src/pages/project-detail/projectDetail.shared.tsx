import type { JSX } from "react"
import projects from "../../data/projects"

export type ProjectRecord = (typeof projects)[number]

export const DETAIL_IMAGE_SIZES = "(max-width: 840px) calc(100vw - 40px), 800px"
export const DETAIL_EMBED_MAX_WIDTH = "600px"
export const GIF_LOAD_AHEAD_MARGIN = "650px 0px"
export const VIDEO_EMBED_LOAD_AHEAD_MARGIN = "900px 0px"
export const PDF_EMBED_LOAD_AHEAD_MARGIN = "800px 0px"

const preconnectedEmbedOrigins = new Set<string>()

export function isPdfSource(source: string) {
  return /\.pdf(?:$|[?#])/i.test(source)
}

export function isGifSource(source: string) {
  return /\.gif(?:$|[?#])/i.test(source)
}

export function preconnectToEmbedOrigin(source: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return

  let url: URL
  try {
    url = new URL(source, window.location.href)
  } catch {
    return
  }

  if (url.origin === window.location.origin || preconnectedEmbedOrigins.has(url.origin)) {
    return
  }

  preconnectedEmbedOrigins.add(url.origin)

  const dnsPrefetch = document.createElement("link")
  dnsPrefetch.rel = "dns-prefetch"
  dnsPrefetch.href = url.origin
  document.head.appendChild(dnsPrefetch)

  const preconnect = document.createElement("link")
  preconnect.rel = "preconnect"
  preconnect.href = url.origin
  preconnect.crossOrigin = ""
  document.head.appendChild(preconnect)
}

export function parseTextWithLinks(text: string) {
  const elements: (string | JSX.Element)[] = []
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = linkRegex.exec(text)) !== null) {
    const [fullMatch, mdLabel, mdUrl, rawUrl] = match
    const index = match.index

    if (lastIndex < index) {
      elements.push(text.slice(lastIndex, index))
    }

    const url = mdUrl || rawUrl!
    const label = mdLabel || rawUrl!

    elements.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="project-detail-inline-link"
      >
        {label}
      </a>,
    )

    lastIndex = index + fullMatch.length
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex))
  }

  return elements
}
