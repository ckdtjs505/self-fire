import { createTheme } from "@shopify/restyle";
import light, { makeColors } from "./light";

// 세피아 — 오래된 종이와 잉크
const theme = createTheme({
  ...light,
  colors: makeColors({
    background: "#F3EADB",
    surface: "#FBF6EC",
    surfaceMuted: "#E9DDC9",
    foreground: "#3A2A1B",
    muted: "#8A7259",
    border: "rgba(58,42,27,0.10)",
    primary: "#B05A1E",
    primarySoft: "rgba(176,90,30,0.11)",
    onPrimary: "#FFFFFF",
    flame: "#D2541C",
  }),
  barStyle: "dark",
});

export default theme;
