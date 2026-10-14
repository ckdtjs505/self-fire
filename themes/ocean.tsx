import { createTheme } from "@shopify/restyle";
import light, { makeColors } from "./light";

// 바다 — 깊은 밤바다의 남색
const theme = createTheme({
  ...light,
  colors: makeColors({
    background: "#0B1822",
    surface: "#12232F",
    surfaceMuted: "#1A2F3D",
    foreground: "#E7F1F6",
    muted: "#8EA6B4",
    border: "rgba(231,241,246,0.08)",
    primary: "#4CB6DD",
    primarySoft: "rgba(76,182,221,0.14)",
    onPrimary: "#06141C",
    flame: "#FF7A45",
  }),
  barStyle: "light",
});

export default theme;
