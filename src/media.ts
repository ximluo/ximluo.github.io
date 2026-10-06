/* Media paths in the content are relative to public/media; full URLs and paths already resolved to the site root pass through. */
export const media = (p: string) => (/^(https?:|data:|\/)/.test(p) ? p : "/media/" + p)

export const heroOf = (w: { hero?: string; thumb?: string }) => {
  const p = w.hero || w.thumb
  return p ? media(p) : ""
}

export const thumbOf = (w: { thumb?: string }) => (w.thumb ? media(w.thumb) : "")

/** The moving preview of the wall, a still under reduced motion. */
export const wallLoop = (small: boolean, still: boolean) =>
  media(
    still
      ? small
        ? "wall/wall-still-sm.jpg"
        : "wall/wall-still.jpg"
      : small
        ? "wall/wall-loop-sm.webp"
        : "wall/wall-loop.webp",
  )
