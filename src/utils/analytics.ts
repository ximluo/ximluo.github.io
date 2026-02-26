type GtagFn = (...args: unknown[]) => void

const getGtag = (): GtagFn | null => {
  if (typeof window === "undefined") return null
  const gtag = (window as Window & { gtag?: GtagFn }).gtag
  return typeof gtag === "function" ? gtag : null
}

export const trackGaEvent = (eventName: string, params?: Record<string, unknown>) => {
  const gtag = getGtag()
  if (!gtag) return
  gtag("event", eventName, params ?? {})
}

export const trackExternalLinkClick = ({
  linkId,
  href,
  uiRegion,
}: {
  linkId: string
  href: string
  uiRegion: string
}) => {
  trackGaEvent("external_link_click", {
    link_id: linkId,
    link_url: href,
    ui_region: uiRegion,
  })
}

export const trackProjectCardClick = ({
  projectId,
  projectName,
  uiRegion = "portfolio_grid",
}: {
  projectId: string
  projectName: string
  uiRegion?: string
}) => {
  trackGaEvent("project_card_click", {
    project_id: projectId,
    project_name: projectName,
    ui_region: uiRegion,
  })
}

export const trackBunnyModalOpen = (uiRegion = "footer") => {
  trackGaEvent("bunny_modal_open", {
    ui_region: uiRegion,
  })
}
