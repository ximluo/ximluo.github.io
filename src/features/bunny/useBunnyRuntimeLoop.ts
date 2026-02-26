import { useFrame } from "@react-three/fiber"
import type { MutableRefObject } from "react"
import * as THREE from "three"
import { Reflector } from "three/examples/jsm/objects/Reflector.js"
import { BufferSim } from "./bunnySceneMaterials"

const getShortestAngle = (v: number) => {
  let a = v % (Math.PI * 2)
  if (a < -Math.PI) a += Math.PI * 2
  else if (a > Math.PI) a -= Math.PI * 2
  return a
}

const constrain = (v: number, vMin: number, vMax: number) => Math.min(vMax, Math.max(vMin, v))

interface BunnyRuntimeLoopOptions {
  modelLoaded: boolean
  isMobile: boolean
  isJumping: boolean
  camera: THREE.Camera
  timeRef: MutableRefObject<number>
  outlineMatRef: MutableRefObject<THREE.ShaderMaterial>
  rabbitRef: MutableRefObject<THREE.Group | null>
  earLeftRef: MutableRefObject<THREE.Object3D | null>
  earRightRef: MutableRefObject<THREE.Object3D | null>
  carrotRef: MutableRefObject<THREE.Object3D | null>
  floorRef: MutableRefObject<Reflector | null>
  lineRef: MutableRefObject<THREE.Line | null>
  floorSimMatRef: MutableRefObject<THREE.ShaderMaterial | null>
  bufferSimRef: MutableRefObject<BufferSim | null>
  floorSizeRef: MutableRefObject<number>
  mouseRef: MutableRefObject<THREE.Vector2>
  raycasterRef: MutableRefObject<THREE.Raycaster>
  heroSpeedRef: MutableRefObject<THREE.Vector2>
  heroOldRotRef: MutableRefObject<number>
  heroAngularSpeedRef: MutableRefObject<number>
  heroOldUVPosRef: MutableRefObject<THREE.Vector2>
  heroNewUVPosRef: MutableRefObject<THREE.Vector2>
  targetHeroUVPosRef: MutableRefObject<THREE.Vector2>
  targetHeroAbsPosRef: MutableRefObject<THREE.Vector2>
  onCollisionCheck: () => void
}

export const useBunnyRuntimeLoop = ({
  modelLoaded,
  isMobile,
  isJumping,
  camera,
  timeRef,
  outlineMatRef,
  rabbitRef,
  earLeftRef,
  earRightRef,
  carrotRef,
  floorRef,
  lineRef,
  floorSimMatRef,
  bufferSimRef,
  floorSizeRef,
  mouseRef,
  raycasterRef,
  heroSpeedRef,
  heroOldRotRef,
  heroAngularSpeedRef,
  heroOldUVPosRef,
  heroNewUVPosRef,
  targetHeroUVPosRef,
  targetHeroAbsPosRef,
  onCollisionCheck,
}: BunnyRuntimeLoopOptions) => {
  useFrame((_, delta) => {
    if (!modelLoaded) return

    const dt = Math.min(delta, 0.3)
    timeRef.current += dt
    outlineMatRef.current.uniforms.time.value = timeRef.current

    if (
      !rabbitRef.current ||
      !lineRef.current ||
      !floorRef.current ||
      !floorSimMatRef.current ||
      !bufferSimRef.current
    ) {
      return
    }

    raycasterRef.current.setFromCamera(mouseRef.current, camera)
    const intersects = raycasterRef.current.intersectObject(floorRef.current)

    if (intersects.length > 0 && intersects[0].uv) {
      targetHeroUVPosRef.current.x = intersects[0].uv.x
      targetHeroUVPosRef.current.y = intersects[0].uv.y
    }

    const clampRange = isMobile ? 0.22 : 0.3
    const constrainUVPosX = constrain(targetHeroUVPosRef.current.x - 0.5, -clampRange, clampRange)
    const constrainUVPosY = constrain(targetHeroUVPosRef.current.y - 0.5, -clampRange, clampRange)
    targetHeroAbsPosRef.current.x = constrainUVPosX * floorSizeRef.current
    targetHeroAbsPosRef.current.y = -constrainUVPosY * floorSizeRef.current

    const dx = targetHeroAbsPosRef.current.x - rabbitRef.current.position.x
    const dy = targetHeroAbsPosRef.current.y - rabbitRef.current.position.z

    const angle = Math.atan2(dy, dx)
    const heroDistance = Math.sqrt(dx * dx + dy * dy)
    const ax = dx * dt * 0.3
    const ay = dy * dt * 0.3

    heroSpeedRef.current.x += ax
    heroSpeedRef.current.y += ay
    heroSpeedRef.current.x *= Math.pow(dt, 0.005)
    heroSpeedRef.current.y *= Math.pow(dt, 0.005)

    rabbitRef.current.position.x += heroSpeedRef.current.x
    rabbitRef.current.position.z += heroSpeedRef.current.y

    const targetRot = -angle + Math.PI / 2
    if (heroDistance > 0.3) {
      rabbitRef.current.rotation.y +=
        getShortestAngle(targetRot - rabbitRef.current.rotation.y) * 3 * dt
    }

    heroAngularSpeedRef.current = getShortestAngle(
      rabbitRef.current.rotation.y - heroOldRotRef.current,
    )
    heroOldRotRef.current = rabbitRef.current.rotation.y

    if (!isJumping && earLeftRef.current && earRightRef.current) {
      earLeftRef.current.rotation.x = earRightRef.current.rotation.x =
        -heroSpeedRef.current.length() * 2
    }

    const linePositions = (lineRef.current.geometry as THREE.BufferGeometry).attributes.position
      .array
    linePositions[0] = targetHeroAbsPosRef.current.x
    linePositions[2] = targetHeroAbsPosRef.current.y
    linePositions[3] = rabbitRef.current.position.x
    linePositions[4] = rabbitRef.current.position.y
    linePositions[5] = rabbitRef.current.position.z
    ;(lineRef.current.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true
    lineRef.current.computeLineDistances()

    heroNewUVPosRef.current.x = 0.5 + rabbitRef.current.position.x / floorSizeRef.current
    heroNewUVPosRef.current.y = 0.5 - rabbitRef.current.position.z / floorSizeRef.current

    floorSimMatRef.current.uniforms.time.value += dt
    floorSimMatRef.current.uniforms.blade1PosNew.value = heroNewUVPosRef.current
    floorSimMatRef.current.uniforms.blade1PosOld.value = heroOldUVPosRef.current
    floorSimMatRef.current.uniforms.strength.value = isJumping
      ? 0
      : 1 / (1 + heroSpeedRef.current.length() * 10)

    bufferSimRef.current.render()

    if (floorRef.current.material instanceof THREE.ShaderMaterial) {
      floorRef.current.material.uniforms.tScratches = {
        value: bufferSimRef.current.output.texture,
      }
    }

    heroOldUVPosRef.current.copy(heroNewUVPosRef.current)

    if (carrotRef.current) {
      carrotRef.current.rotation.y += dt
    }

    onCollisionCheck()
  })
}
