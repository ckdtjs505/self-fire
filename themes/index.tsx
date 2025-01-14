import light, { Theme } from "./light";

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
];

export const getCurrentTheme = () => {
  const currentThemeIdx = themelist.findIndex((theme, number) => {
    return theme.id === currentThemeId;
  });

  console.log(currentThemeId);
  return themelist[currentThemeIdx].theme;
};
