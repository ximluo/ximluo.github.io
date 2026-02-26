import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Canvas } from "@react-three/fiber"
import "./BunnyModal.css"
import { BUNNY_MODAL_THEME_TOKENS, type ThemeType } from "../../theme/tokens"
import useIsMobile from "../../hooks/useIsMobile"
import BunnyScene, { type BunnySceneColors } from "./BunnyScene"
import useCarrotStorage from "./useCarrotStorage"

interface BunnyModalProps {
  onClose: () => void
  theme: ThemeType
}

const MODAL_ROOT_ID = "bunny-modal-root"

const BunnyModal: React.FC<BunnyModalProps> = ({ onClose, theme }) => {
  const portalRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile(768)
  const { carrotCount, incrementCarrotCount } = useCarrotStorage()

  useEffect(() => {
    if (typeof document === "undefined") return

    let host = document.getElementById(MODAL_ROOT_ID)
    if (!host) {
      host = document.createElement("div")
      host.id = MODAL_ROOT_ID
      document.body.appendChild(host)
    }

    const container = document.createElement("div")
    host.appendChild(container)
    portalRef.current = container
    setMounted(true)

    return () => {
      if (portalRef.current && host?.contains(portalRef.current)) {
        host.removeChild(portalRef.current)
      }
      if (host && host.childNodes.length === 0) {
        host.remove()
      }
      portalRef.current = null
    }
  }, [])

  const palette = BUNNY_MODAL_THEME_TOKENS[theme]
  const bunnyCanvasDpr: [number, number] = isMobile ? [1, 1.1] : [1, 1.4]
  const sceneColors = useMemo<BunnySceneColors>(
    () => ({
      floor: palette["--game-floor"],
      fog: palette["--game-fog"],
      bunnyPrimary: palette["--bunny-primary"],
      bunnySecondary: palette["--bunny-secondary"],
      carrotBody: palette["--carrot-body"],
      carrotLeaf: palette["--carrot-leaf"],
      outline: palette["--game-outline"],
    }),
    [palette],
  )

  if (!mounted || !portalRef.current) {
    return null
  }

  return createPortal(
    <div
      className="bunny-modal-backdrop"
      style={{
        ["--bunny-modal-border" as string]: palette["--game-border"],
        ["--bunny-modal-shadow" as string]: palette["--game-shadow"],
        ["--bunny-modal-radius" as string]: isMobile ? "18px" : "26px",
        ["--bunny-modal-text" as string]: palette["--color-text"],
        ["--bunny-modal-accent" as string]: palette["--color-accent-primary"],
        ["--bunny-modal-button-bg" as string]: palette["--button-bg-light"],
        ["--bunny-modal-counter-top" as string]: isMobile ? "16px" : "26px",
        ["--bunny-modal-counter-left" as string]: isMobile ? "16px" : "30px",
        ["--bunny-modal-counter-size" as string]: isMobile ? "0.65rem" : "0.8rem",
      }}
      onClick={onClose}
    >
      <div className="bunny-modal-panel" onClick={(e) => e.stopPropagation()}>
        <Canvas
          className="bunny-modal-canvas"
          shadows={!isMobile}
          gl={{
            antialias: !isMobile,
            preserveDrawingBuffer: false,
            alpha: false,
            powerPreference: "high-performance",
          }}
          dpr={bunnyCanvasDpr}
        >
          <BunnyScene
            colors={sceneColors}
            onCarrotCollected={incrementCarrotCount}
            isMobile={isMobile}
          />
        </Canvas>

        <div className="bunny-modal-counter">CARROTS · {carrotCount}</div>

        <div className="bunny-modal-hint">- Press to jump -</div>

        <div className="bunny-modal-footer">
          <button type="button" className="bunny-modal-text-button" onClick={onClose}>
            close
          </button>
        </div>

        <button type="button" onClick={onClose} className="bunny-modal-close-button">
          ×
        </button>
      </div>
    </div>,
    portalRef.current,
  )
}

export default BunnyModal
