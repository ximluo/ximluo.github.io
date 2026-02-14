export const SCRAMBLE_SETS = {
  japanese: "!@#$%^&*?<>/",
  binary: "01",
  symbols: "!<>-_\\/[]{}=+*^?#",
  matrix: "!@#$%^&*?<>/",
  code: "{([/\\])}@#$%^&*<>+=",
} as const

export type ScrambleSet = keyof typeof SCRAMBLE_SETS

export const scrambleText = (
  target: string,
  set: ScrambleSet,
  updateFn: (text: string) => void,
  steps = 15,
): Promise<string> => {
  return new Promise((resolve) => {
    let frame = 0
    const chars = SCRAMBLE_SETS[set]
    let out = Array.from(target)

    const tick = () => {
      out = out.map((_, index) =>
        frame >= steps
          ? target[index]
          : Math.random() < frame / steps
            ? target[index]
            : chars[Math.floor(Math.random() * chars.length)],
      )

      updateFn(out.join(""))

      frame += 1
      if (frame <= steps) {
        requestAnimationFrame(tick)
      } else {
        resolve(target)
      }
    }

    tick()
  })
}
