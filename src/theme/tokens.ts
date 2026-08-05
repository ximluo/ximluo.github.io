export type ThemeType = "water"

const BASE_THEME_TOKENS = {
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

const HOME_THEME_KEYS = ["--color-text", "--color-accent-primary", "--button-bg"] as const

const FOOTER_THEME_KEYS = [
  "--color-text",
  "--color-accent-primary",
  "--button-bg-light",
  "--button-bg",
] as const

export const THEME_VISUAL_TOKENS = {
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
    projectEmbedSkeletonGradient:
      "linear-gradient(120deg, rgba(8, 34, 163, 0.05), rgba(8, 34, 163, 0.12), rgba(8, 34, 163, 0.05))",
  },
} as const

export const GRADIENT_BACKGROUND_THEME_VARS = {
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
  water: {
    ...pickTokens(BASE_THEME_TOKENS.water, CONTENT_THEME_KEYS),
    "--outer-bg": "#1d0298",
    "--cursor-color": "rgba(230, 214, 251, 0.7)",
    "--cursor-glow": "0 0 8px rgba(230, 214, 251, 0.5)",
    "--cursor-hover-color": "rgba(230, 214, 251, 0.6)",
    "--cursor-hover-glow": "0 0 12px rgba(230, 214, 251, 0.5)",
  },
} as const

export const CONTENT_THEME_TOKENS = {
  water: pickTokens(BASE_THEME_TOKENS.water, CONTENT_THEME_KEYS),
} as const

export const HOME_THEME_TOKENS = {
  water: {
    ...pickTokens(BASE_THEME_TOKENS.water, HOME_THEME_KEYS),
    "--link-color": "rgba(191, 229, 249, 0.96)",
  },
} as const

export const FOOTER_THEME_TOKENS = {
  water: pickTokens(BASE_THEME_TOKENS.water, FOOTER_THEME_KEYS),
} as const

export const BUNNY_MODAL_THEME_TOKENS = {
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
