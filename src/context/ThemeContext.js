import React, { createContext, useMemo, useState } from 'react';
import { darkColors, lightColors } from '../theme/colors';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // This state records whether dark mode is active so every screen can follow the same theme.
  const [isDark, setIsDark] = useState(false);
  // This memo selects the active palette when the theme mode changes.
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
  const toggleTheme = () => setIsDark((currentMode) => !currentMode);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}
