import { Theme } from "../interface/Theme.interface";
import { darkTheme } from "./dark";
import { lightTheme } from "./light";
import { draculaTheme } from "./dracula";
import { nordTheme } from "./nord";

const themes: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  dracula: draculaTheme,
  nord: nordTheme,
};

export function getTheme(name: string): Theme {
  const theme = themes[name];
  if (!theme) {
    console.warn(`Theme "${name}" not found, falling back to "dark"`);
    return darkTheme;
  }
  return theme;
}
