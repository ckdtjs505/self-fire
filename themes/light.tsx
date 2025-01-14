import { createTheme } from "@shopify/restyle";

const palette = {
  white: "white",
  black: "black",
  red: "red",
  blue: "blue",
  yellow: "yellow",
  paper00: "#ffffff",
  paper10: "#f5f5f5",
  paper20: "#e6e6e6",
  paper100: "#aeaeae",
  paper300: "#767577",
  paper900: "#202020",
  blue70: "#2185d0",
  navy20: "#171a21",
  navy900: "#b9babc",
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

    $primary: palette.blue70,
    $background: palette.paper10,
    $foreground: palette.paper100,
    $sidebarBackground: palette.navy20,
    $sidebarForeground: palette.navy900,
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
});

export type Theme = typeof theme;
export default theme;
