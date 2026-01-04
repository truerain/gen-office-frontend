import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { ThemeContextValue, ThemeMode, Theme } from '../types/theme.types';
import { lightTheme, darkTheme } from '../themes';
import '../styles/global.css';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
  /**
   * LG Smart 폰트 사용 여부
   * @default false (시스템 폰트 사용)
   */
  useLGFont?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'light',
  storageKey = 'gen-office-theme',
  useLGFont = false,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    return defaultMode;
  });

  const theme: Theme = mode === 'light' ? lightTheme : darkTheme;

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newMode);
      }
    },
    [storageKey]
  );

  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  // Apply CSS variables to :root
  useEffect(() => {
    const root = document.documentElement;

    console.log('🎨 ThemeProvider: Applying CSS variables', {
      mode,
      brandPrimary: theme.colors.brand.primary,
    });

    // Background colors
    root.style.setProperty('--color-bg-primary', theme.colors.background.primary);
    root.style.setProperty('--color-bg-secondary', theme.colors.background.secondary);
    root.style.setProperty('--color-bg-tertiary', theme.colors.background.tertiary);

    // Foreground colors
    root.style.setProperty('--color-fg-primary', theme.colors.foreground.primary);
    root.style.setProperty('--color-fg-secondary', theme.colors.foreground.secondary);
    root.style.setProperty('--color-fg-tertiary', theme.colors.foreground.tertiary);
    root.style.setProperty('--color-fg-inverse', theme.colors.foreground.inverse);

    // Brand colors
    root.style.setProperty('--color-brand-primary', theme.colors.brand.primary);
    root.style.setProperty('--color-brand-secondary', theme.colors.brand.secondary);

    console.log('✅ ThemeProvider: CSS variables applied', {
      '--color-brand-primary': root.style.getPropertyValue('--color-brand-primary'),
    });

    // Status colors
    root.style.setProperty('--color-status-success', theme.colors.status.success);
    root.style.setProperty('--color-status-warning', theme.colors.status.warning);
    root.style.setProperty('--color-status-error', theme.colors.status.error);
    root.style.setProperty('--color-status-info', theme.colors.status.info);

    // Border colors
    root.style.setProperty('--color-border-default', theme.colors.border.default);
    root.style.setProperty('--color-border-subtle', theme.colors.border.subtle);
    root.style.setProperty('--color-border-strong', theme.colors.border.strong);

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', mode);
    
    // Set LG Font usage
    if (useLGFont) {
      root.setAttribute('data-use-lg-font', 'true');
    } else {
      root.removeAttribute('data-use-lg-font');
    }
  }, [theme, mode, useLGFont]);

  const value: ThemeContextValue = {
    theme,
    mode,
    setMode,
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};