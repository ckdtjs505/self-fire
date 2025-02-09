import { createTheme } from "@shopify/restyle";
import light from "./light";
const palette = {
  slate00: "#1b1c1d",
  slate10: "#202225",
  slate20: "#292c2f",
  slate30: "#2e3235",
  slate40: "#35393d",
  slate100: "#767577",
  slate900: "#dddddd",
  blue70: "#2185d0",
};
const theme = createTheme({
  ...light,
  colors: {
    ...light.colors,

    $primary: palette.blue70,
    $background: palette.slate10,
    $foreground: palette.slate900,
    $sidebarBackground: palette.slate30,
    $sidebarForeground: palette.slate900,
    $headerBackground: palette.slate40,
  },
  textVariants: {
    defaults: {
      color: "$foreground",
      fontSize: 16,
    },
  },
  barStyle: "light",
});

export type Theme = typeof theme;
export default theme;
