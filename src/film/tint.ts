/* The page light: a colour taken from the current thumbnail, lifted to a usable saturation and lightness, written
   to --tr/--tg/--tb on the root. Images themselves are never tinted. */
import tintsJson from "../data/tints.json"
import type { Entry, Tints } from "../data/types"
import { clamp } from "./tween"

const TINTS = tintsJson as unknown as Tints
const FALLBACK: [number, number, number] = [196, 22, 28]

function hsl2rgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255)) as [number, number, number]
}

export function tintOf(thumb: string | undefined): [number, number, number] {
  const t = (thumb && TINTS[thumb]) || FALLBACK
  const r = t[0] / 255
  const g = t[1] / 255
  const b = t[2] / 255
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const d = mx - mn
  let h = 0
  const l = (mx + mn) / 2
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0
  if (d) {
    h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
    h = (h * 60 + 360) % 360
  }
  if (s < 0.12) return [150, 152, 158]
  return hsl2rgb(h / 360, clamp(s * 1.2 + 0.08, 0.35, 0.95), clamp(l, 0.46, 0.58))
}

export function setTint(entry: Entry | null) {
  const [r, g, b] = entry && "thumb" in entry ? tintOf(entry.thumb) : FALLBACK
  const st = document.documentElement.style
  st.setProperty("--tr", String(r))
  st.setProperty("--tg", String(g))
  st.setProperty("--tb", String(b))
}
