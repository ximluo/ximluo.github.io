import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
import { Reflector } from "three/examples/jsm/objects/Reflector.js"
import gsap from "gsap"
import { BufferSim, createOutlineMaterial } from "./bunnySceneMaterials"
import type { BunnySceneColors, BunnySceneProps } from "./bunnyScene.types"
import { useBunnyPointerInput } from "./useBunnyPointerInput"
import { useBunnyRuntimeLoop } from "./useBunnyRuntimeLoop"
import { useBunnySceneSetup } from "./useBunnySceneSetup"

export type { BunnySceneColors }

const HIGH_CARROT_HEIGHT_THRESHOLD = 0.85
const CARROT_MARKER_Y_OFFSET = 0.01

const BunnyScene: React.FC<BunnySceneProps> = ({ colors, onCarrotCollected, isMobile }) => {
  const { scene, gl, camera } = useThree()
  const [modelLoaded, setModelLoaded] = useState(false)
  const [isJumping, setIsJumping] = useState(false)

  const rabbitRef = useRef<THREE.Group | null>(null)
  const rabbitBodyRef = useRef<THREE.Object3D | null>(null)
  const earLeftRef = useRef<THREE.Object3D | null>(null)
  const earRightRef = useRef<THREE.Object3D | null>(null)
  const carrotRef = useRef<THREE.Object3D | null>(null)
  const carrotMarkerRef = useRef<THREE.Mesh | null>(null)
  const carrotMarkerDotRef = useRef<THREE.Mesh | null>(null)
  const floorRef = useRef<Reflector | null>(null)
  const lineRef = useRef<THREE.Line | null>(null)
  const bufferSimRef = useRef<BufferSim | null>(null)
  const floorSimMatRef = useRef<THREE.ShaderMaterial | null>(null)
  const particlesRef = useRef<THREE.Mesh[]>([])
  const particles2Ref = useRef<THREE.Mesh[]>([])

  const heroSpeedRef = useRef(new THREE.Vector2(0, 0))
  const heroOldRotRef = useRef(0)
  const heroAngularSpeedRef = useRef(0)
  const heroOldUVPosRef = useRef(new THREE.Vector2(0.5, 0.5))
  const heroNewUVPosRef = useRef(new THREE.Vector2(0.5, 0.5))
  const targetHeroUVPosRef = useRef(new THREE.Vector2(0.5, 0.5))
  const targetHeroAbsPosRef = useRef(new THREE.Vector2(0, 0))
  const jumpParamsRef = useRef({ jumpProgress: 0 })
  const isExplodingRef = useRef(false)
  const mouseRef = useRef(new THREE.Vector2())
  const raycasterRef = useRef(new THREE.Raycaster())
  const floorSizeRef = useRef(30)
  const timeRef = useRef(0)

  const primMatRef = useRef<THREE.MeshToonMaterial>(
    new THREE.MeshToonMaterial({ color: new THREE.Color(colors.bunnyPrimary) }),
  )
  const secMatRef = useRef<THREE.MeshToonMaterial>(
    new THREE.MeshToonMaterial({ color: new THREE.Color(colors.bunnySecondary) }),
  )
  const bonusMatRef = useRef<THREE.MeshToonMaterial>(
    new THREE.MeshToonMaterial({ color: new THREE.Color(colors.carrotBody) }),
  )
  const leafMatRef = useRef<THREE.MeshToonMaterial>(
    new THREE.MeshToonMaterial({ color: new THREE.Color(colors.carrotLeaf) }),
  )
  const outlineMatRef = useRef<THREE.ShaderMaterial>(createOutlineMaterial())

  useEffect(() => {
    primMatRef.current.color.set(colors.bunnyPrimary)
    secMatRef.current.color.set(colors.bunnySecondary)
    bonusMatRef.current.color.set(colors.carrotBody)
    leafMatRef.current.color.set(colors.carrotLeaf)
    outlineMatRef.current.uniforms.color.value = new THREE.Color(colors.outline)
    scene.fog = new THREE.Fog(new THREE.Color(colors.fog).getHex(), 13, 20)

    if (floorRef.current) {
      const mat = floorRef.current.material as THREE.Material & {
        color?: THREE.Color
        uniforms?: Record<string, { value: THREE.Color }>
      }
      if (mat.color) {
        mat.color.set(colors.floor)
      } else if (mat.uniforms?.color) {
        mat.uniforms.color.value.set(new THREE.Color(colors.floor))
      }
    }

    if (carrotMarkerRef.current) {
      const markerMat = carrotMarkerRef.current.material as THREE.MeshBasicMaterial
      markerMat.color.set(colors.carrotBody)
    }

    if (carrotMarkerDotRef.current) {
      const markerDotMat = carrotMarkerDotRef.current.material as THREE.MeshBasicMaterial
      markerDotMat.color.set(colors.carrotLeaf)
    }
  }, [colors, scene])

  useBunnySceneSetup({
    scene,
    camera,
    gl,
    colors,
    setModelLoaded,
    floorSizeRef,
    rabbitRef,
    rabbitBodyRef,
    earLeftRef,
    earRightRef,
    carrotRef,
    carrotMarkerRef,
    carrotMarkerDotRef,
    floorRef,
    lineRef,
    bufferSimRef,
    floorSimMatRef,
    particlesRef,
    particles2Ref,
    primMatRef,
    secMatRef,
    bonusMatRef,
    leafMatRef,
    outlineMatRef,
  })

  const hideCarrotMarker = useCallback(() => {
    if (carrotMarkerRef.current) carrotMarkerRef.current.visible = false
    if (carrotMarkerDotRef.current) carrotMarkerDotRef.current.visible = false
  }, [])

  const spawnCarrot = useCallback(() => {
    if (!carrotRef.current) return

    hideCarrotMarker()

    const spawnRange = isMobile ? 0.24 : 0.3
    const px = (Math.random() - 0.5) * spawnRange
    const py = (Math.random() - 0.5) * spawnRange
    const h = 0.2 + Math.random() * 1
    const spawnX = px * floorSizeRef.current
    const spawnZ = py * floorSizeRef.current

    carrotRef.current.position.x = spawnX
    carrotRef.current.position.z = spawnZ
    carrotRef.current.position.y = -1

    carrotRef.current.scale.set(0, 0, 0)
    carrotRef.current.visible = true

    if (h > HIGH_CARROT_HEIGHT_THRESHOLD && carrotMarkerRef.current && carrotMarkerDotRef.current) {
      carrotMarkerRef.current.visible = true
      carrotMarkerDotRef.current.visible = true
      carrotMarkerRef.current.position.set(spawnX, CARROT_MARKER_Y_OFFSET, spawnZ)
      carrotMarkerDotRef.current.position.set(spawnX, CARROT_MARKER_Y_OFFSET + 0.005, spawnZ)
      carrotMarkerRef.current.scale.set(0.4, 0.4, 0.4)
      carrotMarkerDotRef.current.scale.set(0, 0, 0)

      gsap.to(carrotMarkerRef.current.scale, {
        duration: 0.8,
        ease: "elastic.out",
        x: 1,
        y: 1,
        z: 1,
      })

      gsap.to(carrotMarkerDotRef.current.scale, {
        duration: 0.6,
        ease: "back.out(1.7)",
        x: 1,
        y: 1,
        z: 1,
      })
    }

    gsap.to(carrotRef.current.scale, {
      duration: 1.5,
      ease: "elastic.out",
      x: 1,
      y: 1,
      z: 1,
    })

    gsap.to(carrotRef.current.position, {
      duration: 1.5,
      ease: "elastic.out",
      y: h,
    })
  }, [hideCarrotMarker, isMobile])

  const explode = useCallback(
    (pos: THREE.Vector3) => {
      isExplodingRef.current = true

      for (const mesh of particlesRef.current) {
        mesh.position.set(pos.x, pos.y, pos.z)
        mesh.scale.set(2, 2, 2)

        gsap.to(mesh.position, {
          x: pos.x + (-0.5 + Math.random()) * 1.5,
          y: pos.y + (0.5 + Math.random()) * 1.5,
          z: pos.z + (-0.5 + Math.random()) * 1.5,
          duration: 1,
          ease: "power4.out",
        })

        gsap.to(mesh.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1,
          ease: "power4.out",
          onComplete: () => {
            spawnCarrot()
            isExplodingRef.current = false
          },
        })
      }

      for (const mesh of particles2Ref.current) {
        mesh.position.set(pos.x, pos.y, pos.z)
        mesh.scale.set(2, 2, 2)

        gsap.to(mesh.position, {
          x: pos.x + (-0.5 + Math.random()) * 1.5,
          y: pos.y + (0.5 + Math.random()) * 1.5,
          z: pos.z + (-0.5 + Math.random()) * 1.5,
          duration: 1,
          ease: "power4.out",
        })

        gsap.to(mesh.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1,
          ease: "power4.out",
        })
      }
    },
    [spawnCarrot],
  )

  const testCollision = useCallback(() => {
    if (isExplodingRef.current || !rabbitRef.current || !carrotRef.current) return

    const distVec = rabbitRef.current.position.clone()
    distVec.sub(carrotRef.current.position)

    if (distVec.length() <= 1 && carrotRef.current.visible) {
      carrotRef.current.visible = false
      hideCarrotMarker()
      explode(carrotRef.current.position.clone())
      onCarrotCollected()
    }
  }, [explode, hideCarrotMarker, onCarrotCollected])

  const jump = useCallback(() => {
    if (
      !rabbitRef.current ||
      !rabbitBodyRef.current ||
      !earLeftRef.current ||
      !earRightRef.current
    ) {
      return
    }

    setIsJumping(true)
    const turns = Math.floor(heroSpeedRef.current.length() * 5) + 1
    const jumpDuration = 0.5 + turns * 0.2
    const targetRot = heroAngularSpeedRef.current > 0 ? Math.PI * 2 * turns : -Math.PI * 2 * turns

    gsap.to(rabbitBodyRef.current.rotation, {
      duration: jumpDuration,
      ease: "linear.none",
      y: targetRot,
      onComplete: () => {
        if (rabbitBodyRef.current) rabbitBodyRef.current.rotation.y = 0
      },
    })

    gsap.to([earLeftRef.current.rotation, earRightRef.current.rotation], {
      duration: jumpDuration * 0.8,
      ease: "power4.out",
      x: Math.PI / 4,
    })

    gsap.to([earLeftRef.current.rotation, earRightRef.current.rotation], {
      duration: jumpDuration * 0.2,
      delay: jumpDuration * 0.8,
      ease: "power4.in",
      x: 0,
    })

    gsap.to(jumpParamsRef.current, {
      duration: jumpDuration * 0.5,
      ease: "power2.out",
      jumpProgress: 0.5,
      onUpdate: () => {
        if (!rabbitRef.current) return
        const sin = Math.sin(jumpParamsRef.current.jumpProgress * Math.PI)
        rabbitRef.current.position.y = Math.pow(sin, 4) * turns
      },
    })

    gsap.to(jumpParamsRef.current, {
      duration: jumpDuration * 0.5,
      ease: "power2.in",
      delay: jumpDuration * 0.5,
      jumpProgress: 1,
      onUpdate: () => {
        if (!rabbitRef.current) return
        const sin = Math.sin(jumpParamsRef.current.jumpProgress * Math.PI)
        rabbitRef.current.position.y = Math.pow(sin, 1) * turns
      },
      onComplete: () => {
        if (!rabbitRef.current) return
        rabbitRef.current.position.y = 0
        jumpParamsRef.current.jumpProgress = 0
        setIsJumping(false)
      },
    })
  }, [])

  useBunnyPointerInput({
    mouseRef,
    rabbitRef,
    isJumping,
    onJump: jump,
  })

  useBunnyRuntimeLoop({
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
    onCollisionCheck: testCollision,
  })

  return null
}

export default BunnyScene
