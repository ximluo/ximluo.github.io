/* A small external store. Writes are flushed into React synchronously, so the imperative sequences that drive the
   site (tweens, measurements) see an up-to-date DOM right after each `set`, as the plain-script version did. */
import { useSyncExternalStore } from "react"
import { flushSync } from "react-dom"

export interface Store<T extends object> {
  get(): T
  set(patch: Partial<T> | ((s: T) => Partial<T>)): void
  subscribe(fn: () => void): () => void
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial
  const subs = new Set<() => void>()
  return {
    get: () => state,
    set(patch) {
      const p = typeof patch === "function" ? patch(state) : patch
      let changed = false
      for (const k in p) if (state[k as keyof T] !== p[k as keyof T]) changed = true
      if (!changed) return
      state = { ...state, ...p }
      flushSync(() => subs.forEach((f) => f()))
    },
    subscribe(fn) {
      subs.add(fn)
      return () => {
        subs.delete(fn)
      }
    },
  }
}

/** Selects a slice; the selector must return a primitive or a stored reference. */
export function useStore<T extends object, R>(store: Store<T>, sel: (s: T) => R): R {
  return useSyncExternalStore(store.subscribe, () => sel(store.get()))
}
