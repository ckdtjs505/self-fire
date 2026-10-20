import { createTheme } from "@shopify/restyle";
import light, { makeColors } from "./light";

// 잉걸불 — 30일 연속 점화 보상. 숯 위에서 붉게 달아오른 불씨
const theme = createTheme({
  ...light,
  colors: makeColors({
    background: "#0F0B0A",
    surface: "#1C1311",
    surfaceMuted: "#291A16",
    foreground: "#FFE9DC",
    muted: "#C29280",
    border: "rgba(255,120,70,0.14)",
    primary: "#FF5A1F",
    primarySoft: "rgba(255,90,31,0.18)",
    onPrimary: "#1F0800",
    flame: "#FF4A12",
  }),
  barStyle: "light",
});

export default theme;
