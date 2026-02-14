import useMediaQuery from "./useMediaQuery"

const useIsMobile = (breakpoint = 768) => {
  const defaultValue = typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  return useMediaQuery(`(max-width: ${breakpoint}px)`, defaultValue)
}

export default useIsMobile
