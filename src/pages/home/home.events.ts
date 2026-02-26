export const HOME_FLOWER_TEMPORARY_HIDE_EVENT = "home-flower-temporary-hide"
export const HOME_FLOWER_NAV_VISIBILITY_EVENT = "home-flower-nav-visibility"
export const HOME_FLOWER_OPACITY_EVENT = "home-flower-opacity"

export interface HomeFlowerNavVisibilityDetail {
  hidden: boolean
}

export interface HomeFlowerOpacityDetail {
  value: number | null
}

export const dispatchHomeFlowerTemporaryHide = () => {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(HOME_FLOWER_TEMPORARY_HIDE_EVENT))
}

export const dispatchHomeFlowerNavVisibility = (hidden: boolean) => {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<HomeFlowerNavVisibilityDetail>(HOME_FLOWER_NAV_VISIBILITY_EVENT, {
      detail: { hidden },
    }),
  )
}

export const dispatchHomeFlowerOpacity = (value: number | null) => {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<HomeFlowerOpacityDetail>(HOME_FLOWER_OPACITY_EVENT, {
      detail: { value },
    }),
  )
}

export const listenHomeFlowerTemporaryHide = (listener: () => void) => {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(HOME_FLOWER_TEMPORARY_HIDE_EVENT, listener as EventListener)
  return () =>
    window.removeEventListener(HOME_FLOWER_TEMPORARY_HIDE_EVENT, listener as EventListener)
}

export const listenHomeFlowerNavVisibility = (
  listener: (detail: HomeFlowerNavVisibilityDetail) => void,
) => {
  if (typeof window === "undefined") return () => {}

  const handler = (event: Event) => {
    const custom = event as CustomEvent<HomeFlowerNavVisibilityDetail>
    listener(custom.detail ?? { hidden: false })
  }

  window.addEventListener(HOME_FLOWER_NAV_VISIBILITY_EVENT, handler as EventListener)
  return () =>
    window.removeEventListener(HOME_FLOWER_NAV_VISIBILITY_EVENT, handler as EventListener)
}

export const listenHomeFlowerOpacity = (listener: (detail: HomeFlowerOpacityDetail) => void) => {
  if (typeof window === "undefined") return () => {}

  const handler = (event: Event) => {
    const custom = event as CustomEvent<HomeFlowerOpacityDetail>
    listener(custom.detail ?? { value: null })
  }

  window.addEventListener(HOME_FLOWER_OPACITY_EVENT, handler as EventListener)
  return () => window.removeEventListener(HOME_FLOWER_OPACITY_EVENT, handler as EventListener)
}
