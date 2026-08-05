import { useEffect } from "react"

const SITE_NAME = "Ximing Luo"

/**
 * Sets the document title (and optionally the meta description) for a route.
 * Pass no title for the home page, which uses the bare site name.
 * Pass `null` to leave the title untouched (e.g. when deferring to a child
 * component such as a not-found fallback).
 */
export default function usePageMeta(title?: string | null, description?: string) {
  useEffect(() => {
    if (title === null) return
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME

    if (description) {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (meta) {
        const previous = meta.content
        meta.content = description
        return () => {
          meta.content = previous
        }
      }
    }
  }, [title, description])
}
