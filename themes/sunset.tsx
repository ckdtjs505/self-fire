import { createTheme } from "@shopify/restyle";
import light from "./light";

const palette = {
  bg00: "#450A0A", // red-950
  bg10: "#7F1D1D", // red-900
  bg20: "#991B1B", // red-800
  fg100: "#FEE2E2", // red-100
  fg900: "#FEF2F2", // red-50
  primary: "#F97316", // orange-500
};

const theme = createTheme({
  ...light,
  colors: {
    ...light.colors,
    $primary: palette.primary,
    $background: palette.bg00,
    $foreground: palette.fg900,
    $sidebarBackground: palette.bg10,
    $sidebarForeground: palette.fg100,
    $headerBackground: palette.bg00,
  },
  barStyle: "light",
});

export default theme;
