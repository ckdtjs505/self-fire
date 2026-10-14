import { createTheme } from "@shopify/restyle";
import light, { makeColors } from "./light";

// 다크 — 꺼지지 않는 잉걸불 같은 따뜻한 검정
const theme = createTheme({
  ...light,
  colors: makeColors({
    background: "#141211",
    surface: "#1E1B19",
    surfaceMuted: "#282421",
    foreground: "#F4EFE9",
    muted: "#A39A91",
    border: "rgba(244,239,233,0.08)",
    primary: "#FF7A3D",
    primarySoft: "rgba(255,122,61,0.14)",
    onPrimary: "#1A0E08",
    flame: "#FF6A2C",
  }),
  barStyle: "light",
});

export default theme;
