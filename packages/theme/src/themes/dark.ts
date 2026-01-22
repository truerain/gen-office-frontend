import type { Theme } from '../types/theme.types';

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: {
      primary: '#1A1A1A',
      secondary: '#2A2A2A',
      tertiary: '#3A3A3A',
    },
    foreground: {
      primary: '#FFFFFF',
      secondary: '#D9DADB',
      tertiary: '#999999',
      inverse: '#1D1D1B',
    },
    brand: {
      primary: '#C6004D',
      secondary: '#6B6B6B',
    },
    status: {
      success: '#3CD5AF',
      warning: '#FFDA27',
      error: '#EC008B',
      info: '#B150C5',
    },
    border: {
      default: '#404040',
      subtle: '#303030',
      strong: '#6B6B6B',
    },
  },
};
