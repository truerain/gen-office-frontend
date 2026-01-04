import { colors } from '@gen-office/design-tokens';
import type { Theme } from '../types/theme.types';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: {
      primary: colors.primary.white,
      secondary: colors.secondary.lightGray,
      tertiary: '#F5F5F5',
    },
    foreground: {
      primary: colors.secondary.black,
      secondary: colors.primary.gray,
      tertiary: '#999999',
      inverse: colors.primary.white,
    },
    brand: {
      primary: colors.primary.red,
      secondary: colors.primary.gray,
    },
    status: {
      success: colors.secondary.teal,
      warning: colors.secondary.orange,
      error: colors.primary.red,
      info: colors.secondary.purple,
    },
    border: {
      default: '#E0E0E0',
      subtle: '#F0F0F0',
      strong: colors.primary.gray,
    },
  },
};