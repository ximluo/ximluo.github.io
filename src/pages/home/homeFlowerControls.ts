import type { FlowerSceneControls } from "../about/FlowerScene"

type HomeFlowerViewportPreset =
  | "narrowVeryShort"
  | "narrowShort"
  | "narrowTall"
  | "halfShort"
  | "halfTall"
  | "mediumShort"
  | "mediumTall"
  | "fullShort"
  | "fullTall"
  | "wideShort"
  | "wideTall"
  | "veryWideShort"
  | "veryWideTall"

export type ResponsiveFlowerControls = {
  opacity: number
  panelLeft: string
  panelWidth: string
  dpr: [number, number]
  focusScale: number
  transform: FlowerSceneControls
}

const BASE_HOME_FLOWER_MODEL_CONTROLS: ResponsiveFlowerControls = {
  opacity: 1,
  panelLeft: "40%",
  panelWidth: "60%",
  dpr: [1, 1.5],
  focusScale: 1,
  transform: {
    modelRotation: [1, 0, 0],
    modelScale: 1,
    modelPosition: [0, -1, 0],
    cameraFit: 1.08,
    cameraVerticalPan: 7.6,
    cameraHorizontalPan: 5,
    ambientLightIntensity: 1.75,
    directionalLightIntensity: 1.35,
    directionalLightPosition: [4, 10, 6],
  },
}

const HOME_FLOWER_CAMERA_PRESETS: Record<
  HomeFlowerViewportPreset,
  {
    cameraVerticalPan: number
    cameraHorizontalPan: number
    cameraFit: number
    focusScale: number
  }
> = {
  narrowVeryShort: {
    cameraVerticalPan: 2.5,
    cameraHorizontalPan: 1.6,
    cameraFit: 0.92,
    focusScale: 0.36,
  },
  narrowShort: {
    cameraVerticalPan: 2.8,
    cameraHorizontalPan: 3,
    cameraFit: 0.96,
    focusScale: 0.44,
  },
  narrowTall: {
    cameraVerticalPan: 3.6,
    cameraHorizontalPan: 4.2,
    cameraFit: 0.98,
    focusScale: 0.52,
  },
  halfShort: {
    cameraVerticalPan: 3.8,
    cameraHorizontalPan: 2.8,
    cameraFit: 1,
    focusScale: 0.56,
  },
  halfTall: {
    cameraVerticalPan: 4.7,
    cameraHorizontalPan: 4.5,
    cameraFit: 1.02,
    focusScale: 0.66,
  },
  mediumShort: {
    cameraVerticalPan: 5.2,
    cameraHorizontalPan: 4.2,
    cameraFit: 1.03,
    focusScale: 0.76,
  },
  mediumTall: {
    cameraVerticalPan: 6.5,
    cameraHorizontalPan: 5.6,
    cameraFit: 1.05,
    focusScale: 0.88,
  },
  fullShort: {
    cameraVerticalPan: 6.3,
    cameraHorizontalPan: 5,
    cameraFit: 1.06,
    focusScale: 0.9,
  },
  fullTall: {
    cameraVerticalPan: 7.6,
    cameraHorizontalPan: 5.6,
    cameraFit: 1.08,
    focusScale: 1,
  },
  wideShort: {
    cameraVerticalPan: 6.4,
    cameraHorizontalPan: 4,
    cameraFit: 1.04,
    focusScale: 0.92,
  },
  wideTall: {
    cameraVerticalPan: 7.3,
    cameraHorizontalPan: 4.8,
    cameraFit: 1.08,
    focusScale: 1,
  },
  veryWideShort: {
    cameraVerticalPan: 4.8,
    cameraHorizontalPan: 2.4,
    cameraFit: 0.96,
    focusScale: 0.82,
  },
  veryWideTall: {
    cameraVerticalPan: 5.6,
    cameraHorizontalPan: 2.7,
    cameraFit: 0.98,
    focusScale: 0.9,
  },
}

export function getHomeFlowerViewportPreset(
  windowWidth: number,
  windowHeight: number,
): HomeFlowerViewportPreset {
  const aspectRatio = windowHeight > 0 ? windowWidth / windowHeight : 1
  const isVeryShort = windowHeight <= 620
  const isShort = windowHeight <= 760

  if (windowWidth >= 1800 || aspectRatio >= 2.25) {
    return isShort ? "veryWideShort" : "veryWideTall"
  }
  if (windowWidth >= 1440 || aspectRatio >= 1.85) {
    return isShort ? "wideShort" : "wideTall"
  }
  if (windowWidth <= 920) {
    if (isVeryShort) return "narrowVeryShort"
    return isShort ? "narrowShort" : "narrowTall"
  }
  if (windowWidth <= 1120) {
    return isShort ? "halfShort" : "halfTall"
  }
  if (windowWidth <= 1280) {
    return isShort ? "mediumShort" : "mediumTall"
  }
  return isShort ? "fullShort" : "fullTall"
}

export function getHomeFlowerControls(
  windowWidth: number,
  windowHeight: number,
): ResponsiveFlowerControls {
  const preset = HOME_FLOWER_CAMERA_PRESETS[getHomeFlowerViewportPreset(windowWidth, windowHeight)]

  return {
    ...BASE_HOME_FLOWER_MODEL_CONTROLS,
    focusScale: preset.focusScale,
    transform: {
      ...BASE_HOME_FLOWER_MODEL_CONTROLS.transform,
      cameraFit: preset.cameraFit,
      cameraVerticalPan: preset.cameraVerticalPan,
      cameraHorizontalPan: preset.cameraHorizontalPan,
    },
  }
}
