import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import useIsMobile from "../hooks/useIsMobile"
import { THEME_VISUAL_TOKENS, type ThemeType } from "../theme/tokens"

interface AsciiImageProps {
  src: string
  alt: string
  size: string
  theme: ThemeType
  borderWidth?: string
  className?: string
}

const ASCII_CHARS = " .,:;i1tfLCG08@"
const GLYPH_ASPECT = 0.55
const AsciiImage: React.FC<AsciiImageProps> = ({
  src,
  alt,
  size,
  theme,
  borderWidth = "3px",
  className = "",
}) => {
  const visualTokens = THEME_VISUAL_TOKENS[theme]
  const [asciiData, setAsciiData] = useState<string[]>([])
  const [baseAscii, setBaseAscii] = useState<string[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const [isTapped, setIsTapped] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const isMobile = useIsMobile(768)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const animFrameRef = useRef<number>(0)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const convertToAscii = useCallback(
    (img: HTMLImageElement, W: number, H: number, step: number) => {
      const off = new OffscreenCanvas(W, H)
      const ctx = off.getContext("2d", {
        willReadFrequently: false,
      }) as OffscreenCanvasRenderingContext2D
      if (!ctx) return []

      ctx.drawImage(img, 0, 0, W, H)
      const { data } = ctx.getImageData(0, 0, W, H)

      const ascii: string[] = []
      const stepX = step
      const stepY = Math.max(1, Math.floor(step / GLYPH_ASPECT))

      for (let y = 0; y < H; y += stepY) {
        let line = ""
        for (let x = 0; x < W; x += stepX) {
          const idx = (y * W + x) * 4
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3 / 255
          const charIdx = Math.floor(brightness * (ASCII_CHARS.length - 1))
          line += ASCII_CHARS[charIdx]
        }
        ascii.push(line)
      }
      return ascii
    },
    [],
  )

  const calculateAsciiArt = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return

    const box = containerRef.current.getBoundingClientRect()
    const dim = Math.floor(box.width * 3.0)
    const fontPx = 6
    const step = Math.max(1, Math.floor(fontPx / GLYPH_ASPECT))

    const ascii = convertToAscii(imgRef.current, dim, dim, step)
    setBaseAscii(ascii)
    setAsciiData(ascii)
  }, [convertToAscii])

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (imgRef.current) {
        calculateAsciiArt()
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [calculateAsciiArt])

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src
    img.onload = () => {
      if (imageRef.current) imageRef.current.src = src

      imgRef.current = img
      calculateAsciiArt()
    }
  }, [calculateAsciiArt, src])

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
              : c,
          )
          .join(""),
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
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        border: `${borderWidth} solid ${visualTokens.asciiBorder}`,
        boxShadow: `0 0 20px ${visualTokens.asciiGlow}`,
        transition: "box-shadow 0.3s ease",
        cursor: isMobile ? "pointer" : undefined,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
    >
      <img
        ref={imageRef}
        src={src || "/placeholder.svg"}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: isHovered || isTapped ? "none" : "block",
        }}
      />

      {(isHovered || isTapped || isTransitioning) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            color: visualTokens.asciiText,
            fontSize: "6px",
            lineHeight: "6px",
            fontFamily: "monospace",
            whiteSpace: "pre",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <pre style={{ margin: 0 }}>{asciiData.join("\n")}</pre>
        </div>
      )}
    </div>
  )
}

export default AsciiImage
