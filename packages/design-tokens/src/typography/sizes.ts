import { fontSizes, lineHeights } from './fonts';

/**
 * Typography Scale
 * Predefined combinations of font size and line height
 */
export const typographyScale = {
  display: {
    fontSize: fontSizes['6xl'],
    lineHeight: lineHeights.tight,
  },
  h1: {
    fontSize: fontSizes['5xl'],
    lineHeight: lineHeights.tight,
  },
  h2: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights.tight,
  },
  h3: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights.normal,
  },
  h4: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.normal,
  },
  h5: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.normal,
  },
  h6: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.normal,
  },
  body: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.normal,
  },
  bodyLarge: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.relaxed,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.normal,
  },
  caption: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.normal,
  },
} as const;