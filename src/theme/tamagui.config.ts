import { Platform } from "react-native";
import { createFont, createTamagui, createTokens } from "tamagui";

const systemFont = createFont({
  family: Platform.select({
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: "System",
  }),
  size: { 1: 11, 2: 12, 3: 13, 4: 14, 5: 16, 6: 18, 7: 20, 8: 22, 9: 28, 10: 32, true: 16 },
  lineHeight: { 1: 15, 2: 16, 3: 18, 4: 20, 5: 22, 6: 24, 7: 26, 8: 28, 9: 34, 10: 38, true: 22 },
  weight: { 4: "400", 5: "500", 6: "600", 7: "700", 8: "800" },
  letterSpacing: { 4: 0 },
});

// 1. Define Tokens matching Nike Athletic Minimalist System Specs
const tokens = createTokens({
  color: {
    // Canvas & Layer Surfaces
    offWhite: "#FAFAFA",
    pureWhite: "#FFFFFF",
    surfaceSubtle: "#F5F5F7",
    borderSubtle: "#E5E5E5",
    borderLight: "#E5E5E5",

    // Obsidian Black & Neutrals
    obsidian: "#111111",
    black: "#111111",
    trueBlack: "#000000",
    textMuted: "#6E6E73",
    textSecondary: "#6E6E73",
    textTertiary: "#A1A1A6",
    gray: "#6E6E73",

    // Athletic Punch Accent (Nike Orange)
    accent: "#FF5E00",
    accentMuted: "rgba(255, 94, 0, 0.12)",

    // Primary Action (High Contrast)
    primary: "#111111",
    primaryContrast: "#FFFFFF",
    electricBlue: "#FF5E00", // mapped to accent for backward compatibility

    // Legacy / Dark Fallbacks
    darkBg: "#000000",
    cardDark: "#141416",
    surfaceDark: "#101012",
    badgeBg: "#F5F5F7",
    borderDark: "#262628",
    white: "#FFFFFF",
    lightBg: "#FAFAFA",
    cardLight: "#FFFFFF",
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
    9: 40,
    10: 48,
    true: 16,
  },
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    3.5: 14,
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
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    sm: 8,
    md: 12,
    lg: 14,
    xl: 16,
    pill: 9999,
    full: 9999,
    true: 14,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
  },
});

// 2. Define Modern Themes (Nike Athletic Minimalist default)
const themes = {
  light_nike: {
    background: tokens.color.offWhite,
    backgroundStrong: tokens.color.pureWhite,
    color: tokens.color.obsidian,
    colorMuted: tokens.color.textMuted,
    primary: tokens.color.obsidian,
    primaryContrast: tokens.color.pureWhite,
    cardBg: tokens.color.pureWhite,
    surface: tokens.color.pureWhite,
    surfaceBg: tokens.color.pureWhite,
    surfaceSubtle: tokens.color.surfaceSubtle,
    badgeBg: tokens.color.surfaceSubtle,
    borderColor: tokens.color.borderSubtle,
    border: tokens.color.borderSubtle,
    textPrimary: tokens.color.obsidian,
    textSecondary: tokens.color.textSecondary,
    textTertiary: tokens.color.textTertiary,
    accent: tokens.color.accent,
    white: tokens.color.pureWhite,
    gray: tokens.color.gray,
  },
  light: {
    background: tokens.color.offWhite,
    backgroundStrong: tokens.color.pureWhite,
    color: tokens.color.obsidian,
    colorMuted: tokens.color.textMuted,
    primary: tokens.color.obsidian,
    primaryContrast: tokens.color.pureWhite,
    cardBg: tokens.color.pureWhite,
    surface: tokens.color.pureWhite,
    surfaceBg: tokens.color.pureWhite,
    surfaceSubtle: tokens.color.surfaceSubtle,
    badgeBg: tokens.color.surfaceSubtle,
    borderColor: tokens.color.borderSubtle,
    border: tokens.color.borderSubtle,
    textPrimary: tokens.color.obsidian,
    textSecondary: tokens.color.textSecondary,
    textTertiary: tokens.color.textTertiary,
    accent: tokens.color.accent,
    white: tokens.color.pureWhite,
    gray: tokens.color.gray,
  },
  dark: {
    background: tokens.color.darkBg,
    backgroundStrong: tokens.color.black,
    color: tokens.color.white,
    colorMuted: tokens.color.textMuted,
    primary: tokens.color.pureWhite,
    primaryContrast: tokens.color.obsidian,
    cardBg: tokens.color.cardDark,
    surface: tokens.color.surfaceDark,
    surfaceBg: tokens.color.surfaceDark,
    surfaceSubtle: tokens.color.badgeBg,
    badgeBg: tokens.color.badgeBg,
    borderColor: tokens.color.borderDark,
    border: tokens.color.borderDark,
    textPrimary: tokens.color.white,
    textSecondary: tokens.color.textSecondary,
    textTertiary: tokens.color.textTertiary,
    accent: tokens.color.accent,
    white: tokens.color.white,
    gray: tokens.color.gray,
  },
};

const appConfig = createTamagui({
  tokens,
  themes,
  fonts: {
    heading: systemFont,
    body: systemFont,
  },
  settings: {
    defaultFont: "body",
  },
  defaultTheme: "light_nike",
});

export type AppConfig = typeof appConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;
