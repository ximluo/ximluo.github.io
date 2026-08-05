import type React from "react"
import { Suspense, useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import FlowerScene from "../about/FlowerScene"
import { getHomeFlowerControls } from "./homeFlowerControls"

interface HomeFlowerModelProps {
  isSmallScreen: boolean
  windowWidth: number
  windowHeight: number
  layerHeight: number
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const HomeFlowerModel: React.FC<HomeFlowerModelProps> = ({
  isSmallScreen,
  windowWidth,
  windowHeight,
  layerHeight,
}) => {
  const asideRef = useRef<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(true)
  const controls = getHomeFlowerControls(windowWidth, windowHeight)
  const canvasDpr = controls.dpr

  // Park the render loop while the hero is scrolled out of view
  useEffect(() => {
    const node = asideRef.current
    if (!node || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const animate = isInView && !prefersReducedMotion()

  return (
    <aside
      ref={asideRef}
      className="home-flower-model"
      aria-hidden
      style={{
        ["--home-flower-model-opacity" as string]: controls.opacity,
        ["--home-flower-panel-left" as string]: controls.panelLeft,
        ["--home-flower-panel-width" as string]: controls.panelWidth,
        ["--home-flower-layer-height" as string]: `${layerHeight}px`,
      }}
    >
      <div className="home-flower-model-stage">
        <Canvas
          className="home-flower-model-canvas"
          gl={{
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: false,
            powerPreference: "low-power",
            stencil: false,
          }}
          dpr={canvasDpr}
          frameloop={animate ? "always" : "never"}
          camera={{ fov: 35, near: 0.1, far: 1000, position: [0, 0, 3] }}
        >
          <Suspense fallback={null}>
            <FlowerScene
              quality="low"
              layout={{
                isMobile: false,
                isSmallScreen,
                windowWidth,
                focusScale: controls.focusScale,
              }}
              controls={controls.transform}
            />
          </Suspense>
        </Canvas>
      </div>
    </aside>
  )
}

export default HomeFlowerModel
