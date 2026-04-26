import { useEffect } from "react"

export const useHomeFooterMeasurement = (setFooterHeight: (value: number) => void) => {
  useEffect(() => {
    if (typeof document === "undefined") return

    let footerEl: HTMLElement | null = null
    let footerResizeObserver: ResizeObserver | null = null

    const measureFooter = () => {
      if (!footerEl) return
      setFooterHeight(footerEl.getBoundingClientRect().height || 0)
    }

    const attachFooterObserver = () => {
      const nextFooter = document.querySelector<HTMLElement>("footer")

      if (nextFooter === footerEl) {
        measureFooter()
        return
      }

      footerResizeObserver?.disconnect()
      footerEl = nextFooter

      if (!footerEl) {
        setFooterHeight(0)
        return
      }

      footerResizeObserver = new ResizeObserver(measureFooter)
      footerResizeObserver.observe(footerEl)

      measureFooter()
    }

    attachFooterObserver()

    const mutationObserver = new MutationObserver(attachFooterObserver)
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      mutationObserver.disconnect()
      footerResizeObserver?.disconnect()
    }
  }, [setFooterHeight])
}
