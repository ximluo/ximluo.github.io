/* The About page's backdrop: a progressive path tracer, one rounded glass cube on a dark floor under a quad light the
   page tint colours. The light is never drawn: it reaches the eye only off the cube, so the frame holds its ruby
   reflection, its refraction and the caustic it pools on the floor, never a red rectangle. Each frame traces a
   sample per pixel (a few, when the frame rate allows) into a float accumulation (two textures, ping-pong), the
   blit tone-maps that onto the page colour, and the loop idles once the sample cap is reached. The cube turns: slowly on its own, under the pointer when it is
   dragged (with a fling on release), and a click on it cycles glass, chrome and bone. The pointer also orbits the
   camera a few degrees; the cube stays on its pixel through an off-centre projection shift. */
import { RM, TOUCH } from "../env"
import { readTint } from "../film/tint"
import {
  bindProgram,
  createGl,
  fbo,
  fit,
  floatTarget,
  locs,
  program,
  release,
  remountable,
  tex2d,
} from "./core"
import { createLoop } from "./loop"
import { trackPointer } from "./pointer"

type V3 = readonly [number, number, number]

/* the scene, in world units; the cube is the unit: half-size HALF with its edges rounded by RADIUS, its bottom face
   a hair above the floor so a ray leaving through it still meets the floor */
const HALF = 0.8
const RADIUS = 0.2
const LIFT = 0.005
const CENTRE: V3 = [0, HALF + LIFT, 0]
const BOUND = Math.hypot(HALF - RADIUS, HALF - RADIUS, HALF - RADIUS) + RADIUS + 0.01
const EYE0: V3 = [0, 1.6, 5.2]
const TARGET: V3 = [0, 0.8, 0]
const FOV = 28
const APERTURE = 0.035
const LIGHT: V3 = [-1.7, 3, 1.2]
const LIGHT_W = 2.4
const LIGHT_H = 1.8
const LIGHT_GAIN = 6
const ALBEDO = 0.09
const ABSORB: V3 = [0.22, 0.26, 0.3]
const FILL: V3 = [0.012, 0.016, 0.026]
const IOR = 1.5
const F0 = 0.04
const CHROME: V3 = [0.9, 0.9, 0.92]
const ROUGH = 0.08
const BONE: V3 = [0.86, 0.85, 0.82]
const BOUNCES = 5
const CLAMP = 6
/* the march */
const STEPS = 64
const STEPS_SHADOW = 48
const MARCH_EPS = 1e-3
const EPS = 3e-3
/* the look */
const EXPOSURE = 1.6
const SIZE_FRAC = 0.34
const FOG = 0.55
const TEXT_RIGHT = 760 + 48
const BAND_MIN = 260
const YAW = (6 * Math.PI) / 180
const PITCH = (3 * Math.PI) / 180
const INK: V3 = [17 / 255, 19 / 255, 23 / 255]
/* the turn: rad/s, 1/s, rad per css px, rad, rad/s, a factor on the bounding radius, css px, ms, ms */
const IDLE_SPIN = 0.15
/* seconds for the idle turn to fade after a touch, so the cube comes to rest and the image converges */
const IDLE_FADE = 5
const DAMP = 2.2
const RAD_PX = 0.012
const PITCH_MAX = 1.2
const STILL = 0.02
const HIT = 0.95
const CLICK_PX = 6
const CLICK_MS = 300
const HOLD_MS = 120
const CONTROLS = "a, button, input, textarea, [data-hot], .lr, .btn"
/* the accumulation */
const CAP_32 = 512
const CAP_16 = 192
const CAP_RM = 96
const EMA = 0.12
const EMA_MAX = 0.5
const SETTLE_MS = 150
const AWAKE_MS = 800
const DPR_MAX = 2
const SCALE = TOUCH ? 0.35 : 0.5
/* samples per frame: climbs while the frames hold a full rate, drops (for good) when they do not */
const PASSES_MAX = TOUCH ? 1 : 4
const PASSES_WINDOW = 60

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}
const lin = (c: number) => Math.pow(c, 2.2)
const f = (x: number) => x.toFixed(6)
const v3 = (a: V3) => `vec3(${f(a[0])}, ${f(a[1])}, ${f(a[2])})`
const clampPitch = (p: number) => Math.max(-PITCH_MAX, Math.min(PITCH_MAX, p))

/* the light's frame: it faces the cube, and the quad's edges lie across that */
const LN = norm(sub(CENTRE, LIGHT))
const LU = norm(cross(LN, [0, 1, 0]))
const LV = cross(LU, LN)
/* the camera's base elevation around the target, and the spec'd eye distance the aperture is relative to */
const TAN_HALF = Math.tan((FOV * Math.PI) / 360)
const V0 = sub(EYE0, TARGET)
const ELEV0 = Math.asin(V0[1] / Math.hypot(V0[0], V0[1], V0[2]))
const D0 = Math.hypot(...sub(EYE0, CENTRE))

/* pcg3d: three 32-bit words in, three out; the fragment, the frame and a running state seed it */
const PCG = `uvec3 pcg3d(uvec3 v){
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  return v;
}`

/* one path per fragment: a jittered thin-lens ray, up to five bounces over the floor, the cube and the light. the
   cube is sphere-traced on its signed distance in its own frame (uRot takes the world there), from outside and,
   while a refracted ray is in the glass, from inside. the floor and the bone cube take next-event light from the
   quad and bounce by cosine; the glass picks reflect or refract by Fresnel and darkens by Beer while inside; the
   chrome mirrors with a little jitter; the light only pays out on a specular chain. the result is blended into the
   other accumulation texture */
const TRACE_FS = `#version 300 es
precision highp float;
precision highp int;
out vec4 o;
uniform sampler2D uPrev;
uniform vec2 uRes;
uniform uint uFrame;
uniform float uBlend;
uniform vec3 uEye, uRight, uUp, uFwd;
uniform vec2 uTan;
uniform vec2 uShift;
uniform float uFocus;
uniform float uAperture;
uniform vec3 uE;
uniform float uFog;
uniform mat3 uRot;
uniform int uMat;
const float PI = 3.14159265;
const float TAU = 6.28318531;
const float EPS = ${f(EPS)};
const float MEPS = ${f(MARCH_EPS)};
const float TMIN = 1e-4;
const vec3 CC = ${v3(CENTRE)};
const vec3 BH = vec3(${f(HALF - RADIUS)});
const float BR = ${f(RADIUS)};
const float BB = ${f(BOUND)};
const vec3 LC = ${v3(LIGHT)};
const vec3 LN = ${v3(LN)};
const vec3 LU = ${v3(LU)};
const vec3 LV = ${v3(LV)};
const float LW = ${f(LIGHT_W)};
const float LH = ${f(LIGHT_H)};
const float AREA = ${f(LIGHT_W * LIGHT_H)};
const float ALB = ${f(ALBEDO)};
const vec3 BEER = ${v3(ABSORB)};
const vec3 FILL = ${v3(FILL)};
const float IOR = ${f(IOR)};
const float F0 = ${f(F0)};
const vec3 CHROME = ${v3(CHROME)};
const float ROUGH = ${f(ROUGH)};
const vec3 BONE = ${v3(BONE)};
uvec3 st;
${PCG}
vec3 rnd(){ st = pcg3d(st); return vec3(st) * (1.0 / 4294967296.0); }
/* the rounded box in its own frame: the exact distance, inside and out */
float sdBox(vec3 p){
  vec3 q = abs(p) - BH;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - BR;
}
/* its outward normal: along the offset from the core box, or the nearest face from inside the core */
vec3 nBox(vec3 p){
  vec3 q = abs(p) - BH;
  vec3 m = max(q, 0.0);
  float l = length(m);
  if (l > 1e-6) return sign(p) * m / l;
  vec3 n = sign(p) * step(vec3(max(q.x, max(q.y, q.z))), q);
  return dot(n, n) > 0.0 ? normalize(n) : vec3(0.0, 1.0, 0.0);
}
/* the cube, sphere-traced inside its bounding sphere and before tmax; sgn -1 marches the inside; -1 when missed */
float iCube(vec3 ro, vec3 rd, float sgn, int steps, float tmax){
  vec3 oc = ro - CC;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - BB * BB;
  float h = b * b - c;
  if (h < 0.0) return -1.0;
  h = sqrt(h);
  float t1 = min(-b + h, tmax);
  if (t1 <= TMIN) return -1.0;
  float t = max(-b - h, TMIN);
  vec3 lo = uRot * oc;
  vec3 ld = uRot * rd;
  for (int i = 0; i < ${STEPS}; i++) {
    if (i >= steps) break;
    float d = sgn * sdBox(lo + ld * t);
    if (d < MEPS) return t;
    t += d;
    if (t > t1) return -1.0;
  }
  /* out of steps: a ray hugging a face from inside is let out where it is; from outside it is a miss */
  return sgn < 0.0 ? t : -1.0;
}
float iFloor(vec3 ro, vec3 rd){
  if (rd.y >= -1e-6) return -1.0;
  float t = -ro.y / rd.y;
  return t > TMIN ? t : -1.0;
}
float iLight(vec3 ro, vec3 rd){
  float dn = dot(rd, LN);
  if (dn >= 0.0) return -1.0;
  float t = dot(LC - ro, LN) / dn;
  if (t <= TMIN) return -1.0;
  vec3 q = ro + rd * t - LC;
  if (abs(dot(q, LU)) > LW * 0.5 || abs(dot(q, LV)) > LH * 0.5) return -1.0;
  return t;
}
/* the nearest of the three: 0 nothing, 1 floor, 2 cube, 3 light; inside the glass only the cube can be next */
int scene(vec3 ro, vec3 rd, bool inG, out float t){
  t = 1e9;
  if (inG) { t = iCube(ro, rd, -1.0, ${STEPS}, 1e9); return t > 0.0 ? 2 : 0; }
  int id = 0;
  float g = iFloor(ro, rd);
  if (g > 0.0) { t = g; id = 1; }
  float l = iLight(ro, rd);
  if (l > 0.0 && l < t) { t = l; id = 3; }
  float s = iCube(ro, rd, 1.0, ${STEPS}, t);
  if (s > 0.0) { t = s; id = 2; }
  return id;
}
/* next event: one point on the quad as seen from p over n, shadowed by the cube alone; the light's irradiance */
vec3 nee(vec3 p, vec3 n, vec2 u){
  vec3 q = LC + LU * ((u.x - 0.5) * LW) + LV * ((u.y - 0.5) * LH);
  vec3 w = q - p;
  float d2 = dot(w, w);
  float dl = sqrt(d2);
  w /= dl;
  float cl = -dot(w, LN);
  float cn = dot(w, n);
  if (cl <= 0.0 || cn <= 0.0) return vec3(0.0);
  if (iCube(p + n * EPS, w, 1.0, ${STEPS_SHADOW}, dl) > 0.0) return vec3(0.0);
  return uE * (cl * cn * AREA / (PI * d2));
}
/* a cosine-weighted direction about n */
vec3 cosine(vec3 n, vec2 u){
  float rr = sqrt(u.x);
  float ph = TAU * u.y;
  vec3 a = normalize(cross(abs(n.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0), n));
  vec3 b = cross(n, a);
  return a * (rr * cos(ph)) + b * (rr * sin(ph)) + n * sqrt(max(0.0, 1.0 - u.x));
}
void main(){
  st = uvec3(uvec2(gl_FragCoord.xy), uFrame);
  vec3 r0 = rnd();
  vec2 ndc = (gl_FragCoord.xy + r0.xy - 0.5) / uRes * 2.0 - 1.0 + uShift;
  vec3 d = normalize(uFwd + uRight * (ndc.x * uTan.x) + uUp * (ndc.y * uTan.y));
  float lr = sqrt(r0.z) * uAperture;
  vec3 r1 = rnd();
  float la = TAU * r1.x;
  vec3 ro = uEye + uRight * (lr * cos(la)) + uUp * (lr * sin(la));
  vec3 rd = normalize(uEye + d * (uFocus / dot(d, uFwd)) - ro);
  vec3 L = vec3(0.0);
  vec3 T = vec3(1.0);
  bool spec = false;
  bool inG = false;
  for (int b = 0; b < ${BOUNCES}; b++) {
    float t;
    int id = scene(ro, rd, inG, t);
    if (id == 0) { if (b > 0) L += T * FILL; break; }
    if (id == 3) { if (spec && b > 0) L += T * uE; break; }
    vec3 p = ro + rd * t;
    vec3 r = rnd();
    if (id == 1) {
      T *= exp(-uFog * distance(p, uEye));
      vec3 n = vec3(0.0, 1.0, 0.0);
      L += T * ALB * nee(p, n, r.xy);
      rd = cosine(n, rnd().xy);
      ro = p + n * EPS;
      T *= ALB;
      spec = false;
    } else {
      vec3 n = nBox(uRot * (p - CC)) * uRot;
      if (uMat == 0) {
        /* glass: Fresnel picks reflect or refract, Beer darkens the way through */
        if (inG) { n = -n; T *= exp(-BEER * t); }
        float eta = inG ? IOR : 1.0 / IOR;
        float ci = max(-dot(rd, n), 0.0);
        float k = 1.0 - eta * eta * (1.0 - ci * ci);
        float F = 1.0;
        float ct = 0.0;
        if (k > 0.0) {
          ct = sqrt(k);
          float m = 1.0 - (inG ? ct : ci);
          float m2 = m * m;
          F = F0 + (1.0 - F0) * m2 * m2 * m;
        }
        if (r.x < F) { rd = reflect(rd, n); ro = p + n * EPS; }
        else { rd = eta * rd + (eta * ci - ct) * n; ro = p - n * EPS; inG = !inG; }
        spec = true;
      } else if (uMat == 1) {
        /* chrome: a Schlick-tinted mirror, the reflection jittered a little */
        float m = 1.0 - max(-dot(rd, n), 0.0);
        float m2 = m * m;
        T *= CHROME + (1.0 - CHROME) * (m2 * m2 * m);
        vec3 r3 = rnd();
        rd = normalize(reflect(rd, n) + ROUGH * (r3 * 2.0 - 1.0));
        if (dot(rd, n) < 0.0) rd = reflect(rd, n);
        ro = p + n * EPS;
        spec = true;
      } else {
        /* bone: lit the way the floor is */
        T *= exp(-uFog * distance(p, uEye));
        L += T * BONE * nee(p, n, r.xy);
        rd = cosine(n, rnd().xy);
        ro = p + n * EPS;
        T *= BONE;
        spec = false;
      }
    }
    if (b >= 2) {
      float q = min(0.95, max(T.r, max(T.g, T.b)));
      if (r.z >= q) break;
      T /= q;
    }
  }
  L = min(L, vec3(${f(CLAMP)}));
  if (any(isnan(L))) L = vec3(0.0);
  vec3 prev = texelFetch(uPrev, ivec2(gl_FragCoord.xy), 0).rgb;
  o = vec4(uBlend >= 1.0 ? L : mix(prev, L, uBlend), 1.0);
}`

/* the accumulation to the screen: exposure, a soft shoulder, then lifted onto the page colour so an unlit pixel is
   the page exactly and the pane edge is seamless; one LSB of hash dither keeps the dark end from banding */
const BLIT_FS = `#version 300 es
precision highp float;
precision highp int;
out vec4 o;
uniform sampler2D uAcc;
uniform float uExposure;
uniform uint uFrame;
const vec3 INK = ${v3([lin(INK[0]), lin(INK[1]), lin(INK[2])])};
${PCG}
void main(){
  vec3 c = texelFetch(uAcc, ivec2(gl_FragCoord.xy), 0).rgb * uExposure;
  c = c / (1.0 + c);
  vec3 l = INK + c * (1.0 - INK);
  vec3 h = vec3(pcg3d(uvec3(uvec2(gl_FragCoord.xy), uFrame + 7u))) * (1.0 / 4294967296.0);
  o = vec4(pow(l, vec3(1.0 / 2.2)) + (h - 0.5) / 255.0, 1.0);
}`

export interface TracerOptions {
  /** the sample count: every eighth sample, at the cap, and on a restart */
  onSpp?(n: number): void
}

export interface TracerHandle {
  destroy(): void
}

interface Target {
  tex: WebGLTexture
  fb: WebGLFramebuffer
}

/* a press on the cube: where it began and when, where it last was and when, how far it has dragged in all */
interface Drag {
  id: number
  x0: number
  y0: number
  t0: number
  x: number
  y: number
  t: number
  dx: number
  dy: number
  far: boolean
}

function mount(host: HTMLElement, o: TracerOptions) {
  const made = createGl(host, { alpha: false })
  if (!made) return null
  const { canvas, gl } = made
  const ft = floatTarget(gl, TOUCH)
  if (!ft) {
    release(gl)
    host.removeChild(canvas)
    return null
  }
  let pTrace: WebGLProgram
  let pBlit: WebGLProgram
  try {
    pTrace = program(gl, TRACE_FS)
    pBlit = program(gl, BLIT_FS)
  } catch (e) {
    console.error("path tracer:", e)
    release(gl)
    host.removeChild(canvas)
    return null
  }
  const uT = locs(gl, pTrace, [
    "uPrev",
    "uRes",
    "uFrame",
    "uBlend",
    "uEye",
    "uRight",
    "uUp",
    "uFwd",
    "uTan",
    "uShift",
    "uFocus",
    "uAperture",
    "uE",
    "uFog",
    "uRot",
    "uMat",
  ] as const)
  const uB = locs(gl, pBlit, ["uAcc", "uExposure", "uFrame"] as const)
  const u3 = (loc: WebGLUniformLocation | null, v: V3) => gl.uniform3f(loc, v[0], v[1], v[2])
  const cap = RM ? CAP_RM : ft.bits === 32 ? CAP_32 : CAP_16

  let dead = false
  let src: Target | null = null
  let dst: Target | null = null
  let W = 0
  let H = 0
  let frame = 0
  /* samples in the accumulation; blend is 1/n while still */
  let n = 0
  let yaw = 0
  let pitch = 0
  let yawT = 0
  let pitchT = 0
  let wasMoving = false
  /* the cube: its yaw about the floor's normal and pitch about the pane's horizontal, their rates, its material
     (0 glass, 1 chrome, 2 bone), and the press on it */
  let cubeYaw = 0
  let cubePitch = 0
  let velYaw = RM ? 0 : IDLE_SPIN
  let velPitch = 0
  let mat = 0
  let drag: Drag | null = null
  /* the idle turn, fading after every touch; the cube ends at rest and the picture settles to its full count */
  let idle = RM ? 0 : IDLE_SPIN
  const rot = new Float32Array(9)
  let passes = 1
  let lid = PASSES_MAX
  let dtSum = 0
  let dtN = 0
  /* a burst of resizes: the canvas re-fits every time, the accumulation restarts once it settles */
  let settling = false
  let settleTimer: ReturnType<typeof setTimeout> | undefined
  /* stays awake past the cap while the tint may still be stepping */
  let awake = 0
  let lastTint: V3 = [-1, -1, -1]
  let shown = -1
  let lastReport = -1e9

  const mk = (w: number, h: number): Target => {
    const tex = tex2d(gl, w, h, ft.internal, gl.RGBA, ft.type, gl.NEAREST)
    try {
      return { tex, fb: fbo(gl, tex) }
    } catch (e) {
      gl.deleteTexture(tex)
      throw e
    }
  }
  const free = () => {
    for (const t of [src, dst]) {
      if (!t) continue
      gl.deleteFramebuffer(t.fb)
      gl.deleteTexture(t.tex)
    }
    src = dst = null
  }
  const alloc = (w: number, h: number) => {
    free()
    src = mk(w, h)
    dst = mk(w, h)
  }

  const report = (now: number, force: boolean) => {
    if (n === shown || (!force && now - lastReport < 100)) return
    shown = n
    lastReport = now
    o.onSpp?.(n)
  }
  const restart = (now: number) => {
    n = 0
    wasMoving = false
    report(now, true)
  }

  /* where the cube's centre sits on the pane, in css px from the canvas's top left, with the px per world unit
     there and the exposure: low in the free band right of the text (never past the pane's edge), or high right on
     a narrow pane, dimmer, under the words */
  const place = () => {
    const cw = canvas.clientWidth
    const ch = canvas.clientHeight
    const unit = (SIZE_FRAC * Math.min(cw, ch)) / 2
    const textRight = Math.min(cw, TEXT_RIGHT)
    const band = cw - textRight
    if (band >= BAND_MIN) {
      const px = Math.min(textRight + band * 0.5, cw - BOUND * unit - 28)
      return { cw, ch, unit, px, py: 0.67 * ch, expo: 1 }
    }
    return { cw, ch, unit, px: 0.78 * cw, py: 0.2 * ch, expo: 0.6 }
  }

  /* the camera for this frame: on its orbit at the distance that draws a unit SIZE_FRAC/2 of the short side, with
     the projection shifted so the cube's centre lands on its place */
  const cam = () => {
    const { cw, ch, px, py, expo } = place()
    const want: readonly [number, number] = [(2 * px) / cw - 1, 1 - (2 * py) / ch]
    const share = (SIZE_FRAC * Math.min(cw, ch)) / ch
    const q = 1 / (TAN_HALF * share)
    const d = Math.sqrt(q * q + 1)
    const el = ELEV0 + pitch
    const u: V3 = [Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)]
    const w = sub(TARGET, CENTRE)
    const uw = dot(u, w)
    const s = -uw + Math.sqrt(Math.max(0, uw * uw - dot(w, w) + d * d))
    const eye: V3 = [TARGET[0] + u[0] * s, TARGET[1] + u[1] * s, TARGET[2] + u[2] * s]
    const fwd = norm(sub(TARGET, eye))
    const right = norm(cross(fwd, [0, 1, 0]))
    const up = cross(right, fwd)
    const v = sub(CENTRE, eye)
    const cz = dot(v, fwd)
    const tx = TAN_HALF * (cw / ch)
    const ty = TAN_HALF
    return {
      eye,
      right,
      up,
      fwd,
      tx,
      ty,
      shift: [dot(v, right) / cz / tx - want[0], dot(v, up) / cz / ty - want[1]] as const,
      focus: cz,
      /* the lens opens with the square of the distance so the depth of field reads as it would from EYE0 */
      aperture: APERTURE * (d / D0) ** 2,
      fog: FOG / d,
      expo,
    }
  }

  const pointer = trackPointer({
    onMove: () => {
      if (!RM) loop.kick()
    },
  })

  /* a press counts when it lands in the cube's circle on the pane and not on one of the page's controls; the grab
     stops the spin */
  const onDown = (e: PointerEvent) => {
    if (dead || drag || e.button !== 0 || !e.isPrimary || !W) return
    if (e.target instanceof Element && e.target.closest(CONTROLS)) return
    const r = canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    const pl = place()
    const dx = e.clientX - (r.left + pl.px)
    const dy = e.clientY - (r.top + pl.py)
    if (Math.hypot(dx, dy) > pl.unit * BOUND * HIT) return
    drag = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      t0: e.timeStamp,
      x: e.clientX,
      y: e.clientY,
      t: e.timeStamp,
      dx: 0,
      dy: 0,
      far: false,
    }
    velYaw = velPitch = 0
    if (!RM) loop.kick()
  }
  /* the drag turns the cube as it goes (under RM, only on release); the rate is eased over the moves, so the fling
     is not one jittery delta */
  const onMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return
    if (e.cancelable) e.preventDefault()
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    const dts = Math.max((e.timeStamp - drag.t) / 1000, 1 / 240)
    drag.x = e.clientX
    drag.y = e.clientY
    drag.t = e.timeStamp
    drag.dx += dx
    drag.dy += dy
    if (!drag.far && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > CLICK_PX)
      drag.far = true
    if (RM) return
    cubeYaw += dx * RAD_PX
    cubePitch = clampPitch(cubePitch + dy * RAD_PX)
    velYaw += ((dx * RAD_PX) / dts - velYaw) * 0.5
    velPitch += ((dy * RAD_PX) / dts - velPitch) * 0.5
    loop.kick()
  }
  /* the release: a short, still press is a click and takes the next material; otherwise the last rate is the fling
     (none after a pause), or under RM the whole drag lands at once */
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return
    const d = drag
    drag = null
    const now = performance.now()
    /* a touch brings the slow turn back for a while */
    idle = RM ? 0 : IDLE_SPIN
    if (!d.far && e.timeStamp - d.t0 < CLICK_MS) {
      mat = (mat + 1) % 3
      velYaw = velPitch = 0
      restart(now)
      loop.kick()
      return
    }
    if (RM) {
      cubeYaw += d.dx * RAD_PX
      cubePitch = clampPitch(cubePitch + d.dy * RAD_PX)
      restart(now)
      loop.kick()
      return
    }
    if (e.timeStamp - d.t > HOLD_MS) velYaw = velPitch = 0
    loop.kick()
  }
  /* a lost pointer (the browser took the gesture, the window lost focus) ends the press with no fling and no click */
  const onCancel = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return
    drag = null
    velYaw = velPitch = 0
    if (!RM) loop.kick()
  }
  const onBlur = () => {
    if (!drag) return
    drag = null
    velYaw = velPitch = 0
    if (!RM) loop.kick()
  }
  /* while dragging, a finger does not scroll the page and the mouse does not select its text */
  const onTouchMove = (e: TouchEvent) => {
    if (drag && e.cancelable) e.preventDefault()
  }
  const onSelect = (e: Event) => {
    if (drag) e.preventDefault()
  }
  addEventListener("pointerdown", onDown)
  addEventListener("pointermove", onMove)
  addEventListener("pointerup", onUp)
  addEventListener("pointercancel", onCancel)
  addEventListener("blur", onBlur)
  addEventListener("touchmove", onTouchMove, { passive: false })
  document.addEventListener("selectstart", onSelect)
  const unlisten = () => {
    removeEventListener("pointerdown", onDown)
    removeEventListener("pointermove", onMove)
    removeEventListener("pointerup", onUp)
    removeEventListener("pointercancel", onCancel)
    removeEventListener("blur", onBlur)
    removeEventListener("touchmove", onTouchMove)
    document.removeEventListener("selectstart", onSelect)
  }

  const draw = (now: number, dt: number) => {
    if (dead || !src || !dst || !W || !H) return false
    pointer.tick(dt)
    /* the light is the page tint; a new tint is a new image */
    const tint = readTint()
    if (tint.some((c, i) => Math.abs(c - (lastTint[i] ?? -1)) > 1 / 255)) {
      lastTint = tint
      restart(now)
    }
    /* the cube's turn: the drag drives it on each move (a pause in the drag drops the rate); between, the fling
       runs down and the idle spin comes back */
    let speed = 0
    if (!RM) {
      if (drag) {
        if (now - drag.t > HOLD_MS) velYaw = velPitch = 0
      } else {
        cubeYaw = (cubeYaw + velYaw * dt) % (2 * Math.PI)
        const p = cubePitch + velPitch * dt
        cubePitch = clampPitch(p)
        if (p !== cubePitch) velPitch = 0
        const k = Math.exp(-dt * DAMP)
        velYaw = idle + (velYaw - idle) * k
        idle *= Math.exp(-dt / IDLE_FADE)
        velPitch *= k
      }
      speed = Math.hypot(velYaw, velPitch)
    }
    const turning = !RM && (!!drag || speed > STILL)
    /* a few degrees of orbit under the pointer, eased */
    let orbit = false
    if (!RM) {
      if (pointer.inside) {
        const r = canvas.getBoundingClientRect()
        if (r.width && r.height) {
          const fx = Math.max(-0.5, Math.min(0.5, (pointer.x - r.left) / r.width - 0.5))
          const fy = Math.max(-0.5, Math.min(0.5, (pointer.y - r.top) / r.height - 0.5))
          yawT = fx * YAW
          pitchT = fy * -PITCH
        }
      }
      const k = 1 - Math.exp(-dt * 6)
      const dy = (yawT - yaw) * k
      const dp = (pitchT - pitch) * k
      yaw += dy
      pitch += dp
      orbit = Math.abs(dy) + Math.abs(dp) > 1e-4
    }
    const moving = turning || orbit
    if (!moving && !settling && n >= cap) return now < awake
    /* how many samples this frame: one more each window the frames held a full rate, one fewer (and no more) when
       they did not; a 120 Hz display is held to two */
    dtSum += dt
    if (++dtN >= PASSES_WINDOW) {
      const m = dtSum / dtN
      dtSum = dtN = 0
      if (m < 0.012) lid = Math.min(lid, 2)
      if (m > 0.02) lid = passes = Math.max(1, passes - 1)
      else if (passes < lid && m <= 0.0175) passes++
    }
    /* the still image averages its samples; the moving one is an EMA weighted like a few frames' worth, so it does
       not flash when motion stops, and a fast turn keeps more of the fresh frame, so it does not ghost */
    let k = passes
    let ema = 0
    if (settling) n = 0
    else if (moving) {
      const held = 8 * passes
      if (!wasMoving) n = Math.min(n, held)
      const perFrame = Math.min(EMA_MAX, EMA * Math.max(1, speed / IDLE_SPIN))
      ema = 1 - Math.pow(1 - perFrame, 1 / passes)
      n = Math.min(n + passes, held)
    } else k = Math.max(1, Math.min(passes, cap - n))
    wasMoving = moving
    const c = cam()
    /* the cube's frame: the world taken into it, the transpose of yaw about Y then pitch about X */
    const cy = Math.cos(cubeYaw)
    const sy = Math.sin(cubeYaw)
    const cp = Math.cos(cubePitch)
    const sp = Math.sin(cubePitch)
    rot[0] = cy
    rot[1] = 0
    rot[2] = sy
    rot[3] = sp * sy
    rot[4] = cp
    rot[5] = -sp * cy
    rot[6] = -cp * sy
    rot[7] = sp
    rot[8] = cp * cy
    /* pass 1: the samples, each blended into the other texture */
    gl.viewport(0, 0, W, H)
    bindProgram(gl, pTrace)
    gl.activeTexture(gl.TEXTURE0)
    gl.uniform1i(uT.uPrev, 0)
    gl.uniform2f(uT.uRes, W, H)
    u3(uT.uEye, c.eye)
    u3(uT.uRight, c.right)
    u3(uT.uUp, c.up)
    u3(uT.uFwd, c.fwd)
    gl.uniform2f(uT.uTan, c.tx, c.ty)
    gl.uniform2f(uT.uShift, c.shift[0], c.shift[1])
    gl.uniform1f(uT.uFocus, c.focus)
    gl.uniform1f(uT.uAperture, c.aperture)
    gl.uniform3f(
      uT.uE,
      lin(lastTint[0]) * LIGHT_GAIN,
      lin(lastTint[1]) * LIGHT_GAIN,
      lin(lastTint[2]) * LIGHT_GAIN,
    )
    gl.uniform1f(uT.uFog, c.fog)
    gl.uniformMatrix3fv(uT.uRot, false, rot)
    gl.uniform1i(uT.uMat, mat)
    let from: Target = src
    let to: Target = dst
    for (let i = 0; i < k; i++) {
      let blend = ema
      if (settling || !moving) {
        n++
        blend = 1 / n
      }
      frame++
      gl.bindFramebuffer(gl.FRAMEBUFFER, to.fb)
      gl.bindTexture(gl.TEXTURE_2D, from.tex)
      gl.uniform1ui(uT.uFrame, frame)
      gl.uniform1f(uT.uBlend, blend)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      const t = from
      from = to
      to = t
    }
    src = from
    dst = to
    /* pass 2: the accumulation onto the page */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, W, H)
    bindProgram(gl, pBlit)
    gl.bindTexture(gl.TEXTURE_2D, from.tex)
    gl.uniform1i(uB.uAcc, 0)
    gl.uniform1f(uB.uExposure, EXPOSURE * c.expo)
    gl.uniform1ui(uB.uFrame, frame)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (n % 8 === 0 || n >= cap) report(now, n >= cap)
    return true
  }

  const loop = createLoop(draw, () => Infinity)

  const settle = () => {
    settling = true
    clearTimeout(settleTimer)
    settleTimer = setTimeout(() => {
      settling = false
      if (dead) return
      restart(performance.now())
      loop.kick()
    }, SETTLE_MS)
  }

  const teardown = () => {
    if (dead) return
    dead = true
    clearTimeout(settleTimer)
    loop.destroy()
    ro.disconnect()
    mo.disconnect()
    pointer.destroy()
    unlisten()
    free()
    gl.deleteProgram(pTrace)
    gl.deleteProgram(pBlit)
    release(gl)
    canvas.parentNode?.removeChild(canvas)
  }

  /* the bitmap follows the css box at a fraction of the device resolution; a new size means new accumulation
     textures, and the image restarts once the size holds for SETTLE_MS */
  const resize = () => {
    const r = fit(canvas, DPR_MAX, SCALE)
    if (!r.w) return false
    if (r.changed || !src) {
      try {
        alloc(r.w, r.h)
      } catch (e) {
        console.error("path tracer:", e)
        teardown()
        return false
      }
    }
    W = r.w
    H = r.h
    return true
  }
  const onSize = () => {
    if (resize()) {
      settle()
      loop.kick()
    }
  }
  const ro = new ResizeObserver(onSize)
  ro.observe(host)
  /* the tint is written to the root's style and then steps for half a second: wake up and watch it */
  const mo = new MutationObserver(() => {
    awake = performance.now() + AWAKE_MS
    loop.kick()
  })
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] })
  onSize()

  return { canvas, destroy: teardown }
}

/** Fills `host` with the path tracer until destroy(); null without WebGL2 or a float render target. */
export function mountTracer(host: HTMLElement, o: TracerOptions = {}): TracerHandle | null {
  if (typeof WebGL2RenderingContext === "undefined") return null
  return remountable(() => mount(host, o))
}
