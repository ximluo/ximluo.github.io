import type { ReactNode } from "react"
import type { ArtEntry, Entry } from "./data/types"

export const pad = (n: number) => (n < 10 ? "0" : "") + n

export const slug = (s: string) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const LINK = /\[([^\]]+)\]\(((?:https?:|mailto:)[^)\s]+)\)/g
const BOLD = /\*\*([^*]+)\*\*/g

function bold(s: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of s.matchAll(BOLD)) {
    if (m.index > last) out.push(s.slice(last, m.index))
    out.push(<b key={`${key}b${i++}`}>{m[1]}</b>)
    last = m.index + m[0].length
  }
  if (last < s.length) out.push(s.slice(last))
  return out
}

/** The content's mini markdown: `[text](url)` links (mailto links open in place, the rest in a new tab) and `**bold**`. */
export function rich(s: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of s.matchAll(LINK)) {
    if (m.index > last) out.push(...bold(s.slice(last, m.index), `t${i}`))
    const url = m[2] ?? ""
    const ext = !/^mailto:/.test(url)
    out.push(
      <a
        key={`a${i}`}
        href={url}
        target={ext ? "_blank" : undefined}
        rel={ext ? "noopener" : undefined}
      >
        {bold(m[1] ?? "", `l${i}`)}
      </a>,
    )
    i++
    last = m.index + m[0].length
  }
  if (last < s.length) out.push(...bold(s.slice(last), `t${i}`))
  return out
}

/** Art awards are free text, or `Link: host/path` for a link shown in their place. */
export function awardOf(award: string): { text: string; href?: string } | null {
  if (!award) return null
  if (/^Link:/.test(award)) {
    const text = award.replace(/^Link:\s*/, "")
    return { text, href: "https://" + text }
  }
  return { text: award }
}

/** The caption line under a title in the player. */
export function captionOf(w: Entry) {
  if (w.kind === "art") return [w.sub, awardOf(w.award)?.text].filter(Boolean).join(" · ")
  if (w.kind === "wall" || w.kind === "home") return ""
  return w.tagline || w.sub || ""
}

/** The size written in an art piece's subtitle, e.g. 20" x 25". */
export const sizeOf = (w: ArtEntry) => (w.sub || "").match(/\d+"\s*x\s*\d+"/)?.[0] ?? ""
