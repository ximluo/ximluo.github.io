"use client"

import { useEffect, useRef } from "react"

const CLICKABLE =
  'a, button, [role="button"], input[type="button"], input[type="submit"]'
const MEDIA_SELECTOR = "iframe, video"

export default function CustomCursor() {
  // Refs (avoid React state -> smoother)
  const pos = useRef({ x: 0, y: 0 })
  const isHovering = useRef(false)
  const isClicking = useRef(false)
  const isOffPage = useRef(false)
  const isVisible = useRef(false)
  const isOverVideo = useRef(false)

  const raf = useRef(0)
  const cursorRef = useRef<HTMLDivElement>(null)
  

  const SIZE = 24
  const RADIUS = SIZE / 2

  // Global-cursor show / hide
  useEffect(() => {
    document.body.style.cursor = "none"
    return () => { document.body.style.cursor = "auto" }
  }, [])

  // Track pointer position
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pos.current.x = e.clientX
      pos.current.y = e.clientY
      isVisible.current = true
    }
    window.addEventListener("pointermove", move, { passive: true })
    return () => window.removeEventListener("pointermove", move)
  }, [])

  // Hide cursor when pointer leaves the viewport
  useEffect(() => {
    const enter = () => { isOffPage.current = false }
    const leave = (e: PointerEvent) => {
      if (e.relatedTarget === null) isOffPage.current = true
    }
    document.addEventListener("pointerenter", enter, true)
    document.addEventListener("pointerleave", leave, true)
    return () => {
      document.removeEventListener("pointerenter", enter, true)
      document.removeEventListener("pointerleave", leave, true)
    }
  }, [])

  // Detect clicks
  useEffect(() => {
    const down = () => {
      isClicking.current = true
      setTimeout(() => { isClicking.current = false }, 80)
    }
    window.addEventListener("pointerdown", down)
    return () => window.removeEventListener("pointerdown", down)
  }, [])

  // Hide cursor only while inside <iframe> / <video>
  useEffect(() => {
    const enter = () => { isOverVideo.current = true }
    const leave = () => { isOverVideo.current = false }

    // attach listeners to current and future media nodes
    const attach = (root: ParentNode) =>
      root.querySelectorAll(MEDIA_SELECTOR).forEach(el => {
        el.addEventListener("mouseenter", enter)
        el.addEventListener("mouseleave", leave)
      })

    attach(document)
    const mo = new MutationObserver(muts =>
      muts.forEach(m =>
        m.addedNodes.forEach(n => {
          if (n instanceof HTMLElement) attach(n)
        }),
      ),
    )
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      document.querySelectorAll(MEDIA_SELECTOR).forEach(el => {
        el.removeEventListener("mouseenter", enter)
        el.removeEventListener("mouseleave", leave)
      })
    }
  }, [])

  // Main render loop (runs every animation frame)
  useEffect(() => {
    const isClickable = (el: Element | null): boolean =>
      !!el && (el.matches(CLICKABLE) || isClickable(el.parentElement))

    const render = () => {
      const el = cursorRef.current
      if (el) {
        // Hover detection
        isHovering.current = isClickable(
          document.elementFromPoint(pos.current.x, pos.current.y),
        )

        const offset = RADIUS
        el.style.transform =
          `translate(${pos.current.x - offset}px, ${pos.current.y - offset}px)
           scale(${isClicking.current ? 0.6 : isHovering.current ? 1.2 : 1})`

        el.classList.toggle("hovering", isHovering.current)
        el.classList.toggle(
          "hidden",
          isOffPage.current || !isVisible.current || isOverVideo.current,
        )
      }
      raf.current = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(raf.current)
  }, [])

  return (
    <>
      <style>{`
        .cursor{
          position:fixed;top:0;left:0;width:${SIZE}px;height:${SIZE}px;
          border-radius:50%;border:2.5px solid var(--cursor-color,rgba(255,255,255,.7));
          background:transparent;pointer-events:none;
          transform:translate(-9999px,-9999px);
          transition:background-color .2s ease,border-color .2s ease,opacity .2s ease;
          will-change:transform;z-index:9999;
          box-shadow:var(--cursor-glow,0 0 8px rgba(255,255,255,.6));
        }
        .cursor.hovering{
          background-color:rgba(255,255,255,.1);
          border-color:var(--cursor-hover-color,rgba(255,255,255,.7));
          box-shadow:var(--cursor-hover-glow,0 0 12px rgba(255,255,255,.6));
        }
        .cursor.hidden{opacity:0;}
      `}</style>
      <div ref={cursorRef} className="cursor" />
    </>
  )
}
