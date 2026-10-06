/* Google Analytics events, named as the previous site named them so the reports stay continuous. Page views for
   query-string navigation come from GA4's enhanced measurement of history changes. */
type Gtag = (...args: unknown[]) => void

function gtag(): Gtag | null {
  const g = (window as Window & { gtag?: Gtag }).gtag
  return typeof g === "function" ? g : null
}

export function track(event: string, params: Record<string, unknown> = {}) {
  gtag()?.("event", event, params)
}

export const trackProjectOpen = (id: string, name: string, uiRegion: string) =>
  track("project_card_click", { project_id: id, project_name: name, ui_region: uiRegion })

export const trackExternalLink = (href: string, uiRegion: string) =>
  track("external_link_click", { link_url: href, ui_region: uiRegion })
