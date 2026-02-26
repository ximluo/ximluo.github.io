import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react"
import * as THREE from "three"
import { Reflector } from "three/examples/jsm/objects/Reflector.js"
import { BufferSim } from "./bunnySceneMaterials"
import {
  createBunnySceneScaffold,
  loadRabbitModelIntoScene,
  type AddToScene,
  type BunnyMaterialRefs,
} from "./bunnySceneSetup.helpers"
import type { BunnySceneColors } from "./bunnyScene.types"

const disposeObjectGeometries = (objects: THREE.Object3D[]) => {
  const geometries = new Set<THREE.BufferGeometry>()

  objects.forEach((object) => {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh || (child as THREE.Line).isLine) {
        const geometry = (child as THREE.Mesh | THREE.Line).geometry
        if (geometry) {
          geometries.add(geometry)
        }
      }
    })
  })

  geometries.forEach((geometry) => geometry.dispose())
}

interface BunnySceneSetupOptions extends BunnyMaterialRefs {
  scene: THREE.Scene
  camera: THREE.Camera
  gl: THREE.WebGLRenderer
  isMobile: boolean
  colors: BunnySceneColors
  setModelLoaded: Dispatch<SetStateAction<boolean>>
  floorSizeRef: MutableRefObject<number>
  rabbitRef: MutableRefObject<THREE.Group | null>
  rabbitBodyRef: MutableRefObject<THREE.Object3D | null>
  earLeftRef: MutableRefObject<THREE.Object3D | null>
  earRightRef: MutableRefObject<THREE.Object3D | null>
  carrotRef: MutableRefObject<THREE.Object3D | null>
  carrotMarkerRef: MutableRefObject<THREE.Mesh | null>
  carrotMarkerDotRef: MutableRefObject<THREE.Mesh | null>
  floorRef: MutableRefObject<Reflector | null>
  lineRef: MutableRefObject<THREE.Line | null>
  bufferSimRef: MutableRefObject<BufferSim | null>
  floorSimMatRef: MutableRefObject<THREE.ShaderMaterial | null>
  particlesRef: MutableRefObject<THREE.Mesh[]>
  particles2Ref: MutableRefObject<THREE.Mesh[]>
}

export const useBunnySceneSetup = ({
  scene,
  camera,
  gl,
  isMobile,
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
}: BunnySceneSetupOptions) => {
  useEffect(() => {
    scene.fog = new THREE.Fog(new THREE.Color(colors.fog).getHex(), 13, 20)
    camera.position.set(0, 4, 8)
    camera.lookAt(0, 0, 0)

    const createdObjects: THREE.Object3D[] = []
    const disposedRef = { current: false }

    const addToScene: AddToScene = (object) => {
      scene.add(object)
      createdObjects.push(object)
      return object
    }

    const { floorSimMat, lineMaterial, lineGeometry, particleGeom } = createBunnySceneScaffold({
      gl,
      isMobile,
      colors,
      floorSizeRef,
      lineRef,
      floorRef,
      carrotMarkerRef,
      carrotMarkerDotRef,
      bufferSimRef,
      floorSimMatRef,
      particlesRef,
      particles2Ref,
      primMatRef,
      bonusMatRef,
      addToScene,
    })

    loadRabbitModelIntoScene({
      addToScene,
      disposedRef,
      setModelLoaded,
      rabbitRef,
      rabbitBodyRef,
      earLeftRef,
      earRightRef,
      carrotRef,
      primMatRef,
      secMatRef,
      bonusMatRef,
      leafMatRef,
      outlineMatRef,
    })

    return () => {
      disposedRef.current = true
      setModelLoaded(false)

      ;(floorRef.current as (Reflector & { dispose?: () => void }) | null)?.dispose?.()

      createdObjects.forEach((object) => {
        if (object.parent === scene) {
          scene.remove(object)
        }
      })

      disposeObjectGeometries(createdObjects)
      lineGeometry.dispose()
      lineMaterial.dispose()
      particleGeom.dispose()
      floorSimMat?.dispose()
      bufferSimRef.current?.dispose()

      lineRef.current = null
      floorRef.current = null
      carrotMarkerRef.current = null
      carrotMarkerDotRef.current = null
      rabbitRef.current = null
      rabbitBodyRef.current = null
      earLeftRef.current = null
      earRightRef.current = null
      carrotRef.current = null
      particlesRef.current = []
      particles2Ref.current = []
      floorSimMatRef.current = null
      bufferSimRef.current = null
    }
  }, [
    bonusMatRef,
    bufferSimRef,
    camera,
    carrotMarkerDotRef,
    carrotMarkerRef,
    carrotRef,
    colors,
    earLeftRef,
    earRightRef,
    floorRef,
    floorSimMatRef,
    floorSizeRef,
    gl,
    isMobile,
    leafMatRef,
    lineRef,
    outlineMatRef,
    particles2Ref,
    particlesRef,
    primMatRef,
    rabbitBodyRef,
    rabbitRef,
    scene,
    secMatRef,
    setModelLoaded,
  ])
}
