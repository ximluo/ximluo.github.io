import type React from "react"
import { Suspense, useEffect, useRef } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import FlowerScene from "../about/FlowerScene"
import { getHomeFlowerControls } from "./homeFlowerControls"

interface HomeFlowerModelProps {
  isSmallScreen: boolean
  windowWidth: number
  windowHeight: number
  layerHeight: number
}

/**
 * Parks the render loop while the hero is scrolled out of view (or the user
 * prefers reduced motion). Runs inside the Canvas and flips the loop through
 * the R3F store imperatively — flipping the Canvas `frameloop` prop instead
 * would re-render the whole scene tree and cause a visible hitch right at
 * the scroll boundary.
 */
const FrameloopController: React.FC<{ targetRef: React.RefObject<HTMLElement | null> }> = ({
  targetRef,
}) => {
  const setFrameloop = useThree((state) => state.setFrameloop)

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setFrameloop("never")
      return
    }

    const node = targetRef.current
    if (!node || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(([entry]) => {
      setFrameloop(entry.isIntersecting ? "always" : "never")
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [setFrameloop, targetRef])

  return null
}

const HomeFlowerModel: React.FC<HomeFlowerModelProps> = ({
  isSmallScreen,
  windowWidth,
  windowHeight,
  layerHeight,
}) => {
  const asideRef = useRef<HTMLElement | null>(null)
  const controls = getHomeFlowerControls(windowWidth, windowHeight)
  const canvasDpr = controls.dpr

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
          frameloop="always"
          camera={{ fov: 35, near: 0.1, far: 1000, position: [0, 0, 3] }}
        >
          <FrameloopController targetRef={asideRef} />
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
