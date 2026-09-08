import { createTheme } from "@shopify/restyle";
import light from "./light";

const palette = {
  bg00: "#F0FDF4", // green-50
  bg10: "#DCFCE7", // green-100
  bg20: "#BBF7D0", // green-200
  fg100: "#166534", // green-800
  fg900: "#14532D", // green-900
  primary: "#10B981", // emerald-500
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
