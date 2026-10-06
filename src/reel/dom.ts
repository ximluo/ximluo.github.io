/* The elements the reel animates directly. Components register them as they mount. */
export interface ReelDom {
  leader: HTMLElement
  grain: HTMLCanvasElement
  cursor: HTMLElement
  flash: HTMLElement
  side: HTMLElement
  blist: HTMLElement
  player: HTMLElement
  stage: HTMLElement
  cap: HTMLElement
  awp: HTMLElement
  awWall: HTMLElement
  ad: HTMLElement
  adSheet: HTMLElement
  adFig: HTMLElement
  adImg: HTMLImageElement
  adSide: HTMLElement
  proj: HTMLElement
  mbar: HTMLElement
}

export type DomKey = keyof ReelDom

export const createDom = () => ({}) as ReelDom

/** A ref callback that registers an element under `key`. */
export const domRef =
  <K extends DomKey>(dom: ReelDom, key: K) =>
  (el: ReelDom[K] | null) => {
    if (el) dom[key] = el
  }
