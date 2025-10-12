"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { Reflector } from "three/examples/jsm/objects/Reflector.js"
import gsap from "gsap"

interface BunnyModalProps {
  onClose: () => void
  theme: "bunny" | "water"
}

const MODAL_ROOT_ID = "bunny-modal-root"

// Custom shader materials
const createOutlineMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0x000000) },
      size: { value: 0.02 },
      time: { value: 0.0 },
    },
    vertexShader: `
      uniform float size;
      uniform float time;

      void main() {
        vec3 transformed = position + normal * size * (1.0 + abs(sin(position.y * time * 0.02) * 2.0));
        vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
        gl_Position = projectionMatrix * modelViewPosition; 
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide,
  })
}

// Buffer simulation for floor effects
class BufferSim {
  renderer: THREE.WebGLRenderer
  shader: THREE.ShaderMaterial
  orthoScene: THREE.Scene
  fbos: THREE.WebGLRenderTarget[]
  current: number
  output: THREE.WebGLRenderTarget
  orthoCamera: THREE.OrthographicCamera
  orthoQuad: THREE.Mesh

  constructor(renderer: THREE.WebGLRenderer, width: number, height: number, shader: THREE.ShaderMaterial) {
    this.renderer = renderer
    this.shader = shader
    this.orthoScene = new THREE.Scene()

    const fbo = new THREE.WebGLRenderTarget(width, height, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      stencilBuffer: false,
      depthBuffer: false,
    })

    fbo.texture.generateMipmaps = false

    this.fbos = [fbo, fbo.clone()]
    this.current = 0
    this.output = this.fbos[0]
    this.orthoCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.00001, 1000)
    this.orthoQuad = new THREE.Mesh(new THREE.PlaneGeometry(width, height), this.shader)
    this.orthoScene.add(this.orthoQuad)
  }

  render() {
    this.shader.uniforms.inputTexture.value = this.fbos[this.current].texture
    this.current = 1 - this.current
    this.output = this.fbos[this.current]
    this.renderer.setRenderTarget(this.output)
    this.renderer.render(this.orthoScene, this.orthoCamera)
    this.renderer.setRenderTarget(null)
  }
}

// Main BunnyScene component
const BunnyScene = () => {
  const { scene, gl, camera } = useThree()
  const [modelLoaded, setModelLoaded] = useState(false)
  const [isJumping, setIsJumping] = useState(false)

  // References
  const rabbitRef = useRef<THREE.Group>(null)
  const rabbitBodyRef = useRef<THREE.Object3D>(null)
  const earLeftRef = useRef<THREE.Object3D>(null)
  const earRightRef = useRef<THREE.Object3D>(null)
  const carrotRef = useRef<THREE.Object3D>(null)
  const floorRef = useRef<Reflector>(null)
  const lineRef = useRef<THREE.Line>(null)
  const bufferSimRef = useRef<BufferSim | null>(null)
  const floorSimMatRef = useRef<THREE.ShaderMaterial | null>(null)
  const particlesRef = useRef<THREE.Mesh[]>([])
  const particles2Ref = useRef<THREE.Mesh[]>([])

  // Game state
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

  // Materials
  const primMatRef = useRef<THREE.MeshToonMaterial>(new THREE.MeshToonMaterial({ color: 0x7beeff }))
  const secMatRef = useRef<THREE.MeshToonMaterial>(new THREE.MeshToonMaterial({ color: 0x332e2e }))
  const bonusMatRef = useRef<THREE.MeshToonMaterial>(new THREE.MeshToonMaterial({ color: 0xff3434 }))
  const outlineMatRef = useRef<THREE.ShaderMaterial>(createOutlineMaterial())

  // Setup scene
  useEffect(() => {
    // Scene setup
    scene.fog = new THREE.Fog(0x332e2e, 13, 20)
    camera.position.set(0, 4, 8)
    camera.lookAt(0, 0, 0)

    // Create floor simulation material
    const floorSimMat = new THREE.ShaderMaterial({
      uniforms: {
        inputTexture: { value: null },
        time: { value: 0.0 },
        blade1PosOld: { value: new THREE.Vector2(0.5, 0.5) },
        blade1PosNew: { value: new THREE.Vector2(0.5, 0.5) },
        strength: { value: 0.0 },
      },
      vertexShader: `
        precision highp float;
        uniform float time;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * modelViewPosition; 
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D inputTexture;
        uniform vec2 blade1PosOld;
        uniform vec2 blade1PosNew;
        uniform float strength;
        uniform float time;
        varying vec2 vUv;

        float lineSegment(vec2 p, vec2 a, vec2 b, float thickness) {
            vec2 pa = p - a;
            vec2 ba = b - a;
            float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
            float idk = length(pa - ba*h);
            return smoothstep(thickness, 0.2 * thickness, idk);
        }

        void main(void) {
          vec4 prevTexture = texture2D(inputTexture, vUv);
          vec3 col = prevTexture.rgb * 0.999;
          if (strength > 0.0) {
              float space = 0.001;
              float crease = 0.001;
              float thickness = 0.001 + strength * 0.001;
              float leftRed = lineSegment(vUv + space, blade1PosOld, blade1PosNew, thickness);
              float leftGreen = lineSegment(vUv + space + crease, blade1PosOld, blade1PosNew, thickness);
              float rightRed = lineSegment(vUv - space - crease, blade1PosOld, blade1PosNew, thickness);
              float rightGreen = lineSegment(vUv - space, blade1PosOld, blade1PosNew, thickness);
              col.r += (leftRed + rightRed) * strength * 3.0;
              col.g += (leftGreen + rightGreen) * strength * 3.0;
              col.r = clamp(col.r, 0.0, 1.0);
              col.g = clamp(col.g, 0.0, 1.0);
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })

    floorSimMatRef.current = floorSimMat
    bufferSimRef.current = new BufferSim(gl, 1024, 1024, floorSimMat)

    // Create line
    const lineMaterial = new THREE.LineDashedMaterial({
      color: 0x7beeff,
      linewidth: 1,
      scale: 1,
      dashSize: 0.2,
      gapSize: 0.1,
    })

    const points = []
    points.push(new THREE.Vector3(0, 0.2, 0))
    points.push(new THREE.Vector3(3, 0.2, 3))
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(lineGeometry, lineMaterial)
    scene.add(line)
    lineRef.current = line

    // Create particles
    const bodyCount = 20
    const tailCount = 5
    const particleGeom = new THREE.BoxGeometry(0.2, 0.2, 0.2, 1, 1, 1)

    const particles1: THREE.Mesh[] = []
    const particles2: THREE.Mesh[] = []

    for (let i = 0; i < bodyCount; i++) {
      const m = new THREE.Mesh(particleGeom, bonusMatRef.current)
      particles1.push(m)
      m.scale.set(0, 0, 0)
      scene.add(m)
    }

    for (let i = 0; i < tailCount; i++) {
      const m = new THREE.Mesh(particleGeom, primMatRef.current)
      particles2.push(m)
      m.scale.set(0, 0, 0)
      scene.add(m)
    }

    particlesRef.current = particles1
    particles2Ref.current = particles2

    // Create lighting
    const ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 5, 1)
    directionalLight.castShadow = true
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
    scene.add(directionalLight)

    // Load rabbit model
    const loader = new GLTFLoader()
    loader.load("/models/rabbit.glb", (gltf) => {
      const model = gltf.scene

      // Get rabbit parts
      const rabbit = model.getObjectByName("Rabbit") as THREE.Group
      const rabbitBody = model.getObjectByName("body") as THREE.Mesh
      const earRight = model.getObjectByName("earRight") as THREE.Mesh
      const earLeft = model.getObjectByName("earLeft") as THREE.Mesh
      const tail = model.getObjectByName("tail") as THREE.Mesh
      const footLeft = model.getObjectByName("footLeft") as THREE.Mesh
      const footRight = model.getObjectByName("footRight") as THREE.Mesh
      const eyeLeft = model.getObjectByName("eyeLeft") as THREE.Mesh
      const eyeRight = model.getObjectByName("eyeRight") as THREE.Mesh
      const carrot = model.getObjectByName("carrot") as THREE.Mesh
      const carrotLeaf = model.getObjectByName("carrotLeaf") as THREE.Mesh
      const carrotLeaf2 = model.getObjectByName("carrotLeaf2") as THREE.Mesh

      if (
        rabbit &&
        rabbitBody &&
        earRight &&
        earLeft &&
        tail &&
        footLeft &&
        footRight &&
        eyeLeft &&
        eyeRight &&
        carrot &&
        carrotLeaf &&
        carrotLeaf2
      ) {
        // Setup rabbit
        carrot.rotation.z = 0.2
        carrot.rotation.x = 0.2

        // Apply materials
        rabbitBody.material = primMatRef.current
        earRight.material = primMatRef.current
        earLeft.material = primMatRef.current
        tail.material = primMatRef.current
        footLeft.material = secMatRef.current
        footRight.material = secMatRef.current
        eyeLeft.material = secMatRef.current
        eyeRight.material = secMatRef.current
        carrot.material = bonusMatRef.current
        carrotLeaf.material = primMatRef.current
        carrotLeaf2.material = primMatRef.current

        // Add outlines
        const addOutline = (obj: THREE.Object3D) => {
          const outline = obj.clone() as THREE.Mesh
          outline.children = []
          outline.position.set(0, 0, 0)
          outline.rotation.x = 0
          outline.rotation.y = 0
          outline.rotation.z = 0
          outline.scale.set(1, 1, 1)
          outline.material = outlineMatRef.current
          obj.add(outline)
        }

        addOutline(rabbitBody)
        addOutline(earRight)
        addOutline(earLeft)
        addOutline(tail)
        addOutline(carrot)

        // Setup shadows
        rabbit.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            object.castShadow = true
            object.receiveShadow = true
          }
        })

        carrot.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) {
            object.castShadow = true
          }
        })

        // Add to scene
        scene.add(rabbit)
        scene.add(carrot)

        // Store references
        rabbitRef.current = rabbit as THREE.Group
        rabbitBodyRef.current = rabbitBody
        earLeftRef.current = earLeft
        earRightRef.current = earRight
        carrotRef.current = carrot

        setModelLoaded(true)
      }
    })

    // Create reflective floor
    const floor = new Reflector(new THREE.PlaneGeometry(floorSizeRef.current, floorSizeRef.current), {
      color: new THREE.Color(0x332e2e),
      textureWidth: 1024,
      textureHeight: 1024,
    })
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    floorRef.current = floor

    // Event listeners
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        event.preventDefault()
        mouseRef.current.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1
        mouseRef.current.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1
      }
    }

    const handleClick = () => {
      if (rabbitRef.current && !isJumping) {
        jump()
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("mousedown", handleClick)
    window.addEventListener("touchstart", handleClick)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("mousedown", handleClick)
      window.removeEventListener("touchstart", handleClick)
    }
  }, [scene, camera, gl])

  // Helper functions
  const getShortestAngle = (v: number) => {
    let a = v % (Math.PI * 2)
    if (a < -Math.PI) a += Math.PI * 2
    else if (a > Math.PI) a -= Math.PI * 2
    return a
  }

  const constrain = (v: number, vMin: number, vMax: number) => {
    return Math.min(vMax, Math.max(vMin, v))
  }

  const raycast = () => {
    if (!floorRef.current) return

    raycasterRef.current.setFromCamera(mouseRef.current, camera)
    const intersects = raycasterRef.current.intersectObject(floorRef.current)

    if (intersects.length > 0 && intersects[0].uv) {
      targetHeroUVPosRef.current.x = intersects[0].uv.x
      targetHeroUVPosRef.current.y = intersects[0].uv.y
    }
  }

  const jump = () => {
    if (!rabbitRef.current || !rabbitBodyRef.current || !earLeftRef.current || !earRightRef.current) return

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
  }

  const testCollision = () => {
    if (isExplodingRef.current || !rabbitRef.current || !carrotRef.current) return

    const distVec = rabbitRef.current.position.clone()
    distVec.sub(carrotRef.current.position)
    const l = distVec.length()

    if (l <= 1) {
      carrotRef.current.visible = false
      explode(carrotRef.current.position.clone())
    }
  }

  const explode = (pos: THREE.Vector3) => {
    isExplodingRef.current = true

    const p1Count = particlesRef.current.length
    const p2Count = particles2Ref.current.length

    for (let i = 0; i < p1Count; i++) {
      const m = particlesRef.current[i]
      m.position.x = pos.x
      m.position.y = pos.y
      m.position.z = pos.z
      m.scale.set(2, 2, 2)

      gsap.to(m.position, {
        x: pos.x + (-0.5 + Math.random()) * 1.5,
        y: pos.y + (0.5 + Math.random()) * 1.5,
        z: pos.z + (-0.5 + Math.random()) * 1.5,
        duration: 1,
        ease: "power4.out",
      })

      gsap.to(m.scale, {
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

    for (let i = 0; i < p2Count; i++) {
      const m = particles2Ref.current[i]
      m.position.x = pos.x
      m.position.y = pos.y
      m.position.z = pos.z
      m.scale.set(2, 2, 2)

      gsap.to(m.position, {
        x: pos.x + (-0.5 + Math.random()) * 1.5,
        y: pos.y + (0.5 + Math.random()) * 1.5,
        z: pos.z + (-0.5 + Math.random()) * 1.5,
        duration: 1,
        ease: "power4.out",
      })

      gsap.to(m.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: "power4.out",
      })
    }
  }

  const spawnCarrot = () => {
    if (!carrotRef.current) return

    const px = (Math.random() - 0.5) * 0.3
    const py = (Math.random() - 0.5) * 0.3
    const h = 0.2 + Math.random() * 1

    carrotRef.current.position.x = px * floorSizeRef.current
    carrotRef.current.position.z = py * floorSizeRef.current
    carrotRef.current.position.y = -1

    carrotRef.current.scale.set(0, 0, 0)
    carrotRef.current.visible = true

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
  }

  // Animation loop
  useFrame((_, delta) => {
    if (!modelLoaded) return

    const dt = Math.min(delta, 0.3)
    timeRef.current += dt

    if (outlineMatRef.current) {
      outlineMatRef.current.uniforms.time.value = timeRef.current
    }

    if (rabbitRef.current && lineRef.current && floorRef.current && floorSimMatRef.current && bufferSimRef.current) {
      // Raycast to get mouse position on floor
      raycast()

      // Elastic string simulation
      const constrainUVPosX = constrain(targetHeroUVPosRef.current.x - 0.5, -0.3, 0.3)
      const constrainUVPosY = constrain(targetHeroUVPosRef.current.y - 0.5, -0.3, 0.3)
      targetHeroAbsPosRef.current.x = constrainUVPosX * floorSizeRef.current
      targetHeroAbsPosRef.current.y = -constrainUVPosY * floorSizeRef.current

      const dx = targetHeroAbsPosRef.current.x - rabbitRef.current.position.x
      const dy = targetHeroAbsPosRef.current.y - rabbitRef.current.position.z

      const angle = Math.atan2(dy, dx)
      const heroDistance = Math.sqrt(dx * dx + dy * dy)
      const ax = dx * dt * 0.5
      const ay = dy * dt * 0.5

      heroSpeedRef.current.x += ax
      heroSpeedRef.current.y += ay

      heroSpeedRef.current.x *= Math.pow(dt, 0.005)
      heroSpeedRef.current.y *= Math.pow(dt, 0.005)

      rabbitRef.current.position.x += heroSpeedRef.current.x
      rabbitRef.current.position.z += heroSpeedRef.current.y

      const targetRot = -angle + Math.PI / 2

      if (heroDistance > 0.3) {
        rabbitRef.current.rotation.y += getShortestAngle(targetRot - rabbitRef.current.rotation.y) * 3 * dt
      }

      heroAngularSpeedRef.current = getShortestAngle(rabbitRef.current.rotation.y - heroOldRotRef.current)
      heroOldRotRef.current = rabbitRef.current.rotation.y

      if (!isJumping && earLeftRef.current && earRightRef.current) {
        earLeftRef.current.rotation.x = earRightRef.current.rotation.x = -heroSpeedRef.current.length() * 2
      }

      // Update line position
      const linePositions = (lineRef.current.geometry as THREE.BufferGeometry).attributes.position.array
      linePositions[0] = targetHeroAbsPosRef.current.x
      linePositions[2] = targetHeroAbsPosRef.current.y
      linePositions[3] = rabbitRef.current.position.x
      linePositions[4] = rabbitRef.current.position.y
      linePositions[5] = rabbitRef.current.position.z
        ; (lineRef.current.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true
      lineRef.current.computeLineDistances()

      // Update floor simulation
      heroNewUVPosRef.current.x = 0.5 + rabbitRef.current.position.x / floorSizeRef.current
      heroNewUVPosRef.current.y = 0.5 - rabbitRef.current.position.z / floorSizeRef.current

      floorSimMatRef.current.uniforms.time.value += dt
      floorSimMatRef.current.uniforms.blade1PosNew.value = heroNewUVPosRef.current
      floorSimMatRef.current.uniforms.blade1PosOld.value = heroOldUVPosRef.current
      floorSimMatRef.current.uniforms.strength.value = isJumping ? 0 : 1 / (1 + heroSpeedRef.current.length() * 10)

      bufferSimRef.current.render()

      // Update floor material
      if (floorRef.current.material instanceof THREE.ShaderMaterial) {
        floorRef.current.material.uniforms.tScratches = { value: bufferSimRef.current.output.texture }
      }

      heroOldUVPosRef.current.copy(heroNewUVPosRef.current)

      if (carrotRef.current) {
        carrotRef.current.rotation.y += dt
      }

      // Test collision
      testCollision()
    }
  })

  return null
}

const BunnyModal: React.FC<BunnyModalProps> = ({ onClose, theme }) => {
  const portalRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

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

  const themes = {
    bunny: {
      "--color-text": "rgb(121, 85, 189)",
      "--color-text-secondary": "rgba(249, 240, 251, 1)",
      "--color-accent-primary": "rgba(223, 30, 155, 1)",
      "--button-bg": "rgba(223, 30, 155, 0.8)",
      "--button-bg-light": "rgba(223, 30, 155, 0.2)",
      "--button-text": "rgba(249, 240, 251, 1)",
      "--border-color": "rgb(152, 128, 220)",
    },
    water: {
      "--color-text": "rgb(191, 229, 249)",
      "--color-accent-primary": "rgb(134, 196, 240)",
      "--button-bg": "rgba(214, 235, 251, 0.8)",
      "--button-bg-light": "rgba(214, 220, 251, 0.2)",
      "--button-text": "rgb(46, 80, 192)",
      "--border-color": "rgba(8, 34, 163, 1)",
    },
  }

  if (!mounted || !portalRef.current) {
    return null
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Canvas
          shadows
          gl={{
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: false,
          }}
          dpr={window.devicePixelRatio}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            outline: "none",
            cursor: "grabbing",
          }}
        >
          <BunnyScene />
        </Canvas>

        <div
          style={{
            position: "absolute",
            width: "100%",
            bottom: "60px",
            fontFamily: "'Open Sans', sans-serif",
            color: "#ff3434",
            fontSize: "0.7em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          - Press to jump -
        </div>

        <div
          style={{
            position: "absolute",
            width: "100%",
            bottom: "20px",
            fontFamily: "'Open Sans', sans-serif",
            color: "#544027",
            fontSize: "0.7em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          <a
            href="#"
            style={{ color: "#7beeff" }}
            onClick={(e) => {
              e.preventDefault()
              onClose()
            }}
          >
            close
          </a>
        </div>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: theme === "bunny" ? themes.bunny["--button-bg-light"] : themes.water["--button-bg-light"],
            color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            cursor: "pointer",
            zIndex: 1001,
          }}
        >
          ×
        </button>
      </div>
    </div>,
    portalRef.current,
  )
}

export default BunnyModal
