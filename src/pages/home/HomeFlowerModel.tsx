import type React from "react"
import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import FlowerScene from "../about/FlowerScene"
import { getHomeFlowerControls } from "./homeFlowerControls"

interface HomeFlowerModelProps {
  isSmallScreen: boolean
  windowWidth: number
  windowHeight: number
  layerHeight: number
}

const HomeFlowerModel: React.FC<HomeFlowerModelProps> = ({
  isSmallScreen,
  windowWidth,
  windowHeight,
  layerHeight,
}) => {
  const controls = getHomeFlowerControls(windowWidth, windowHeight)
  const canvasDpr = controls.dpr

  return (
    <aside
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
