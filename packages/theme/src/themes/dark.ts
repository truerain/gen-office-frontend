import { colors } from '@gen-office/design-tokens';
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
      primary: colors.primary.white,
      secondary: colors.secondary.lightGray,
      tertiary: '#999999',
      inverse: colors.secondary.black,
    },
    brand: {
      primary: colors.primary.red,
      secondary: colors.primary.gray,
    },
    status: {
      success: colors.secondary.lightTeal,
      warning: colors.secondary.yellow,
      error: colors.secondary.pink,
      info: colors.secondary.lightPurple,
    },
    border: {
      default: '#404040',
      subtle: '#303030',
      strong: colors.primary.gray,
    },
  },
};