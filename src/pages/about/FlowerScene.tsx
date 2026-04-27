import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { Environment, useAnimations, useGLTF } from "@react-three/drei"
import * as THREE from "three"

export interface FlowerSceneLayout {
  isMobile: boolean
  isSmallScreen: boolean
  windowWidth: number
  focusScale?: number
}

export interface FlowerSceneControls {
  modelRotation?: [number, number, number]
  modelScale?: number
  modelPosition?: [number, number, number]
  cameraFit?: number
  cameraVerticalPan?: number
  cameraHorizontalPan?: number
  ambientLightIntensity?: number
  directionalLightIntensity?: number
  directionalLightPosition?: [number, number, number]
}

interface FlowerModelProps {
  url?: string
  onReady?: (group: THREE.Group) => void
  uprightRotation?: [number, number, number]
  controls?: FlowerSceneControls
}

const FlowerModel: React.FC<FlowerModelProps> = ({
  url = "/models/blue_flower.glb",
  onReady,
  uprightRotation = [1, 0, 0],
  controls,
}) => {
  const group = useRef<THREE.Group>(null!)
  const inner = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF(url) as unknown as {
    scene: THREE.Group
    animations: THREE.AnimationClip[]
  }
  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    names.forEach((name) => {
      const action = actions[name]
      if (!action) return
      action.reset()
      action.setLoop(THREE.LoopRepeat, Infinity)
      action.play()
    })
    return () => {
      names.forEach((name) => actions[name]?.stop())
    }
  }, [actions, names])

  useLayoutEffect(() => {
    if (group.current) onReady?.(group.current)
  }, [onReady])

  return (
    <group
      ref={group}
      dispose={null}
      position={controls?.modelPosition ?? [0, 0, 0]}
      scale={controls?.modelScale ?? 1}
    >
      <group ref={inner} rotation={controls?.modelRotation ?? uprightRotation}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

interface FlowerSceneProps {
  layout: FlowerSceneLayout
  onSceneReady?: () => void
  quality?: "normal" | "low"
  controls?: FlowerSceneControls
}

const FlowerScene: React.FC<FlowerSceneProps> = ({
  layout: { isMobile, windowWidth, focusScale = 1 },
  onSceneReady,
  quality = "normal",
  controls,
}) => {
  const modelRef = useRef<THREE.Group | null>(null)
  const stableBoxRef = useRef<THREE.Box3 | null>(null)
  const hasReportedReadyRef = useRef(false)
  const { camera, size } = useThree()
  const ambientLightIntensity = controls?.ambientLightIntensity ?? (quality === "low" ? 1.15 : 0.9)
  const directionalLightIntensity =
    controls?.directionalLightIntensity ?? (quality === "low" ? 0.8 : 1.1)
  const directionalLightPosition = controls?.directionalLightPosition ?? [5, 10, 5]
  const sizeMultiplier = useMemo(() => {
    if (windowWidth >= 768) return 3.8 * focusScale
    return 2.15 * focusScale
  }, [focusScale, windowWidth])

  const frameCentered = useCallback(() => {
    if (!modelRef.current) return false
    if (size.width <= 0 || size.height <= 0) return false
    const obj = modelRef.current

    const liveBox = stableBoxRef.current ?? new THREE.Box3().setFromObject(obj)
    const box = stableBoxRef.current ?? liveBox
    if (!box || !isFinite(box.min.x)) {
      const persp = camera as THREE.PerspectiveCamera
      persp.position.set(0, 0.5, 6)
      persp.lookAt(0, 0.5, 0)
      persp.updateProjectionMatrix()
      return false
    }
    if (!stableBoxRef.current) stableBoxRef.current = liveBox.clone()

    const width = box.max.x - box.min.x
    const height = box.max.y - box.min.y
    const depth = box.max.z - box.min.z

    const targetCenter = new THREE.Vector3(
      (box.min.x + box.max.x) * 0.5,
      (box.min.y + box.max.y) * 0.5,
      (box.min.z + box.max.z) * 0.5,
    )

    const baseFit =
      controls?.cameraFit ?? (quality === "low" ? (isMobile ? 0.8 : 1.22) : isMobile ? 0.65 : 0.95)
    const fit = baseFit * sizeMultiplier

    const persp = camera as THREE.PerspectiveCamera
    const fov = THREE.MathUtils.degToRad(persp.fov)
    const viewAspect = size.width / size.height
    const neededHalfHeight = Math.max(height * 0.5, (width * 0.5) / viewAspect)
    const distance = neededHalfHeight / (Math.tan(fov / 2) * fit)

    const camPos = targetCenter
      .clone()
      .add(new THREE.Vector3(-0.28, -0.55, 0).normalize().multiplyScalar(distance))

    const viewDir = targetCenter.clone().sub(camPos).normalize()
    const cameraUp = (camera as THREE.PerspectiveCamera).up.clone().normalize()
    const right = new THREE.Vector3().crossVectors(viewDir, cameraUp).normalize()
    const trueUp = new THREE.Vector3().crossVectors(right, viewDir).normalize()

    const cameraDistance = camPos.distanceTo(targetCenter)
    const viewportHalfHeight = Math.tan(fov / 2) * cameraDistance
    const viewportHalfWidth = viewportHalfHeight * viewAspect

    const verticalFactor =
      controls?.cameraVerticalPan ??
      (quality === "low" ? (isMobile ? -0.32 : 2.52) : isMobile ? 3.1 * 0.9 : 1.8)
    const verticalOffset = viewportHalfHeight * verticalFactor
    const horizontalOffset =
      controls?.cameraHorizontalPan == null
        ? quality === "low" || isMobile
          ? 0
          : viewportHalfWidth * 0.002
        : viewportHalfWidth * controls.cameraHorizontalPan

    const panOffset = new THREE.Vector3()
      .add(right.clone().multiplyScalar(horizontalOffset))
      .add(trueUp.clone().multiplyScalar(verticalOffset))

    camPos.add(panOffset)
    const newTarget = targetCenter.clone().add(panOffset)

    persp.position.copy(camPos)
    persp.near = Math.max(0.001, cameraDistance / 100)
    persp.far = cameraDistance * 100 + depth
    persp.updateProjectionMatrix()
    persp.lookAt(newTarget)
    return true
  }, [camera, controls, isMobile, quality, size.height, size.width, sizeMultiplier])

  const handleReady = useCallback(
    (group: THREE.Group) => {
      modelRef.current = group
      const didInitialFrame = frameCentered()
      if (didInitialFrame && !hasReportedReadyRef.current) {
        hasReportedReadyRef.current = true
        onSceneReady?.()
        return
      }

      let attempts = 0
      const tryFrame = () => {
        attempts += 1
        const didFrame = frameCentered()
        if (didFrame && !hasReportedReadyRef.current) {
          hasReportedReadyRef.current = true
          onSceneReady?.()
        }
        if (!didFrame && attempts < 12) {
          requestAnimationFrame(tryFrame)
        } else if (!didFrame && !hasReportedReadyRef.current) {
          hasReportedReadyRef.current = true
          onSceneReady?.()
        }
      }
      requestAnimationFrame(tryFrame)
    },
    [frameCentered, onSceneReady],
  )

  useEffect(() => {
    frameCentered()
  }, [size.width, size.height, frameCentered])

  return (
    <>
      <ambientLight intensity={ambientLightIntensity} />
      <directionalLight position={directionalLightPosition} intensity={directionalLightIntensity} />
      {quality !== "low" && <Environment preset="studio" />}
      <FlowerModel controls={controls} onReady={handleReady} />
    </>
  )
}

useGLTF.preload("/models/blue_flower.glb")

export default FlowerScene
