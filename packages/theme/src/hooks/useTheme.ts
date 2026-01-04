import { useContext } from 'react';
import { ThemeContext } from '../provider';
import type { ThemeContextValue } from '../types/theme.types';

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};