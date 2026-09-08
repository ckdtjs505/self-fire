import { createTheme } from "@shopify/restyle";
import light from "./light";

const palette = {
  bg00: "#083344", // cyan-950
  bg10: "#164E63", // cyan-900
  bg20: "#155E75", // cyan-800
  fg100: "#CFFAFE", // cyan-100
  fg900: "#ECFEFF", // cyan-50
  primary: "#06B6D4", // cyan-500
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
