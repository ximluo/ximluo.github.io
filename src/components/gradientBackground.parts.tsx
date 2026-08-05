import type React from "react"

interface GradientCirclesProps {
  useSafariMode: boolean
  isMobileOrTablet: boolean
  showInteractiveBubble: boolean
  interBubbleRef: React.RefObject<HTMLDivElement | null>
  opacityScale?: number
}

export const GradientCircles = ({
  useSafariMode,
  isMobileOrTablet,
  showInteractiveBubble,
  interBubbleRef,
  opacityScale = 1,
}: GradientCirclesProps) => {
  const glowScale = opacityScale * (useSafariMode ? 1 : 0.72)
  const circle = (
    className: string,
    varName: "--color1" | "--color2" | "--color3" | "--color4" | "--color5",
    extra: React.CSSProperties,
  ) => (
    <div
      className={className}
      style={{
        position: "absolute",
        width: "var(--circle-size)",
        height: "var(--circle-size)",
        background: `radial-gradient(circle at center, rgba(var(${varName}),${0.6 * glowScale}) 0%, rgba(var(${varName}),0) 50%) no-repeat`,
        mixBlendMode: "normal",
        filter: useSafariMode ? "blur(40px)" : "none",
        ...extra,
      }}
    />
  )

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        filter: useSafariMode ? "none" : "url(#goo) blur(40px) brightness(0.86)",
        zIndex: 1,
      }}
    >
      {circle("g1", "--color1", {
        top: "calc(90% - var(--circle-size)/2)",
        left: "calc(90% - var(--circle-size)/2)",
        transformOrigin: "center",
        animation: "moveVertical 30s ease infinite",
        opacity: 0.5 * glowScale,
      })}
      {circle("g2", "--color2", {
        top: "calc(50% - var(--circle-size)/2)",
        left: "calc(50% - var(--circle-size)/2)",
        transformOrigin: "calc(50% - 400px)",
        animation: "moveInCircle 20s reverse infinite",
        opacity: 0.5 * glowScale,
      })}
      {circle("g3", "--color3", {
        top: "calc(50% - var(--circle-size)/2 + 200px)",
        left: "calc(50% - var(--circle-size)/2 - 500px)",
        transformOrigin: "calc(50% + 400px)",
        animation: "moveInCircle 40s linear infinite",
        opacity: 0.5 * glowScale,
      })}
      {circle("g4", "--color4", {
        top: "calc(50% - var(--circle-size)/2)",
        left: "calc(50% - var(--circle-size)/2)",
        transformOrigin: "calc(50% - 200px)",
        animation: "moveHorizontal 40s ease infinite",
        opacity: 0.5 * glowScale,
      })}
      {circle("g5", "--color5", {
        width: "calc(var(--circle-size) * 2)",
        height: "calc(var(--circle-size) * 2)",
        top: "calc(50% - var(--circle-size))",
        left: "calc(50% - var(--circle-size))",
        transformOrigin: "calc(50% - 800px) calc(50% + 200px)",
        animation: "moveInCircle 20s ease infinite",
        opacity: 0.5 * glowScale,
      })}

      {showInteractiveBubble && !isMobileOrTablet && (
        <div
          ref={interBubbleRef}
          style={{
            position: "absolute",
            background:
              `radial-gradient(circle at center, rgba(var(--color-interactive),${0.5 * glowScale}) 0%, rgba(var(--color-interactive),0) 50%)`,
            mixBlendMode: "normal",
            width: "140%",
            height: "140%",
            top: "-70%",
            left: "-70%",
            opacity: 0.6 * glowScale,
            filter: useSafariMode ? "blur(40px)" : "none",
          }}
        />
      )}
    </div>
  )
}

interface GradientRightEdgeOverlayProps {
  headerOffset: number
}

interface GradientDrawingSvgProps {
  className?: string
  style?: React.CSSProperties
}

export const GradientDrawingSvg = ({
  className = "gbg-svg",
  style,
}: GradientDrawingSvgProps) => (
  <svg
    className={className}
    version="1.1"
    viewBox="0 0 123 246"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <title>Path</title>
    <desc>Animated stroke path</desc>
    <g fill="none" fillRule="evenodd">
      <path
        className="gbg-path"
        d="m9.9062 245.43c13.174-137.4 46.685-178.94 100.53-124.63-28.198 6.2083-45.074-1.5234-50.629-23.195s-25.401-29.307-59.539-22.906c36.723 27.034 64.646 16.445 83.77-31.766 28.686-72.316-34.465-37.046 0 0 50.863 54.672 50.863 0 0 0-83.77 0-24.23-35.594 0 0 24.23 35.594-19.03 74.584 0 0 18.324-71.816 49.922 7 0 0-54.872-7.6942-24.23 48.168 0 0"
        fill="none"
      />
    </g>
  </svg>
)

export const GradientRightEdgeOverlay = ({ headerOffset }: GradientRightEdgeOverlayProps) => {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: `${headerOffset}px`,
        right: 0,
        bottom: 0,
        width: "min(420px, 28vw)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        pointerEvents: "none",
        zIndex: 5,
        paddingRight: 8,
        opacity: 1,
      }}
    >
      <GradientDrawingSvg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100vh",
          width: "auto",
        }}
      />
    </div>
  )
}
