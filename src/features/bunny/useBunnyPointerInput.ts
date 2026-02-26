import { useEffect, type MutableRefObject } from "react"
import * as THREE from "three"

interface BunnyPointerInputOptions {
  mouseRef: MutableRefObject<THREE.Vector2>
  rabbitRef: MutableRefObject<THREE.Group | null>
  isJumping: boolean
  onJump: () => void
}

export const useBunnyPointerInput = ({
  mouseRef,
  rabbitRef,
  isJumping,
  onJump,
}: BunnyPointerInputOptions) => {
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      event.preventDefault()
      mouseRef.current.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1
    }

    const handlePress = () => {
      if (rabbitRef.current && !isJumping) {
        onJump()
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("mousedown", handlePress)
    window.addEventListener("touchstart", handlePress)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("mousedown", handlePress)
      window.removeEventListener("touchstart", handlePress)
    }
  }, [isJumping, mouseRef, onJump, rabbitRef])
}
