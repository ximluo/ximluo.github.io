import { useEffect, useState } from "react"

interface UseIntersectionOnceOptions extends IntersectionObserverInit {
  disabled?: boolean
  initialValue?: boolean
}

const useIntersectionOnce = <T extends Element>({
  root = null,
  rootMargin,
  threshold,
  disabled = false,
  initialValue = false,
}: UseIntersectionOnceOptions = {}) => {
  const [node, setNode] = useState<T | null>(null)
  const [hasIntersected, setHasIntersected] = useState(initialValue)

  useEffect(() => {
    if (disabled || hasIntersected || !node) return

    if (typeof IntersectionObserver === "undefined") {
      setHasIntersected(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasIntersected(true)
          observer.disconnect()
        }
      },
      { root, rootMargin, threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [disabled, hasIntersected, node, root, rootMargin, threshold])

  return {
    ref: setNode,
    hasIntersected,
    setHasIntersected,
  }
}

export default useIntersectionOnce
