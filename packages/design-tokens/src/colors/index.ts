export { primary } from './primary';
export { secondary } from './secondary';
export { metallic } from './metallic';

/**
 * All LG Brand Colors
 */
export const colors = {
  primary: {
    red: '#A50034',
    gray: '#6B6B6B',
    white: '#FFFFFF',
  },
  secondary: {
    pink: '#EC008B',
    teal: '#0096AA',
    orange: '#E97300',
    purple: '#61279E',
    lightTeal: '#3CD5AF',
    yellow: '#FFDA27',
    lightPurple: '#B150C5',
    lightGray: '#D9DADB',
    black: '#1D1D1B',
  },
  metallic: {
    silver: '#8A8C8F',
    gold: '#B49759',
  },
} as const;

export type ColorName = keyof typeof colors;