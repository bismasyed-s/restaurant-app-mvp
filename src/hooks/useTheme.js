import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function useTheme() {
  // This hook reads the shared theme so screens use one consistent color palette.
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider.');
  }
  return context;
}
