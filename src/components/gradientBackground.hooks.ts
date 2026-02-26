import { useEffect, useMemo, useState, type RefObject } from "react"
import { listenHomeFlowerOpacity, listenHomeFlowerTemporaryHide } from "../pages/home/home.events"

const HEADER_CANDIDATE_SELECTORS = [
  "[data-top-header]",
  "header.site-header",
  "header",
  ".site-header",
  "[data-header]",
] as const

const clampOpacity = (value: number) => Math.max(0, Math.min(value, 1))

export const useHeaderOffset = () => {
  const [headerOffset, setHeaderOffset] = useState(0)

  useEffect(() => {
    if (typeof document === "undefined") return

    let headerEl: HTMLElement | null = null
    let headerResizeObserver: ResizeObserver | null = null

    const measure = () => {
      const nextHeight = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 0
      setHeaderOffset((prev) => (prev === nextHeight ? prev : nextHeight))
    }

    const attachHeaderObserver = () => {
      const nextHeader = document.querySelector<HTMLElement>(HEADER_CANDIDATE_SELECTORS.join(", "))
      if (nextHeader === headerEl) {
        measure()
        return
      }

      headerResizeObserver?.disconnect()
      headerEl = nextHeader

      if (!headerEl) {
        setHeaderOffset(0)
        return
      }

      headerResizeObserver = new ResizeObserver(measure)
      headerResizeObserver.observe(headerEl)
      measure()
    }

    attachHeaderObserver()

    const mutationObserver = new MutationObserver(() => {
      attachHeaderObserver()
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      mutationObserver.disconnect()
      headerResizeObserver?.disconnect()
    }
  }, [])

  return headerOffset
}

const paintNoiseCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  if (width <= 0 || height <= 0) return

  canvas.width = width
  canvas.height = height

  const img = ctx.createImageData(width, height)
  const buf = img.data

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4
      if (Math.random() > 0.2) {
        const shade = (Math.random() * 256) | 0
        buf[i] = shade
        buf[i + 1] = shade
        buf[i + 2] = shade
        buf[i + 3] = 35
      }
    }
  }

  ctx.putImageData(img, 0, 0)
}

interface UseGradientNoiseCanvasOptions {
  noiseCanvasRef: RefObject<HTMLCanvasElement | null>
  interBubbleRef: RefObject<HTMLDivElement | null>
  isMobileOrTablet: boolean
  viewportWidth: number
  viewportHeight: number
}

export const useGradientNoiseCanvas = ({
  noiseCanvasRef,
  interBubbleRef,
  isMobileOrTablet,
  viewportWidth,
  viewportHeight,
}: UseGradientNoiseCanvasOptions) => {
  useEffect(() => {
    if (typeof window === "undefined") return

    const canvas = noiseCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    paintNoiseCanvas(canvas, ctx, viewportWidth, viewportHeight)

    if (isMobileOrTablet) return

    let curX = 0
    let curY = 0
    let tgX = 0
    let tgY = 0
    let rafId = 0

    const move = () => {
      if (interBubbleRef.current) {
        curX += (tgX - curX) / 20
        curY += (tgY - curY) / 20
        interBubbleRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`
      }
      rafId = requestAnimationFrame(move)
    }

    const onMouseMove = (event: MouseEvent) => {
      tgX = event.clientX
      tgY = event.clientY
    }

    window.addEventListener("mousemove", onMouseMove)
    move()

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [interBubbleRef, isMobileOrTablet, noiseCanvasRef, viewportHeight, viewportWidth])
}

interface UseHomeFlowerOverlayOptions {
  isHomePage: boolean
}

export const useHomeFlowerOverlay = ({ isHomePage }: UseHomeFlowerOverlayOptions) => {
  const [edgeVisible, setEdgeVisible] = useState(true)
  const [homeFlowerOpacity, setHomeFlowerOpacity] = useState<number | null>(null)
  const [overlaySuppressed, setOverlaySuppressed] = useState(false)
  const [pastIntroDelay, setPastIntroDelay] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !isHomePage) return

    let lastY = window.scrollY
    let ticking = false

    const onScroll = () => {
      const currentY = window.scrollY
      if (ticking) return

      window.requestAnimationFrame(() => {
        const scrollingDown = currentY > lastY
        const atTop = currentY <= 0
        setEdgeVisible(!scrollingDown || atTop)
        lastY = currentY
        ticking = false
      })
      ticking = true
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHomePage])

  useEffect(() => {
    return listenHomeFlowerOpacity((detail) => {
      const next = detail.value
      setHomeFlowerOpacity(next == null ? null : clampOpacity(next))
    })
  }, [])

  useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout> | null = null

    const unsubscribe = listenHomeFlowerTemporaryHide(() => {
      if (hideTimeout) clearTimeout(hideTimeout)

      setOverlaySuppressed(true)
      hideTimeout = setTimeout(() => {
        setOverlaySuppressed(false)
        hideTimeout = null
      }, 3000)
    })

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout)
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setPastIntroDelay(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const overlayOpacity = useMemo(() => {
    const baseOpacity = !pastIntroDelay ? 0 : (homeFlowerOpacity ?? (edgeVisible ? 1 : 0))
    return overlaySuppressed ? 0 : clampOpacity(baseOpacity)
  }, [edgeVisible, homeFlowerOpacity, overlaySuppressed, pastIntroDelay])

  return { overlayOpacity }
}
