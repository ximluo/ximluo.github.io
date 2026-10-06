/* The opening leader. Deep links and return visits render it hidden from the first frame; film/leader.ts animates it. */
import { useDomRef, useReel } from "../reel/context"

export function Leader() {
  const { route } = useReel()
  return (
    <div
      id="leader"
      ref={useDomRef("leader")}
      hidden={route.noIntro}
      data-tint={route.tintGrey ? "grey" : undefined}
    >
      <svg className="ld-defs" aria-hidden="true" width="0" height="0">
        <filter
          id="ld-noise"
          x="-6%"
          y="-6%"
          width="112%"
          height="112%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -8 5.7"
            result="holes"
          />
          <feTurbulence type="turbulence" baseFrequency=".018" numOctaves="1" seed="2" result="w" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="w"
            scale="2.4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="d"
          />
          <feComposite in="d" in2="holes" operator="in" />
        </filter>
      </svg>
      <div className="ld-film" aria-hidden="true"></div>
      <div className="ld-count">
        <div className="ld-cross"></div>
        <h1 className="ld-name">
          <span>Ximing</span> <span>Luo</span>
        </h1>
        <div className="ld-ring">
          <i className="ld-ticks"></i>
          <div className="ld-sweep"></div>
          <span id="ldn">3</span>
        </div>
        <button className="ld-enter mono" id="ld-enter" data-hot="">
          <span className="pt"></span>
          <span id="ld-enter-t">Click to skip</span>
        </button>
      </div>
    </div>
  )
}
