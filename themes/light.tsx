import { createTheme } from "@shopify/restyle";

const palette = {
  white: "white",
  black: "black",
  red: "#EF4444",
  blue: "#3B82F6",
  yellow: "#F59E0B",
  paper00: "#ffffff",
  paper10: "#F8FAFC",
  paper20: "#F1F5F9",
  paper100: "#CBD5E1",
  paper300: "#94A3B8",
  paper900: "#1E293B",
  primary: "#4F46E5", // Indigo 600
  sidebarBg: "#FFFFFF",
  sidebarFg: "#475569",
};
const theme = createTheme({
  spacing: {
    "0": 0,
    xs: 4,
    s: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 48,
    hg: 128,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  colors: {
    white: palette.white,
    black: palette.black,
    red: palette.red,
    yellow: palette.yellow,
    blue: palette.blue,

    $primary: palette.primary,
    $background: palette.paper10,
    $foreground: palette.paper900,
    $sidebarBackground: palette.sidebarBg,
    $sidebarForeground: palette.sidebarFg,
    $headerBackground: palette.paper00,
  },
  borderRadii: {
    xs: 4,
    sm: 6,
    md: 24,
    lg: 64,
    hg: 128,
  },
  textVariants: {
    defaults: {
      color: "$foreground",
      fontSize: 16,
    },
  },
  barStyle: "dark",
});

export type Theme = typeof theme;
export default theme;
