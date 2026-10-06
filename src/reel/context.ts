import { createContext, useContext, useMemo } from "react"
import type { Catalog } from "../data/catalog"
import type { Route } from "../routing"
import { useStore, type Store } from "../store"
import type { Actions } from "./ctx"
import { domRef, type DomKey, type ReelDom } from "./dom"
import type { ReelState } from "./state"

export interface ReelHandle {
  store: Store<ReelState>
  dom: ReelDom
  actions: Actions
  cat: Catalog
  route: Route
}

export const ReelCtx = createContext<ReelHandle | null>(null)

export function useReel() {
  const v = useContext(ReelCtx)
  if (!v) throw new Error("useReel needs a ReelCtx provider")
  return v
}

/** A slice of the reel's state; the selector must return a primitive or a stored reference. */
export function useReelState<R>(sel: (s: ReelState) => R) {
  const { store } = useReel()
  return useStore(store, sel)
}

/** Registers an element the reel animates directly. */
export function useDomRef<K extends DomKey>(key: K) {
  const { dom } = useReel()
  return useMemo(() => domRef(dom, key), [dom, key])
}
