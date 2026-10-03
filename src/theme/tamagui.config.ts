import { createTamagui, createTokens } from "tamagui";

// 1. Define Tokens matching Thenx Design System Specs
const tokens = createTokens({
  color: {
    // Backgrounds
    black: "#000000",
    darkBg: "#0A0A0A",
    cardDark: "#1C1C1E",
    surfaceDark: "#111111",
    badgeBg: "#111111",

    // Primary Action
    electricBlue: "#1E90FF",
    primary: "#1E90FF",

    // Text & Accents
    white: "#FFFFFF",
    textMuted: "#8E8E93",
    gray: "#8E8E93",
    borderDark: "#2C2C2E",

    // Light Fallbacks (if needed)
    lightBg: "#F2F2F7",
    cardLight: "#FFFFFF",
    borderLight: "#E5E5EA",
  },
  space: {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    true: 16,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    9: 48,
    10: 64,
    true: 16,
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    pill: 9999,
    full: 9999,
    true: 12,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
  },
});

// 2. Define Themes
const themes = {
  dark: {
    background: tokens.color.darkBg,
    backgroundStrong: tokens.color.black,
    color: tokens.color.white,
    colorMuted: tokens.color.textMuted,
    primary: tokens.color.electricBlue,
    cardBg: tokens.color.cardDark,
    surfaceBg: tokens.color.surfaceDark,
    badgeBg: tokens.color.badgeBg,
    borderColor: tokens.color.borderDark,
    textSecondary: tokens.color.textMuted,
    white: tokens.color.white,
    gray: tokens.color.gray,
  },
  light: {
    background: tokens.color.lightBg,
    backgroundStrong: tokens.color.white,
    color: tokens.color.black,
    colorMuted: tokens.color.textMuted,
    primary: tokens.color.electricBlue,
    cardBg: tokens.color.cardLight,
    surfaceBg: tokens.color.white,
    badgeBg: tokens.color.surfaceDark,
    borderColor: tokens.color.borderLight,
    textSecondary: tokens.color.textMuted,
    white: tokens.color.white,
    gray: tokens.color.gray,
  },
};

const appConfig = createTamagui({
  tokens,
  themes,
  defaultTheme: "dark",
});

export type AppConfig = typeof appConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;
