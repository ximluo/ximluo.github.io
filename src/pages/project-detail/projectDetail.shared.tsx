import type { JSX } from "react"
import type { Project } from "../../data/projects"

export type ProjectRecord = Project

export const DETAIL_IMAGE_SIZES = "(max-width: 840px) calc(100vw - 40px), 800px"
export const GIF_LOAD_AHEAD_MARGIN = "650px 0px"
export const VIDEO_EMBED_LOAD_AHEAD_MARGIN = "900px 0px"
export const PDF_EMBED_LOAD_AHEAD_MARGIN = "800px 0px"

const preconnectedEmbedOrigins = new Set<string>()

export function isPdfSource(source: string) {
  return /\.pdf(?:$|[?#])/i.test(source)
}

export function getPdfLinkLabel(source: string, fallbackTitle: string) {
  const sourcePath = source.split(/[?#]/)[0]
  const fileName = decodeURIComponent(sourcePath.split("/").pop() ?? "")
  const title = fileName
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()

  return `Open ${title || fallbackTitle} PDF`
}

export { isGifSource } from "../../utils/media"

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

    // The regex guarantees one of mdUrl/rawUrl matched; fullMatch is a safe
    // last resort that keeps the types honest without a non-null assertion.
    const url = mdUrl || rawUrl || fullMatch
    const label = mdLabel || url

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

export function getFirstSentence(text: string) {
  const trimmed = text.trim()
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/)
  return match?.[0] ?? trimmed
}

export function getProjectTimeline(project: ProjectRecord) {
  if (project.timeline?.trim()) return project.timeline

  const text = [
    project.description,
    ...project.sections.flatMap((section) => [section.text ?? "", section.image ?? "", section.video ?? ""]),
  ].join(" ")

  const years = Array.from(new Set(text.match(/\b20\d{2}\b/g) ?? []))
  return years.length ? years.join(" / ") : "Selected work"
}

export function getProjectRelatedLink(project: ProjectRecord) {
  if (project.source?.href?.trim()) return project.source

  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g

  for (const section of project.sections) {
    if (!section.text) continue
    const match = linkRegex.exec(section.text)
    linkRegex.lastIndex = 0
    if (!match) continue

    const [, mdLabel, mdUrl, rawUrl] = match
    const href = mdUrl || rawUrl
    if (!href) continue
    return {
      label: mdLabel || rawUrl || "Open link",
      href,
    }
  }

  return null
}
