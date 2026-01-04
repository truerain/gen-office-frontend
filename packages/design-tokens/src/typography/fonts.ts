/**
 * Typography System
 * Based on LG Brand Guidelines - LG Smart Font
 */

export const fonts = {
  primary: {
    family: "'LG Smart', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
  mono: {
    family: "'Consolas', 'Monaco', 'Courier New', monospace",
  },
} as const;

export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
} as const;

export const lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

export const letterSpacing = {
  tight: '-0.05em',
  normal: '0',
  wide: '0.05em',
} as const;