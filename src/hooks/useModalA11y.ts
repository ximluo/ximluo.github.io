import { useCallback, useEffect, useRef, useState } from "react"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, iframe, [tabindex]:not([tabindex="-1"])'

/**
 * Dialog accessibility for modals: focuses the dialog when it mounts, closes
 * on Escape, traps Tab within the container, and restores focus on close.
 * Attach the returned ref to the dialog container (give it tabIndex={-1}).
 */
export default function useModalA11y<T extends HTMLElement>(onClose: () => void) {
  const [container, setContainer] = useState<T | null>(null)
  const containerRef = useCallback((node: T | null) => setContainer(node), [])
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!container) return
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    container.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== "Tab") return

      const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !container.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
      previouslyFocused?.focus({ preventScroll: true })
    }
  }, [container])

  return containerRef
}
