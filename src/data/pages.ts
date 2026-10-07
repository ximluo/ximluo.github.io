/* The two info pages, About and Recognition, as entries of the Info room, plus the recognition helpers both the
   page and the project pages use. */
import { AB } from "./about"
import { RECOGNITION } from "./recognition"
import type { PageEntry, Recognition, RecognitionType } from "./types"

/** The latest four-digit year in a span like "2020-2022". */
export const yearOf = (r: Recognition) => {
  const m = String(r.year).match(/\d{4}(?!.*\d{4})/)
  return m ? +m[0] : 0
}

export const sortedByYear = (xs: readonly Recognition[]) =>
  xs.slice().sort((a, b) => yearOf(b) - yearOf(a))

export const RECOGNITION_TYPES: [RecognitionType, string][] = [
  ["residency", "Residencies"],
  ["exhibition", "Exhibitions"],
  ["award", "Awards"],
  ["fellowship", "Fellowships"],
  ["scholarship", "Scholarships"],
]

export const recognitionOf = (id: string) => RECOGNITION.filter((r) => r.works.includes(id))

const count = (f: (r: Recognition) => boolean) => String(RECOGNITION.filter(f).length)

export const aboutPage: PageEntry = {
  id: "about",
  kind: "page",
  title: "About",
  sub: "Bio & Recognition",
  kick: "Info",
  tagline: AB.bio,
  /* the address and the links are on the stage card, not in the meta grid */
  meta: [],
}

export const recognitionPage: PageEntry = {
  id: "recognition",
  kind: "page",
  title: "Recognition",
  sub: "Awards · Exhibitions · Fellowships",
  kick: "Info",
  tagline: "Awards, exhibitions and fellowships.",
  meta: [
    ["Awards", count((r) => r.type === "award")],
    ["Exhibitions", count((r) => r.type === "exhibition")],
    ["Fellowships", count((r) => /fellowship|scholarship/.test(r.type))],
  ],
}

/** The info pages. Recognition is a section of About now; its old address still opens About (routing.ts). */
export const PAGES: readonly PageEntry[] = [aboutPage]
