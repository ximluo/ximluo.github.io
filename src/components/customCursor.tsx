"use client"

import { useEffect, useState, useRef } from "react"

const CLICKABLE =
  'a, button, [role="button"], input[type="button"], input[type="submit"]'
const MEDIA_SELECTOR = "iframe, video"

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isOffPage, setIsOffPage] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isOverVideo, setIsOverVideo] = useState(false)

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
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  //  Hide cursor when pointer leaves the viewport      
  useEffect(() => {
    const enter = () => setIsOffPage(false)
    const leave = (e: PointerEvent) => {
      if (e.relatedTarget === null) setIsOffPage(true)
    }
    document.addEventListener("pointerenter", enter, true)
    document.addEventListener("pointerleave", leave, true)
    return () => {
      document.removeEventListener("pointerenter", enter, true)
      document.removeEventListener("pointerleave", leave, true)
    }
  }, [])

  // Detect hovering over clickable elements    
  useEffect(() => {
    const tester = setInterval(() => {
      let hovering = false
      document.querySelectorAll(CLICKABLE).forEach(el => {
        const r = el.getBoundingClientRect()
        const cx = Math.max(r.left, Math.min(pos.x, r.right))
        const cy = Math.max(r.top, Math.min(pos.y, r.bottom))
        if (Math.hypot(pos.x - cx, pos.y - cy) <= RADIUS) hovering = true
      })
      setIsHovering(hovering)
    }, 10)
    return () => clearInterval(tester)
  }, [pos])

  // Detect clicks                                     

  useEffect(() => {
    const down = () => {
      setIsClicking(true)
      setTimeout(() => setIsClicking(false), 80)
    }
    window.addEventListener("mousedown", down)
    return () => window.removeEventListener("mousedown", down)
  }, [])


  // Hide cursor only while inside <iframe> / <video>  
  useEffect(() => {
    const enter = () => setIsOverVideo(true)
    const leave = () => setIsOverVideo(false)

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

  useEffect(() => {
    const render = () => {
      if (cursorRef.current) {
        const offset = RADIUS
        cursorRef.current.style.transform =
          `translate(${pos.x - offset}px, ${pos.y - offset}px)
           scale(${isClicking ? 0.6 : isHovering ? 1.2 : 1})`
        cursorRef.current.classList.toggle("hovering", isHovering)
        cursorRef.current.classList.toggle(
          "hidden",
          isOffPage || !isVisible || isOverVideo,
        )
      }
      raf.current = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(raf.current)
  }, [pos, isHovering, isClicking, isOffPage, isVisible, isOverVideo])

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