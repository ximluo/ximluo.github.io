import { useCallback, useEffect, useRef, useState } from "react"

const CARROT_COUNT_STORAGE_KEY = "bunny-carrot-count"

const parseStoredCarrotCount = (value: string | null) => {
  if (value === null) return 0
  const parsed = parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 0) return 0
  return parsed
}

const useCarrotStorage = () => {
  const [carrotCount, setCarrotCount] = useState(() => {
    if (typeof window === "undefined") return 0
    return parseStoredCarrotCount(window.sessionStorage.getItem(CARROT_COUNT_STORAGE_KEY))
  })
  const skipNextWriteRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CARROT_COUNT_STORAGE_KEY) return
      const next = parseStoredCarrotCount(event.newValue)

      setCarrotCount((prev) => {
        if (prev === next) return prev
        skipNextWriteRef.current = true
        return next
      })
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false
      return
    }

    window.sessionStorage.setItem(CARROT_COUNT_STORAGE_KEY, carrotCount.toString())
  }, [carrotCount])

  const incrementCarrotCount = useCallback(() => {
    setCarrotCount((prev) => prev + 1)
  }, [])

  return {
    carrotCount,
    incrementCarrotCount,
  }
}

export default useCarrotStorage
