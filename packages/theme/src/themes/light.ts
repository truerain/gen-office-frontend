import type { Theme } from '../types/theme.types';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#D9DADB',
      tertiary: '#F5F5F5',
    },
    foreground: {
      primary: '#1D1D1B',
      secondary: '#6B6B6B',
      tertiary: '#999999',
      inverse: '#FFFFFF',
    },
    brand: {
      primary: '#C6004D',
      secondary: '#6B6B6B',
    },
    status: {
      success: '#0096AA',
      warning: '#E97300',
      error: '#C6004D',
      info: '#61279E',
    },
    border: {
      default: '#E0E0E0',
      subtle: '#F0F0F0',
      strong: '#6B6B6B',
    },
  },
};
