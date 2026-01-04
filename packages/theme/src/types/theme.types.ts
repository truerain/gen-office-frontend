export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    // Background
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    // Foreground (Text)
    foreground: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    // Brand
    brand: {
      primary: string;
      secondary: string;
    };
    // Status
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    // Border
    border: {
      default: string;
      subtle: string;
      strong: string;
    };
  };
}

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}