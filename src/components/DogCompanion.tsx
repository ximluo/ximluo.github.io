import { useEffect, useRef } from "react"
import "./DogCompanion.css"

const DOG_WIDTH = 96
const DOG_CENTER_OFFSET = DOG_WIDTH / 2
const DOG_VISUAL_SCALE = 0.6
const NOSE_LOCAL_OFFSET = 60
const MOVE_DELAY_MS = 300
const MOVE_DISTANCE = 20
const MOVE_INTERVAL_MS = 120
const EDGE_BUFFER = 12
const FOOTER_OBSTACLE_BUFFER = 14
const FOOTER_OBSTACLE_SELECTOR =
  ".footer-controls--floating .footer-icon-button, .footer-controls--inline .footer-icon-button"
// Taps/clicks on interactive elements shouldn't redirect the dog
const INTERACTIVE_TARGET_SELECTOR =
  'a, button, input, textarea, select, iframe, [role="button"], [role="dialog"]'

const BODY_FRAME_WIDTH = 96
const HEAD_FRAME_WIDTH = 62
const POINTER_MOVE_THRESHOLD = 150

type DirectionKey =
  | "up"
  | "upright"
  | "right"
  | "downright"
  | "down"
  | "downleft"
  | "left"
  | "upleft"

const IDLE_DIRECTION: DirectionKey = "down"
type HorizontalDirection = "left" | "right"

const DIRECTION_FRAMES: Record<
  DirectionKey,
  { partIndex: number; spriteFrame: number; flip: boolean }
> = {
  up: { partIndex: 0, spriteFrame: 0, flip: false },
  upright: { partIndex: 1, spriteFrame: 1, flip: false },
  right: { partIndex: 2, spriteFrame: 2, flip: false },
  downright: { partIndex: 3, spriteFrame: 3, flip: false },
  down: { partIndex: 4, spriteFrame: 5, flip: false },
  downleft: { partIndex: 5, spriteFrame: 3, flip: true },
  left: { partIndex: 6, spriteFrame: 2, flip: true },
  upleft: { partIndex: 7, spriteFrame: 1, flip: true },
}

const PART_POSITIONS = [
  {
    legs: [
      { x: 26, y: 43 },
      { x: 54, y: 43 },
      { x: 26, y: 75 },
      { x: 54, y: 75 },
    ],
    tail: { x: 40, y: 70, z: 1 },
  },
  {
    legs: [
      { x: 33, y: 56 },
      { x: 55, y: 56 },
      { x: 12, y: 72 },
      { x: 32, y: 74 },
    ],
    tail: { x: 20, y: 64, z: 1 },
  },
  {
    legs: [
      { x: 59, y: 62 },
      { x: 44, y: 60 },
      { x: 25, y: 64 },
      { x: 11, y: 61 },
    ],
    tail: { x: 4, y: 44, z: 1 },
  },
  {
    legs: [
      { x: 39, y: 63 },
      { x: 60, y: 56 },
      { x: 12, y: 52 },
      { x: 28, y: 50 },
    ],
    tail: { x: 7, y: 21, z: 0 },
  },
  {
    legs: [
      { x: 23, y: 54 },
      { x: 56, y: 54 },
      { x: 24, y: 25 },
      { x: 54, y: 25 },
    ],
    tail: { x: 38, y: 2, z: 0 },
  },
  {
    legs: [
      { x: 21, y: 58 },
      { x: 41, y: 64 },
      { x: 53, y: 50 },
      { x: 69, y: 53 },
    ],
    tail: { x: 72, y: 22, z: 0 },
  },
  {
    legs: [
      { x: 22, y: 59 },
      { x: 30, y: 64 },
      { x: 56, y: 60 },
      { x: 68, y: 62 },
    ],
    tail: { x: 78, y: 40, z: 0 },
  },
  {
    legs: [
      { x: 47, y: 45 },
      { x: 24, y: 53 },
      { x: 68, y: 68 },
      { x: 47, y: 73 },
    ],
    tail: { x: 65, y: 65, z: 1 },
  },
] as const

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const px = (value: number) => `${Math.round(value)}px`

const getDirection = (
  dogCenterX: number,
  dogCenterY: number,
  pointerX: number,
  pointerY: number,
) => {
  const dx = pointerX - dogCenterX
  const dy = pointerY - dogCenterY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (absDx < 20) return dy < 0 ? "up" : "down"
  if (absDy < 28) return dx > 0 ? "right" : "left"
  if (dx > 0) return dy < 0 ? "upright" : "downright"
  return dy < 0 ? "upleft" : "downleft"
}

const DogCompanion = () => {
  const dogRef = useRef<HTMLDivElement | null>(null)
  const bodyWrapperRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const headWrapperRef = useRef<HTMLDivElement | null>(null)
  const headRef = useRef<HTMLDivElement | null>(null)
  const legWrapperRefs = useRef<Array<HTMLDivElement | null>>([])
  const tailWrapperRef = useRef<HTMLDivElement | null>(null)
  const tailRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const dog = dogRef.current
    const body = bodyRef.current
    const bodyWrapper = bodyWrapperRef.current
    const head = headRef.current
    const headWrapper = headWrapperRef.current
    const tailWrapper = tailWrapperRef.current
    const tail = tailRef.current
    const track = dog?.parentElement

    if (
      !dog ||
      !track ||
      !body ||
      !bodyWrapper ||
      !head ||
      !headWrapper ||
      !tailWrapper ||
      !tail
    ) {
      return
    }

    const getTrackRect = () => track.getBoundingClientRect()
    const initialTrackRect = getTrackRect()
    const initialVisualWidth = DOG_WIDTH * DOG_VISUAL_SCALE
    let currentX = clamp(
      initialTrackRect.width / 2 - DOG_CENTER_OFFSET,
      EDGE_BUFFER - DOG_CENTER_OFFSET + initialVisualWidth / 2,
      initialTrackRect.width - EDGE_BUFFER - DOG_CENTER_OFFSET - initialVisualWidth / 2,
    )
    let targetX = currentX
    let pointerX = initialTrackRect.left + currentX + DOG_CENTER_OFFSET
    let pointerY = initialTrackRect.top + initialTrackRect.height / 2
    let moveTimer = 0
    let frameId = 0
    let rafActive = false
    let activePartIndex = -1
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    let isWalking = false
    let walkDirection: DirectionKey | null = null
    let lookDirection: DirectionKey | null = null
    let lastGuideSide: HorizontalDirection | null = null
    let isWaitingToMove = false
    let lastMoveAt = 0

    const getMovementBounds = () => {
      const trackRect = getTrackRect()
      const dogRect = dog.getBoundingClientRect()
      const visualWidth = dogRect.width || DOG_WIDTH * DOG_VISUAL_SCALE
      let minX = EDGE_BUFFER - DOG_CENTER_OFFSET + visualWidth / 2
      let maxX = trackRect.width - EDGE_BUFFER - DOG_CENTER_OFFSET - visualWidth / 2

      document.querySelectorAll<HTMLElement>(FOOTER_OBSTACLE_SELECTOR).forEach((obstacle) => {
        const obstacleRect = obstacle.getBoundingClientRect()
        if (obstacleRect.width <= 0 || obstacleRect.height <= 0) return
        if (
          obstacleRect.bottom < dogRect.top - FOOTER_OBSTACLE_BUFFER ||
          obstacleRect.top > dogRect.bottom + FOOTER_OBSTACLE_BUFFER
        ) {
          return
        }

        const obstacleLeft = obstacleRect.left - trackRect.left
        const obstacleRight = obstacleRect.right - trackRect.left
        const obstacleMidpoint = (obstacleLeft + obstacleRight) / 2

        if (obstacleMidpoint < trackRect.width / 2) {
          minX = Math.max(
            minX,
            obstacleRight + FOOTER_OBSTACLE_BUFFER - DOG_CENTER_OFFSET + visualWidth / 2,
          )
        } else {
          maxX = Math.min(
            maxX,
            obstacleLeft - FOOTER_OBSTACLE_BUFFER - DOG_CENTER_OFFSET - visualWidth / 2,
          )
        }
      })

      if (minX > maxX) {
        const fallbackX = clamp(
          trackRect.width / 2 - DOG_CENTER_OFFSET,
          EDGE_BUFFER,
          trackRect.width,
        )
        return { minX: fallbackX, maxX: fallbackX }
      }

      return { minX, maxX }
    }

    const getClampedTargetX = (noseSide: HorizontalDirection) => {
      const trackRect = getTrackRect()
      const bounds = getMovementBounds()
      const noseOffset =
        (noseSide === "right" ? NOSE_LOCAL_OFFSET : -NOSE_LOCAL_OFFSET) * DOG_VISUAL_SCALE
      return clamp(
        pointerX - trackRect.left - DOG_CENTER_OFFSET - noseOffset,
        bounds.minX,
        bounds.maxX,
      )
    }

    const setDogX = (x: number) => {
      dog.style.setProperty("--dog-x", px(x))
    }

    const setWalking = (nextWalking: boolean) => {
      if (nextWalking === isWalking) return
      isWalking = nextWalking
      dog.classList.toggle("is-walking", isWalking)
    }

    const getPointerDirection = () => {
      const rect = dog.getBoundingClientRect()
      return getDirection(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        pointerX,
        pointerY,
      )
    }

    const getPointerSide = (): HorizontalDirection => {
      const rect = dog.getBoundingClientRect()
      return pointerX >= rect.left + rect.width / 2 ? "right" : "left"
    }

    const getGuidedDiagonalDirection = (): DirectionKey => {
      const rect = dog.getBoundingClientRect()
      const side = lastGuideSide ?? getPointerSide()
      const vertical = pointerY < rect.top + rect.height / 2 ? "up" : "down"

      if (side === "right") return vertical === "up" ? "upright" : "downright"
      return vertical === "up" ? "upleft" : "downleft"
    }

    const applyDirection = () => {
      const direction = walkDirection ?? lookDirection ?? IDLE_DIRECTION
      const frame = DIRECTION_FRAMES[direction]

      body.style.backgroundPositionX = px(-frame.spriteFrame * BODY_FRAME_WIDTH)
      head.style.backgroundPositionX = px(-frame.spriteFrame * HEAD_FRAME_WIDTH)
      bodyWrapper.classList.toggle("dog-companion-flip", frame.flip)
      headWrapper.classList.toggle("dog-companion-flip", frame.flip)
      tail.classList.toggle("dog-companion-tail--flipped", frame.flip)

      if (activePartIndex === frame.partIndex) return
      activePartIndex = frame.partIndex

      PART_POSITIONS[frame.partIndex].legs.forEach((position, index) => {
        const legWrapper = legWrapperRefs.current[index]
        if (!legWrapper) return
        legWrapper.style.transform = `translate(${px(position.x)}, ${px(position.y)})`
      })

      const tailPosition = PART_POSITIONS[frame.partIndex].tail
      tailWrapper.style.transform = `translate(${px(tailPosition.x)}, ${px(tailPosition.y)})`
      tailWrapper.style.zIndex = String(tailPosition.z)
    }

    const scheduleMove = () => {
      window.clearTimeout(moveTimer)
      isWaitingToMove = true
      moveTimer = window.setTimeout(() => {
        isWaitingToMove = false
        const targetSide = getPointerSide()
        const nextTargetX = getClampedTargetX(targetSide)
        const delta = nextTargetX - currentX
        targetX = nextTargetX
        if (Math.abs(delta) > 0.5 && reducedMotion) {
          currentX = nextTargetX
          setDogX(currentX)
          lastGuideSide = delta > 0 ? "right" : "left"
          walkDirection = null
          lookDirection = getPointerDirection()
        } else if (Math.abs(delta) > 0.5) {
          lastGuideSide = delta > 0 ? "right" : "left"
          walkDirection = lastGuideSide
          lookDirection = null
          setWalking(true)
          startLoop()
        } else {
          lastGuideSide = targetSide
          walkDirection = null
          lookDirection = getGuidedDiagonalDirection()
        }
        applyDirection()
      }, MOVE_DELAY_MS)
    }

    let lastPointerX = pointerX
    let lastPointerY = pointerY

    const updatePointer = (event: PointerEvent) => {
      if (
        event.type === "pointerdown" &&
        event.target instanceof Element &&
        event.target.closest(INTERACTIVE_TARGET_SELECTOR)
      ) {
        return
      }
      const dx = event.clientX - lastPointerX
      const dy = event.clientY - lastPointerY
      const movedDistance = Math.sqrt(dx * dx + dy * dy)
      const shouldScheduleMove =
        movedDistance >= POINTER_MOVE_THRESHOLD || event.type === "pointerdown"

      pointerX = event.clientX
      pointerY = event.clientY
      lastGuideSide = getPointerSide()

      if (!shouldScheduleMove) {
        if (!isWalking && Math.abs(targetX - currentX) <= 0.5 && !isWaitingToMove) {
          walkDirection = null
          lookDirection = getPointerDirection()
          applyDirection()
        }
        return
      }

      lastPointerX = event.clientX
      lastPointerY = event.clientY
      window.clearTimeout(moveTimer)
      isWaitingToMove = false
      lastMoveAt = 0
      targetX = currentX
      walkDirection = null
      lookDirection = getPointerDirection()
      setWalking(false)
      setDogX(currentX)
      applyDirection()
      scheduleMove()
    }

    const updateResize = () => {
      const bounds = getMovementBounds()
      currentX = clamp(currentX, bounds.minX, bounds.maxX)
      targetX = clamp(targetX, bounds.minX, bounds.maxX)
      setDogX(currentX)
      applyDirection()
      if (Math.abs(targetX - currentX) > 0.5) startLoop()
    }

    // The loop only runs while the dog has somewhere to go; it parks itself
    // on arrival and is restarted by scheduleMove/updateResize.
    const tick = (timestamp: number) => {
      const delta = targetX - currentX
      if (Math.abs(delta) > 0.5) {
        if (lastMoveAt === 0 || timestamp - lastMoveAt >= MOVE_INTERVAL_MS) {
          currentX += (delta > 0 ? 1 : -1) * Math.min(Math.abs(delta), MOVE_DISTANCE)
          lastMoveAt = timestamp
          setDogX(currentX)
          setWalking(true)
        }
        applyDirection()
        frameId = window.requestAnimationFrame(tick)
        return
      }

      currentX = targetX
      lastMoveAt = 0
      setDogX(currentX)
      setWalking(false)
      if (!isWaitingToMove) {
        walkDirection = null
        lookDirection = getPointerDirection()
      }
      applyDirection()
      rafActive = false
    }

    function startLoop() {
      if (rafActive) return
      rafActive = true
      lastMoveAt = 0
      frameId = window.requestAnimationFrame(tick)
    }

    setDogX(currentX)
    applyDirection()

    window.addEventListener("pointermove", updatePointer, { passive: true })
    window.addEventListener("pointerdown", updatePointer, { passive: true })
    window.addEventListener("resize", updateResize)

    return () => {
      window.clearTimeout(moveTimer)
      window.cancelAnimationFrame(frameId)
      window.removeEventListener("pointermove", updatePointer)
      window.removeEventListener("pointerdown", updatePointer)
      window.removeEventListener("resize", updateResize)
    }
  }, [])

  return (
    <div className="dog-companion" aria-hidden="true">
      <div ref={dogRef} className="dog-companion-dog">
        <div ref={bodyWrapperRef} className="dog-companion-body-wrapper">
          <div ref={bodyRef} className="dog-companion-body dog-companion-img" />
        </div>
        <div ref={headWrapperRef} className="dog-companion-head-wrapper">
          <div ref={headRef} className="dog-companion-head dog-companion-img" />
        </div>
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            ref={(node) => {
              legWrapperRefs.current[index] = node
            }}
            className="dog-companion-leg-wrapper"
          >
            <div className={`dog-companion-leg dog-companion-leg-${index + 1} dog-companion-img`} />
          </div>
        ))}
        <div ref={tailWrapperRef} className="dog-companion-tail-wrapper">
          <div ref={tailRef} className="dog-companion-tail dog-companion-img" />
        </div>
      </div>
    </div>
  )
}

export default DogCompanion
