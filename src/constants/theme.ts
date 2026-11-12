import "@/global.css";
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A2E",
    textSecondary: "#6B6B85",
    background: "#FFFFFF",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    primary: "#3D9E86",
    primaryLight: "#E9F7F3",
    onPrimary: "#FFFFFF",
    border: "#CCCCCC",
    borderLight: "#ECECF5",
    placeholder: "#999999",
    primarySoft: "#E3F3EF",
    danger: "#E0374B",
    dangerSoft: "#FFE9E9",
    warning: "#D98C00",
    warningSoft: "#FFF4E0",
    info: "#4C4DDC",
    infoSoft: "#ECECFD",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const FontFamily = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
} as const;

export type FontWeight = keyof typeof FontFamily;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 26,
} as const;
export type FontSizeToken = keyof typeof FontSize;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 10,
  lg: 16,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
