import { createTheme } from "@shopify/restyle";
import light from "./light";
const palette = {
  slate00: "#020617", // Very deep background
  slate10: "#0F172A", // Deep Navy background
  slate20: "#1E293B", // Elevated background
  slate30: "#334155", // Borders/secondary elevated
  slate40: "#475569", 
  slate100: "#94A3B8", // Subtle text
  slate900: "#F8FAFC", // Main bright text
  primary: "#818CF8", // Vibrant Indigo for contrast
};
const theme = createTheme({
  ...light,
  colors: {
    ...light.colors,

    $primary: palette.primary,
    $background: palette.slate10,
    $foreground: palette.slate900,
    $sidebarBackground: palette.slate20,
    $sidebarForeground: palette.slate100,
    $headerBackground: palette.slate10,
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
