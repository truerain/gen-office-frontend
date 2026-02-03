import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { ThemeContextValue, ThemeMode, Theme } from '../types/theme.types';
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

  const readThemeFromCss = useCallback(
    (nextMode: ThemeMode): Theme => {
      if (typeof window === 'undefined') {
        return {
          mode: nextMode,
          colors: {
            background: { primary: '', secondary: '', tertiary: '' },
            foreground: { primary: '', secondary: '', tertiary: '', inverse: '' },
            brand: { primary: '', secondary: '' },
            status: { success: '', warning: '', error: '', info: '' },
            border: { default: '', subtle: '', strong: '' },
          },
        };
      }

      const root = document.documentElement;
      const styles = window.getComputedStyle(root);
      const getVar = (name: string) => styles.getPropertyValue(name).trim();

      return {
        mode: nextMode,
        colors: {
          background: {
            primary: getVar('--color-bg-primary'),
            secondary: getVar('--color-bg-secondary'),
            tertiary: getVar('--color-bg-tertiary'),
          },
          foreground: {
            primary: getVar('--color-fg-primary'),
            secondary: getVar('--color-fg-secondary'),
            tertiary: getVar('--color-fg-tertiary'),
            inverse: getVar('--color-fg-inverse'),
          },
          brand: {
            primary: getVar('--color-brand-primary'),
            secondary: getVar('--color-brand-secondary'),
          },
          status: {
            success: getVar('--color-status-success'),
            warning: getVar('--color-status-warning'),
            error: getVar('--color-status-error'),
            info: getVar('--color-status-info'),
          },
          border: {
            default: getVar('--color-border-default'),
            subtle: getVar('--color-border-subtle'),
            strong: getVar('--color-border-strong'),
          },
        },
      };
    },
    []
  );

  const [theme, setTheme] = useState<Theme>(() => readThemeFromCss(mode));

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

  useEffect(() => {
    const root = document.documentElement;

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', mode);
    
    // Set LG Font usage
    if (useLGFont) {
      root.setAttribute('data-use-lg-font', 'true');
    } else {
      root.removeAttribute('data-use-lg-font');
    }

    setTheme(readThemeFromCss(mode));
  }, [mode, useLGFont, readThemeFromCss]);

  const value: ThemeContextValue = {
    theme,
    mode,
    setMode,
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
