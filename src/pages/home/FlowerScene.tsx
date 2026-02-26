import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { Environment, useAnimations, useGLTF } from "@react-three/drei"
import * as THREE from "three"

export interface FlowerSceneLayout {
  isMobile: boolean
  isSmallScreen: boolean
  windowWidth: number
}

interface FlowerModelProps {
  url?: string
  onReady?: (group: THREE.Group) => void
  uprightRotation?: [number, number, number]
}

const FlowerModel: React.FC<FlowerModelProps> = ({
  url = "/models/blue_flower.glb",
  onReady,
  uprightRotation = [1, 0, 0],
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

  useEffect(() => {
    if (group.current) onReady?.(group.current)
  }, [onReady])

  return (
    <group ref={group} dispose={null}>
      <group ref={inner} rotation={uprightRotation}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

interface FlowerSceneProps {
  layout: FlowerSceneLayout
  onSceneReady?: () => void
}

const FlowerScene: React.FC<FlowerSceneProps> = ({
  layout: { isMobile, windowWidth },
  onSceneReady,
}) => {
  const modelRef = useRef<THREE.Group | null>(null)
  const hasReportedReadyRef = useRef(false)
  const { camera, size } = useThree()
  const sizeMultiplier = useMemo(() => {
    if (windowWidth >= 768) return 3.2
    return 1.65
  }, [windowWidth])

  const frameCentered = useCallback(() => {
    if (!modelRef.current) return false
    if (size.width <= 0 || size.height <= 0) return false
    const obj = modelRef.current

    const box = new THREE.Box3().setFromObject(obj)
    if (!box || !isFinite(box.min.x)) {
      const persp = camera as THREE.PerspectiveCamera
      persp.position.set(0, 0.5, 6)
      persp.lookAt(0, 0.5, 0)
      persp.updateProjectionMatrix()
      return false
    }

    const width = box.max.x - box.min.x
    const height = box.max.y - box.min.y
    const depth = box.max.z - box.min.z

    const targetCenter = new THREE.Vector3(
      (box.min.x + box.max.x) * 0.5,
      (box.min.y + box.max.y) * 0.5,
      (box.min.z + box.max.z) * 0.5,
    )

    const baseFit = isMobile ? 0.65 : 0.55
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

    const verticalFactor = isMobile ? 1.9 : 2.95
    const verticalOffset = viewportHalfHeight * verticalFactor
    const horizontalOffset = isMobile ? 0 : viewportHalfWidth * 0.002

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
  }, [camera, isMobile, size.height, size.width, sizeMultiplier])

  const handleReady = useCallback(
    (group: THREE.Group) => {
      modelRef.current = group
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
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 5]} intensity={1.1} />
      <Environment preset="studio" />
      <FlowerModel onReady={handleReady} />
    </>
  )
}

useGLTF.preload("/models/blue_flower.glb")

export default FlowerScene
