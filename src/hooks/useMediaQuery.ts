import { useEffect, useState } from "react"

const getMatch = (query: string, defaultValue: boolean) => {
  if (typeof window === "undefined") return defaultValue
  return window.matchMedia(query).matches
}

const useMediaQuery = (query: string, defaultValue = false) => {
  const [matches, setMatches] = useState(() => getMatch(query, defaultValue))

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQueryList = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    setMatches(mediaQueryList.matches)

    mediaQueryList.addEventListener("change", onChange)
    return () => mediaQueryList.removeEventListener("change", onChange)
  }, [query])

  return matches
}

export default useMediaQuery
