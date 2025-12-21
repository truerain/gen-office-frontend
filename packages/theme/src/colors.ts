/**
 * LG 브랜드 컬러 팔레트
 */
export const lgColors = {
  // LG Primary Red
  primary: {
    50: '#fef2f4',
    100: '#fde6e9',
    200: '#fbd0d8',
    300: '#f7a8b7',
    400: '#f27791',
    500: '#e84d6f',
    600: '#d4295c',
    700: '#a50034', // LG Red (Main)
    800: '#8b0f3d',
    900: '#77133a',
  },
  
  // LG Secondary Purple
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    700: '#15803d',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    700: '#b45309',
    900: '#78350f',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    700: '#b91c1c',
    900: '#7f1d1d',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
} as const;

/**
 * 컬러 타입
 */
export type LGColors = typeof lgColors;
export type ColorPalette = keyof LGColors;
export type ColorShade = keyof LGColors['primary'];