"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface AsciiImageProps {
  src: string
  alt: string
  size: string             
  theme: "bunny" | "water"
  borderWidth?: string
  className?: string
}
const AsciiImage: React.FC<AsciiImageProps> = ({
  src,
  alt,
  size,
  theme,
  borderWidth = "3px",
  className = "",
}) => {
  // state 
  const [asciiData, setAsciiData]   = useState<string[]>([])  
  const [baseAscii, setBaseAscii]   = useState<string[]>([])  
  const [isHovered, setIsHovered]   = useState(false)
  const [isTapped, setIsTapped]     = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMobile, setIsMobile]     = useState(false)

  // refs
  const containerRef   = useRef<HTMLDivElement>(null)
  const imageRef       = useRef<HTMLImageElement>(null)
  const animFrameRef   = useRef<number>(0)
  const imgRef         = useRef<HTMLImageElement | null>(null)

  // Constants 
  // Dark -> light
  const ASCII_CHARS = " .,:;i1tfLCG08@"
  // colour palette
  const THEMES = {
    bunny: {
      glow:   "rgba(223, 30, 155, 0.5)",
      border: "rgba(223, 30, 155, 1)",
      text:   "rgba(223, 30, 155, 1)",
    },
    water: {
      glow:   "rgba(134, 196, 240, 0.5)",
      border: "rgb(134, 196, 240)",
      text:   "rgb(134, 196, 240)",
    },
  } as const

  // True width/height of a monospace glyph 
  const GLYPH_ASPECT = 0.55

  // Convert the given image to ASCII.
  const convertToAscii = (
    img: HTMLImageElement,
    W: number,
    H: number,
    step: number
  ) => {
    const off  = new OffscreenCanvas(W, H)
    const ctx  = off.getContext("2d", { willReadFrequently: false }) as OffscreenCanvasRenderingContext2D
    if (!ctx) return []

    ctx.drawImage(img, 0, 0, W, H)
    const { data } = ctx.getImageData(0, 0, W, H)

    const ascii: string[] = []
    const stepX = step
    const stepY = Math.max(1, Math.floor(step / GLYPH_ASPECT))

    for (let y = 0; y < H; y += stepY) {
      let line = ""
      for (let x = 0; x < W; x += stepX) {
        const idx        = (y * W + x) * 4
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3 / 255
        const charIdx    = Math.floor(brightness * (ASCII_CHARS.length - 1))
        line += ASCII_CHARS[charIdx]
      }
      ascii.push(line)
    }
    return ascii
  }

  // Calculate ASCII art based on current container size
  const calculateAsciiArt = () => {
    if (!imgRef.current || !containerRef.current) return

    const box = containerRef.current.getBoundingClientRect()
    const dim = Math.floor(box.width * 3.0)
    const fontPx = 6
    const step = Math.max(1, Math.floor(fontPx / GLYPH_ASPECT))

    const ascii = convertToAscii(imgRef.current, dim, dim, step)
    setBaseAscii(ascii)
    setAsciiData(ascii)
  }

  // Detect mobile (skip hover on small screens)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Set up resize observer
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (imgRef.current) {
        calculateAsciiArt()
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Load + preprocess once
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src
    img.onload = () => {
      // display photo
      if (imageRef.current) imageRef.current.src = src
      
      imgRef.current = img
      calculateAsciiArt()
    }
  }, [src])

  // Hover/tap handlers
  const startScramble = () => {
    let frame = 0
    const MAX = 15

    const tick = () => {
      frame += 1
      if (frame >= MAX) {
        setAsciiData(baseAscii)
        setIsTransitioning(false)
        return
      }

      const progress = frame / MAX
      const scrambled = baseAscii.map((ln) =>
        ln
          .split("")
          .map((c) =>
            Math.random() > progress
              ? ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
              : c
          )
          .join("")
      )
      setAsciiData(scrambled)
      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }

  const handleMouseEnter = () => {
    if (isMobile || baseAscii.length === 0) return
    setIsHovered(true)
    setIsTransitioning(true)
    startScramble()
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    cancelAnimationFrame(animFrameRef.current)
    setAsciiData(baseAscii)
    setIsHovered(false)
    setIsTransitioning(false)
  }

  const handleTap = () => {
    if (!isMobile || baseAscii.length === 0) return
    setIsTapped(!isTapped)
    if (!isTapped) {
      setIsTransitioning(true)
      startScramble()
    } else {
      cancelAnimationFrame(animFrameRef.current)
      setAsciiData(baseAscii)
      setIsTransitioning(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`ascii-image-container ${className}`}
      style={{
        width:           size,
        height:          size,
        borderRadius:    "50%",
        overflow:        "hidden",
        position:        "relative",
        flexShrink:      0,
        border:          `${borderWidth} solid ${THEMES[theme].border}`,
        boxShadow:       `0 0 20px ${THEMES[theme].glow}`,
        transition:      "box-shadow 0.3s ease",
        cursor:          isMobile ? "pointer" : undefined,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
    >
      {/* Photo */}
      <img
        ref={imageRef}
        src={src || "/placeholder.svg"}
        alt={alt}
        style={{
          width:      "100%",
          height:     "100%",
          objectFit:  "cover",
          display:    (isHovered || isTapped) ? "none" : "block",
        }}
      />

      {/* ASCII overlay */}
      {(isHovered || isTapped || isTransitioning) && (
        <div
          style={{
            position:      "absolute",
            inset:         0,
            background:    "#000",
            color:         THEMES[theme].text,
            fontSize:      "6px",      
            lineHeight:    "6px",
            fontFamily:    "monospace",
            whiteSpace:    "pre",
            display:       "flex",
            justifyContent:"center",
            alignItems:    "center",
            overflow:      "hidden",
          }}
        >
          <pre style={{ margin: 0 }}>{asciiData.join("\n")}</pre>
        </div>
      )}
    </div>
  )
}

export default AsciiImage
