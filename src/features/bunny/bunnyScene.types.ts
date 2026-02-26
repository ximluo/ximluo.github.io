export interface BunnySceneColors {
  floor: string
  fog: string
  bunnyPrimary: string
  bunnySecondary: string
  carrotBody: string
  carrotLeaf: string
  outline: string
}

export interface BunnySceneProps {
  colors: BunnySceneColors
  onCarrotCollected: () => void
  isMobile: boolean
}
