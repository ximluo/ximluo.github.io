import type { Dispatch, MutableRefObject, SetStateAction } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { Reflector } from "three/examples/jsm/objects/Reflector.js"
import { BufferSim, createFloorSimulationMaterial } from "./bunnySceneMaterials"
import type { BunnySceneColors } from "./bunnyScene.types"

const CARROT_MARKER_Y_OFFSET = 0.01

export type AddToScene = <T extends THREE.Object3D>(object: T) => T

export interface BunnyMaterialRefs {
  primMatRef: MutableRefObject<THREE.MeshToonMaterial>
  secMatRef: MutableRefObject<THREE.MeshToonMaterial>
  bonusMatRef: MutableRefObject<THREE.MeshToonMaterial>
  leafMatRef: MutableRefObject<THREE.MeshToonMaterial>
  outlineMatRef: MutableRefObject<THREE.ShaderMaterial>
}

export interface BunnyScaffoldResources {
  floorSimMat: THREE.ShaderMaterial | null
  lineMaterial: THREE.LineDashedMaterial
  lineGeometry: THREE.BufferGeometry
  particleGeom: THREE.BoxGeometry
}

interface CreateBunnySceneScaffoldOptions {
  gl: THREE.WebGLRenderer
  isMobile: boolean
  colors: BunnySceneColors
  floorSizeRef: MutableRefObject<number>
  lineRef: MutableRefObject<THREE.Line | null>
  floorRef: MutableRefObject<Reflector | null>
  carrotMarkerRef: MutableRefObject<THREE.Mesh | null>
  carrotMarkerDotRef: MutableRefObject<THREE.Mesh | null>
  bufferSimRef: MutableRefObject<BufferSim | null>
  floorSimMatRef: MutableRefObject<THREE.ShaderMaterial | null>
  particlesRef: MutableRefObject<THREE.Mesh[]>
  particles2Ref: MutableRefObject<THREE.Mesh[]>
  primMatRef: MutableRefObject<THREE.MeshToonMaterial>
  bonusMatRef: MutableRefObject<THREE.MeshToonMaterial>
  addToScene: AddToScene
}

interface RabbitModelParts {
  rabbit: THREE.Group
  rabbitBody: THREE.Mesh
  earRight: THREE.Mesh
  earLeft: THREE.Mesh
  tail: THREE.Mesh
  footLeft: THREE.Mesh
  footRight: THREE.Mesh
  eyeLeft: THREE.Mesh
  eyeRight: THREE.Mesh
  carrot: THREE.Mesh
  carrotLeaf: THREE.Mesh
  carrotLeaf2: THREE.Mesh
}

interface LoadRabbitModelIntoSceneOptions extends BunnyMaterialRefs {
  addToScene: AddToScene
  disposedRef: MutableRefObject<boolean>
  setModelLoaded: Dispatch<SetStateAction<boolean>>
  rabbitRef: MutableRefObject<THREE.Group | null>
  rabbitBodyRef: MutableRefObject<THREE.Object3D | null>
  earLeftRef: MutableRefObject<THREE.Object3D | null>
  earRightRef: MutableRefObject<THREE.Object3D | null>
  carrotRef: MutableRefObject<THREE.Object3D | null>
}

const applyRabbitMaterialsAndOutlines = (
  parts: RabbitModelParts,
  { primMatRef, secMatRef, bonusMatRef, leafMatRef, outlineMatRef }: BunnyMaterialRefs,
) => {
  parts.carrot.rotation.z = 0.2
  parts.carrot.rotation.x = 0.2

  parts.rabbitBody.material = primMatRef.current
  parts.earRight.material = primMatRef.current
  parts.earLeft.material = primMatRef.current
  parts.tail.material = primMatRef.current
  parts.footLeft.material = secMatRef.current
  parts.footRight.material = secMatRef.current
  parts.eyeLeft.material = secMatRef.current
  parts.eyeRight.material = secMatRef.current
  parts.carrot.material = bonusMatRef.current
  parts.carrotLeaf.material = leafMatRef.current
  parts.carrotLeaf2.material = leafMatRef.current

  const addOutline = (obj: THREE.Object3D) => {
    const outline = obj.clone() as THREE.Mesh
    outline.children = []
    outline.position.set(0, 0, 0)
    outline.rotation.set(0, 0, 0)
    outline.scale.set(1, 1, 1)
    outline.material = outlineMatRef.current
    obj.add(outline)
  }

  addOutline(parts.rabbitBody)
  addOutline(parts.earRight)
  addOutline(parts.earLeft)
  addOutline(parts.tail)
  addOutline(parts.carrot)

  parts.rabbit.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })

  parts.carrot.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      object.castShadow = true
    }
  })
}

export const loadRabbitModelIntoScene = ({
  addToScene,
  disposedRef,
  setModelLoaded,
  rabbitRef,
  rabbitBodyRef,
  earLeftRef,
  earRightRef,
  carrotRef,
  ...materialRefs
}: LoadRabbitModelIntoSceneOptions) => {
  const loader = new GLTFLoader()

  loader.load("/models/rabbit.glb", (gltf) => {
    if (disposedRef.current) return

    const model = gltf.scene
    const rabbit = model.getObjectByName("Rabbit") as THREE.Group | null
    const rabbitBody = model.getObjectByName("body") as THREE.Mesh | null
    const earRight = model.getObjectByName("earRight") as THREE.Mesh | null
    const earLeft = model.getObjectByName("earLeft") as THREE.Mesh | null
    const tail = model.getObjectByName("tail") as THREE.Mesh | null
    const footLeft = model.getObjectByName("footLeft") as THREE.Mesh | null
    const footRight = model.getObjectByName("footRight") as THREE.Mesh | null
    const eyeLeft = model.getObjectByName("eyeLeft") as THREE.Mesh | null
    const eyeRight = model.getObjectByName("eyeRight") as THREE.Mesh | null
    const carrot = model.getObjectByName("carrot") as THREE.Mesh | null
    const carrotLeaf = model.getObjectByName("carrotLeaf") as THREE.Mesh | null
    const carrotLeaf2 = model.getObjectByName("carrotLeaf2") as THREE.Mesh | null

    if (
      !rabbit ||
      !rabbitBody ||
      !earRight ||
      !earLeft ||
      !tail ||
      !footLeft ||
      !footRight ||
      !eyeLeft ||
      !eyeRight ||
      !carrot ||
      !carrotLeaf ||
      !carrotLeaf2
    ) {
      return
    }

    const parts: RabbitModelParts = {
      rabbit,
      rabbitBody,
      earRight,
      earLeft,
      tail,
      footLeft,
      footRight,
      eyeLeft,
      eyeRight,
      carrot,
      carrotLeaf,
      carrotLeaf2,
    }

    applyRabbitMaterialsAndOutlines(parts, materialRefs)

    addToScene(rabbit)
    addToScene(carrot)

    rabbitRef.current = rabbit
    rabbitBodyRef.current = rabbitBody
    earLeftRef.current = earLeft
    earRightRef.current = earRight
    carrotRef.current = carrot

    setModelLoaded(true)
  })
}

export const createBunnySceneScaffold = ({
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
}: CreateBunnySceneScaffoldOptions): BunnyScaffoldResources => {
  const reflectorTextureSize = isMobile ? 384 : 640
  let floorSimMat: THREE.ShaderMaterial | null = null
  floorSimMatRef.current = null
  bufferSimRef.current = null

  const lineMaterial = new THREE.LineDashedMaterial({
    color: 0x7beeff,
    linewidth: 1,
    scale: 1,
    dashSize: 0.2,
    gapSize: 0.1,
  })

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(3, 0.2, 3),
  ])
  const line = addToScene(new THREE.Line(lineGeometry, lineMaterial))
  lineRef.current = line

  const particleGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2, 1, 1, 1)
  const particles1: THREE.Mesh[] = []
  const particles2: THREE.Mesh[] = []

  for (let i = 0; i < 20; i++) {
    const mesh = new THREE.Mesh(particleGeom, bonusMatRef.current)
    mesh.scale.set(0, 0, 0)
    particles1.push(addToScene(mesh))
  }

  for (let i = 0; i < 5; i++) {
    const mesh = new THREE.Mesh(particleGeom, primMatRef.current)
    mesh.scale.set(0, 0, 0)
    particles2.push(addToScene(mesh))
  }

  particlesRef.current = particles1
  particles2Ref.current = particles2

  addToScene(new THREE.AmbientLight(0xffffff))

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 5, 1)
  directionalLight.castShadow = !isMobile
  directionalLight.shadow.mapSize.width = 512
  directionalLight.shadow.mapSize.height = 512
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 12
  directionalLight.shadow.camera.left = -12
  directionalLight.shadow.camera.right = 12
  directionalLight.shadow.camera.bottom = -12
  directionalLight.shadow.camera.top = 12
  directionalLight.shadow.radius = 3
  directionalLight.shadow.blurSamples = 4
  addToScene(directionalLight)

  const floor = addToScene(
    new Reflector(new THREE.PlaneGeometry(floorSizeRef.current, floorSizeRef.current), {
      color: new THREE.Color(colors.floor),
      textureWidth: reflectorTextureSize,
      textureHeight: reflectorTextureSize,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  floorRef.current = floor

  if (floor.material instanceof THREE.ShaderMaterial && floor.material.uniforms.tScratches) {
    const simTextureSize = isMobile ? 384 : 640
    floorSimMat = createFloorSimulationMaterial()
    floorSimMatRef.current = floorSimMat
    bufferSimRef.current = new BufferSim(gl, simTextureSize, simTextureSize, floorSimMat)
  }

  const carrotMarker = addToScene(
    new THREE.Mesh(
      new THREE.RingGeometry(0.25, 0.35, 32),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors.carrotBody),
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      }),
    ),
  )
  carrotMarker.rotation.x = -Math.PI / 2
  carrotMarker.position.y = CARROT_MARKER_Y_OFFSET
  carrotMarker.visible = false
  carrotMarkerRef.current = carrotMarker

  const carrotMarkerDot = addToScene(
    new THREE.Mesh(
      new THREE.CircleGeometry(0.07, 24),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors.carrotLeaf),
        side: THREE.DoubleSide,
      }),
    ),
  )
  carrotMarkerDot.rotation.x = -Math.PI / 2
  carrotMarkerDot.position.y = CARROT_MARKER_Y_OFFSET + 0.005
  carrotMarkerDot.visible = false
  carrotMarkerDotRef.current = carrotMarkerDot

  return {
    floorSimMat,
    lineMaterial,
    lineGeometry,
    particleGeom,
  }
}
