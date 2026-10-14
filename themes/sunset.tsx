import { createTheme } from "@shopify/restyle";
import light, { makeColors } from "./light";

// 노을 — 해 질 녘의 짙은 적갈색
const theme = createTheme({
  ...light,
  colors: makeColors({
    background: "#24120F",
    surface: "#321A16",
    surfaceMuted: "#3E221D",
    foreground: "#FFEDE4",
    muted: "#CFA295",
    border: "rgba(255,237,228,0.09)",
    primary: "#FF8A4C",
    primarySoft: "rgba(255,138,76,0.16)",
    onPrimary: "#2A0F05",
    flame: "#FF9A5C",
  }),
  barStyle: "light",
});

export default theme;
