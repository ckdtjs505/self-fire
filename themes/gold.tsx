import { createTheme } from "@shopify/restyle";
import light, { makeColors } from "./light";

// 황금 불꽃 — 100일 연속 점화 보상. 오래 지킨 불씨가 금빛으로 타오른다
const theme = createTheme({
  ...light,
  colors: makeColors({
    background: "#16110A",
    surface: "#221A0F",
    surfaceMuted: "#2E2314",
    foreground: "#FFF4DA",
    muted: "#C9B48A",
    border: "rgba(255,206,110,0.14)",
    primary: "#FFC23D",
    primarySoft: "rgba(255,194,61,0.16)",
    onPrimary: "#2A1A00",
    flame: "#FFB020",
  }),
  barStyle: "light",
});

export default theme;
