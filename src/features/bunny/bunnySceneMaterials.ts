import * as THREE from "three"

export const createOutlineMaterial = () =>
  new THREE.ShaderMaterial({
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

export const createFloorSimulationMaterial = () =>
  new THREE.ShaderMaterial({
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

export class BufferSim {
  renderer: THREE.WebGLRenderer
  shader: THREE.ShaderMaterial
  orthoScene: THREE.Scene
  fbos: THREE.WebGLRenderTarget[]
  current: number
  output: THREE.WebGLRenderTarget
  orthoCamera: THREE.OrthographicCamera
  orthoQuad: THREE.Mesh

  constructor(
    renderer: THREE.WebGLRenderer,
    width: number,
    height: number,
    shader: THREE.ShaderMaterial,
  ) {
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
    this.orthoCamera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      0.00001,
      1000,
    )
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

  dispose() {
    this.orthoQuad.geometry.dispose()
    this.fbos.forEach((fbo) => fbo.dispose())
  }
}
