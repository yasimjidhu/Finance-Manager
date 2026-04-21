import React, { createContext, useContext, useState } from "react";
import { lightTheme, darkTheme, AppTheme } from "./index";

const ThemeContext = createContext({
  theme: lightTheme as AppTheme,
  toggleTheme: () => { },
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider
      value={{
        theme: isDark ? darkTheme : lightTheme,
        toggleTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
