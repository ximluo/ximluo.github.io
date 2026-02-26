export type ThemeType = "bunny" | "water"

const BASE_THEME_TOKENS = {
  bunny: {
    "--color-text": "rgb(121, 85, 189)",
    "--color-text-secondary": "rgba(249, 240, 251, 1)",
    "--color-accent-primary": "rgba(223, 30, 155, 1)",
    "--button-bg": "rgba(223, 30, 155, 0.8)",
    "--button-bg-light": "rgba(223, 30, 155, 0.2)",
    "--button-text": "rgba(249, 240, 251, 1)",
    "--border-color": "rgb(152, 128, 220)",
  },
  water: {
    "--color-text": "rgb(191, 229, 249)",
    "--color-text-secondary": "rgba(249, 240, 251, 1)",
    "--color-accent-primary": "rgb(134, 196, 240)",
    "--button-bg": "rgba(214, 235, 251, 0.8)",
    "--button-bg-light": "rgba(214, 220, 251, 0.2)",
    "--button-text": "rgb(46, 80, 192)",
    "--border-color": "rgba(8, 34, 163, 1)",
  },
} as const

const CONTENT_THEME_KEYS = [
  "--color-text",
  "--color-text-secondary",
  "--color-accent-primary",
  "--button-bg",
  "--button-bg-light",
  "--button-text",
  "--border-color",
] as const

const HOME_THEME_KEYS = [
  "--color-text",
  "--color-accent-primary",
  "--button-bg",
  "--button-bg-light",
] as const

const FOOTER_THEME_KEYS = [
  "--color-text",
  "--color-accent-primary",
  "--button-bg-light",
  "--button-bg",
] as const

export const THEME_VISUAL_TOKENS = {
  bunny: {
    navGlowActive: "0 0 15px rgba(223, 30, 155, 0.4)",
    navGlowHover: "0 0 20px rgba(223, 30, 155, 0.6)",
    iconGlowSoft: "0 0 15px rgba(223, 30, 155, 0.3)",
    textGlowStrong: "0 0 10px rgba(223, 30, 155, 0.8)",
    buttonGlow: "0 0 15px rgba(223, 30, 155, 0.4)",
    buttonGlowHover: "0 0 20px rgba(223, 30, 155, 0.6)",
    surfaceCreativeModal: "rgba(121, 85, 189, 0.2)",
    surfaceCreativeCard: "rgba(121, 85, 189, 0.1)",
    surfacePortfolioCard: "rgba(121, 85, 189, 0.1)",
    surfaceProjectEmbed: "rgba(121, 85, 189, 0.08)",
    surfaceProjectOverview: "rgba(121, 85, 189, 0.1)",
    surfaceAwardsModal: "rgba(121, 85, 189, 0.4)",
    surfaceAwardsItem: "rgba(121, 85, 189, 0.2)",
    projectEmbedSkeletonGradient:
      "linear-gradient(120deg, rgba(121, 85, 189, 0.06), rgba(121, 85, 189, 0.14), rgba(121, 85, 189, 0.06))",
    asciiGlow: "rgba(223, 30, 155, 0.5)",
    asciiBorder: "rgba(223, 30, 155, 1)",
    asciiText: "rgba(223, 30, 155, 1)",
    homeBubbleBase: "rgba(255, 255, 255, 0.18)",
    homeBubbleHover: "rgba(255, 255, 255, 0.28)",
    homeBubbleBorder: "rgba(255, 255, 255, 0.55)",
    homeBubbleGlow: "rgba(223, 30, 155, 0.35)",
  },
  water: {
    navGlowActive: "0 0 15px rgba(134, 196, 240, 0.4)",
    navGlowHover: "0 0 20px rgba(134, 196, 240, 0.6)",
    iconGlowSoft: "0 0 15px rgba(134, 196, 240, 0.3)",
    textGlowStrong: "0 0 10px rgba(134, 196, 240, 0.8)",
    buttonGlow: "0 0 15px rgba(134, 196, 240, 0.4)",
    buttonGlowHover: "0 0 20px rgba(134, 196, 240, 0.6)",
    surfaceCreativeModal: "rgba(8, 34, 163, 0.2)",
    surfaceCreativeCard: "rgba(8, 34, 163, 0.1)",
    surfacePortfolioCard: "rgba(8, 34, 163, 0.25)",
    surfaceProjectEmbed: "rgba(8, 34, 163, 0.08)",
    surfaceProjectOverview: "rgba(8, 34, 163, 0.1)",
    surfaceAwardsModal: "rgba(8, 34, 163, 0.2)",
    surfaceAwardsItem: "rgba(8, 34, 163, 0.1)",
    projectEmbedSkeletonGradient:
      "linear-gradient(120deg, rgba(8, 34, 163, 0.05), rgba(8, 34, 163, 0.12), rgba(8, 34, 163, 0.05))",
    asciiGlow: "rgba(134, 196, 240, 0.5)",
    asciiBorder: "rgb(134, 196, 240)",
    asciiText: "rgb(134, 196, 240)",
    homeBubbleBase: "rgba(10, 40, 90, 0.28)",
    homeBubbleHover: "rgba(20, 70, 130, 0.35)",
    homeBubbleBorder: "rgba(255, 255, 255, 0.35)",
    homeBubbleGlow: "rgba(134, 196, 240, 0.3)",
  },
} as const

export const GRADIENT_BACKGROUND_THEME_VARS = {
  bunny: {
    "--color-bg1": "#ebdbff",
    "--color-bg2": "#ffffff",
    "--color1": "249,240,251",
    "--color2": "249,240,251",
    "--color3": "226,199,213",
    "--color4": "227, 89, 195",
    "--color5": "249,240,251",
    "--color-interactive": "227, 89, 195",
    "--circle-size": "90%",
    "--blending": "screen",
  },
  water: {
    "--color-bg1": "#001f3f",
    "--color-bg2": "#001f3f",
    "--color1": "173, 216, 230",
    "--color2": "0, 116, 217",
    "--color3": "65, 105, 225",
    "--color4": "0, 31, 63",
    "--color5": "135, 206, 235",
    "--color-interactive": "0,191,255",
    "--circle-size": "90%",
    "--blending": "screen",
  },
} as const

function pickTokens<T extends Record<string, string>, K extends readonly (keyof T)[]>(
  source: T,
  keys: K,
): Pick<T, K[number]> {
  return keys.reduce(
    (result, key) => ({
      ...result,
      [key]: source[key],
    }),
    {} as Pick<T, K[number]>,
  )
}

export const APP_THEME_TOKENS = {
  bunny: {
    ...pickTokens(BASE_THEME_TOKENS.bunny, CONTENT_THEME_KEYS),
    "--outer-bg": "#a892e7",
    "--cursor-color": "rgba(223, 30, 155, 0.7)",
    "--cursor-glow": "0 0 8px rgba(223, 30, 155, 0.6)",
    "--cursor-hover-color": "rgba(223, 30, 155, 0.6)",
    "--cursor-hover-glow": "0 0 12px rgba(223, 30, 155, 0.6)",
  },
  water: {
    ...pickTokens(BASE_THEME_TOKENS.water, CONTENT_THEME_KEYS),
    "--outer-bg": "#1d0298",
    "--cursor-color": "rgba(230, 214, 251, 0.7)",
    "--cursor-glow": "0 0 8px rgba(230, 214, 251, 0.6)",
    "--cursor-hover-color": "rgba(230, 214, 251, 0.6)",
    "--cursor-hover-glow": "0 0 12px rgba(230, 214, 251, 0.6)",
  },
} as const

export const CONTENT_THEME_TOKENS = {
  bunny: pickTokens(BASE_THEME_TOKENS.bunny, CONTENT_THEME_KEYS),
  water: pickTokens(BASE_THEME_TOKENS.water, CONTENT_THEME_KEYS),
} as const

export const HOME_THEME_TOKENS = {
  bunny: {
    ...pickTokens(BASE_THEME_TOKENS.bunny, HOME_THEME_KEYS),
    "--link-color": "rgba(223, 30, 155, 0.8)",
  },
  water: {
    ...pickTokens(BASE_THEME_TOKENS.water, HOME_THEME_KEYS),
    "--link-color": "rgba(134, 196, 240, 0.8)",
  },
} as const

export const FOOTER_THEME_TOKENS = {
  bunny: pickTokens(BASE_THEME_TOKENS.bunny, FOOTER_THEME_KEYS),
  water: pickTokens(BASE_THEME_TOKENS.water, FOOTER_THEME_KEYS),
} as const

export const AWARDS_THEME_TOKENS = {
  bunny: {
    ...pickTokens(BASE_THEME_TOKENS.bunny, CONTENT_THEME_KEYS),
    "--color-text": "rgb(172, 149, 216)",
    "--color-accent-primary": "rgb(214, 129, 231)",
    "--button-bg": "rgba(180, 82, 205, 0.8)",
    "--button-bg-light": "rgba(180, 82, 205, 0.2)",
  },
  water: pickTokens(BASE_THEME_TOKENS.water, CONTENT_THEME_KEYS),
} as const

export const BUNNY_MODAL_THEME_TOKENS = {
  bunny: {
    ...pickTokens(BASE_THEME_TOKENS.bunny, CONTENT_THEME_KEYS),
    "--game-border": "rgba(223, 30, 155, 0.6)",
    "--game-shadow": "rgba(223, 30, 155, 0.35)",
    "--game-floor": "#2a0b25",
    "--game-fog": "#1b0318",
    "--bunny-primary": "#ffd7f3",
    "--bunny-secondary": "#4f2065",
    "--carrot-body": "#ff70ff",
    "--carrot-leaf": "#ffd2ff",
    "--game-outline": "#2b0320",
  },
  water: {
    ...pickTokens(BASE_THEME_TOKENS.water, CONTENT_THEME_KEYS),
    "--game-border": "rgba(134, 196, 240, 0.6)",
    "--game-shadow": "rgba(7, 36, 102, 0.35)",
    "--game-floor": "#041c2f",
    "--game-fog": "#052a41",
    "--bunny-primary": "#c7f2ff",
    "--bunny-secondary": "#113d60",
    "--carrot-body": "#ff66ff",
    "--carrot-leaf": "#41d6ff",
    "--game-outline": "#031525",
  },
} as const
