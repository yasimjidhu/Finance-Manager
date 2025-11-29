import { LightColors, DarkColors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const lightTheme = {
  colors: LightColors,
  spacing,
  typography,
  mode: "light"
};

export const darkTheme = {
  colors: DarkColors,
  spacing,
  typography,
  mode: "dark"
};

export type AppTheme = typeof lightTheme;
