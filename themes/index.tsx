import light, { Theme } from "./light";
import dark from "./dark";
type themeMeta = {
  id: string;
  name: string;
  theme: Theme;
};

const currentThemeId: string = "light";

const themelist: themeMeta[] = [
  {
    id: "light",
    name: "light",
    theme: light,
  },
  {
    id: "dark",
    name: "dark",
    theme: dark,
  },
];

export const getCurrentTheme = () => {
  const currentThemeIdx = themelist.findIndex((theme, number) => {
    return theme.id === currentThemeId;
  });

  return themelist[currentThemeIdx].theme;
};

export type { Theme };
