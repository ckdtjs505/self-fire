import { createTheme } from "@shopify/restyle";
import light from "./light";

const palette = {
  bg00: "#FFFBEB", // amber-50 (Soft cream)
  bg10: "#FEF3C7", // amber-100 (Warm paper)
  bg20: "#FDE68A", // amber-200
  fg100: "#B45309", // amber-700
  fg900: "#451A03", // amber-950 (Espresso text)
  primary: "#D97706", // amber-600
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
  barStyle: "dark",
});

export default theme;
