export type ThemeType = "bunny" | "water"

export const APP_THEME_TOKENS = {
  bunny: {
    "--color-text": "rgb(121, 85, 189)",
    "--color-text-secondary": "rgba(249, 240, 251, 1)",
    "--color-accent-primary": "rgba(223, 30, 155, 1)",
    "--button-bg": "rgba(223, 30, 155, 0.8)",
    "--button-bg-light": "rgba(223, 30, 155, 0.2)",
    "--button-text": "rgba(249, 240, 251, 1)",
    "--border-color": "rgb(152, 128, 220)",
    "--outer-bg": "#a892e7",
    "--cursor-color": "rgba(223, 30, 155, 0.7)",
    "--cursor-glow": "0 0 8px rgba(223, 30, 155, 0.6)",
    "--cursor-hover-color": "rgba(223, 30, 155, 0.6)",
    "--cursor-hover-glow": "0 0 12px rgba(223, 30, 155, 0.6)",
  },
  water: {
    "--color-text": "rgb(191, 229, 249)",
    "--color-accent-primary": "rgb(134, 196, 240)",
    "--button-bg": "rgba(214, 235, 251, 0.8)",
    "--button-bg-light": "rgba(214, 220, 251, 0.2)",
    "--button-text": "rgb(46, 80, 192)",
    "--border-color": "rgba(8, 34, 163, 1)",
    "--outer-bg": "#1d0298",
    "--cursor-color": "rgba(230, 214, 251, 0.7)",
    "--cursor-glow": "0 0 8px rgba(230, 214, 251, 0.6)",
    "--cursor-hover-color": "rgba(230, 214, 251, 0.6)",
    "--cursor-hover-glow": "0 0 12px rgba(230, 214, 251, 0.6)",
  },
} as const

export const CONTENT_THEME_TOKENS = {
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

export const HOME_THEME_TOKENS = {
  bunny: {
    "--color-text": "rgb(121, 85, 189)",
    "--color-accent-primary": "rgba(223, 30, 155, 1)",
    "--button-bg": "rgba(223, 30, 155, 0.8)",
    "--button-bg-light": "rgba(223, 30, 155, 0.2)",
    "--link-color": "rgba(223, 30, 155, 0.8)",
  },
  water: {
    "--color-text": "rgb(191, 229, 249)",
    "--color-accent-primary": "rgb(134, 196, 240)",
    "--button-bg": "rgba(134, 196, 240, 0.8)",
    "--button-bg-light": "rgba(214, 220, 251, 0.2)",
    "--link-color": "rgba(134, 196, 240, 0.8)",
  },
} as const

export const FOOTER_THEME_TOKENS = {
  bunny: {
    "--color-text": "rgb(121, 85, 189)",
    "--color-accent-primary": "rgba(223, 30, 155, 1)",
    "--button-bg-light": "rgba(223, 30, 155, 0.2)",
    "--button-bg": "rgba(223, 30, 155, 0.8)",
  },
  water: {
    "--color-text": "rgb(191, 229, 249)",
    "--color-accent-primary": "rgb(134, 196, 240)",
    "--button-bg-light": "rgba(214, 220, 251, 0.2)",
    "--button-bg": "rgba(214, 235, 251, 0.8)",
  },
} as const

export const AWARDS_THEME_TOKENS = {
  bunny: {
    "--color-text": "rgb(172, 149, 216)",
    "--color-text-secondary": "rgba(249, 240, 251, 1)",
    "--color-accent-primary": "rgb(214, 129, 231)",
    "--button-bg": "rgba(180, 82, 205, 0.8)",
    "--button-bg-light": "rgba(180, 82, 205, 0.2)",
    "--button-text": "rgba(249, 240, 251, 1)",
    "--border-color": "rgb(152, 128, 220)",
  },
  water: {
    "--color-text": "rgb(191, 229, 249)",
    "--color-accent-primary": "rgb(134, 196, 240)",
    "--button-bg": "rgba(214, 235, 251, 0.8)",
    "--button-bg-light": "rgba(214, 220, 251, 0.2)",
    "--button-text": "rgb(46, 80, 192)",
    "--border-color": "rgba(8, 34, 163, 1)",
  },
} as const

export const BUNNY_MODAL_THEME_TOKENS = {
  bunny: {
    "--color-text": "rgb(121, 85, 189)",
    "--color-text-secondary": "rgba(249, 240, 251, 1)",
    "--color-accent-primary": "rgba(223, 30, 155, 1)",
    "--button-bg": "rgba(223, 30, 155, 0.8)",
    "--button-bg-light": "rgba(223, 30, 155, 0.2)",
    "--button-text": "rgba(249, 240, 251, 1)",
    "--border-color": "rgb(152, 128, 220)",
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
    "--color-text": "rgb(191, 229, 249)",
    "--color-accent-primary": "rgb(134, 196, 240)",
    "--button-bg": "rgba(214, 235, 251, 0.8)",
    "--button-bg-light": "rgba(214, 220, 251, 0.2)",
    "--button-text": "rgb(46, 80, 192)",
    "--border-color": "rgba(8, 34, 163, 1)",
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
