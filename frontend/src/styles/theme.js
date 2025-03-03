/**
 * Application theme and design system
 * This file contains color schemes, spacing, typography, and other UI constants
 */

// Color palette
const colors = {
  // Primary brand colors
  primary: {
    50: '#e6f7ff',
    100: '#b3e6ff',
    200: '#80d4ff',
    300: '#4dc2ff',
    400: '#1aafff',
    500: '#0099e6',
    600: '#007bb3',
    700: '#005c80',
    800: '#003e4d',
    900: '#00212b',
    DEFAULT: '#0099e6',
  },
  
  // Secondary/accent color
  secondary: {
    50: '#f3f2ff',
    100: '#e5e4ff',
    200: '#d0ccff',
    300: '#b8b2ff',
    400: '#9d93ff',
    500: '#8271ff',
    600: '#6d54f4',
    700: '#5945d6',
    800: '#4435a9',
    900: '#312a79',
    DEFAULT: '#6d54f4',
  },
  
  // Success states
  success: {
    50: '#e7f9ee',
    100: '#c4f0d6',
    200: '#9de6bd',
    300: '#70dca2',
    400: '#44d287',
    500: '#26b96a',
    600: '#1ea35b',
    700: '#198a4d',
    800: '#17723f',
    900: '#135a33',
    DEFAULT: '#26b96a',
  },
  
  // Warning states
  warning: {
    50: '#fff8e6',
    100: '#ffedbf',
    200: '#ffe299',
    300: '#ffd773',
    400: '#ffca4d',
    500: '#ffbc26',
    600: '#f0aa00',
    700: '#c68c00',
    800: '#9c6e00',
    900: '#735000',
    DEFAULT: '#ffbc26',
  },
  
  // Error states
  error: {
    50: '#feeaef',
    100: '#fcd5de',
    200: '#f9acbe',
    300: '#f5839e',
    400: '#f1597e',
    500: '#ee305e',
    600: '#db1d4b',
    700: '#b71b40',
    800: '#931635',
    900: '#70112a',
    DEFAULT: '#ee305e',
  },
  
  // Neutral colors for text, backgrounds, etc.
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
    DEFAULT: '#64748b',
  },
  
  // Background colors
  background: {
    light: '#ffffff',
    dark: '#121826',
    card: '#ffffff',
    cardHover: '#f8fafc',
    cardActive: '#f1f5f9',
  },
  
  // Text colors
  text: {
    primary: '#1e293b',
    secondary: '#475569',
    tertiary: '#64748b',
    light: '#ffffff',
    inverse: '#ffffff',
    muted: '#94a3b8',
    disabled: '#cbd5e1',
  },
  
  // Border colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e1',
    dark: '#94a3b8',
    focus: '#0099e6',
  },
};

// Typography
const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Spacing scale (used for margin, padding, etc.)
const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Border radius
const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Shadows
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  none: 'none',
};

// Transitions
const transitions = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Breakpoints for responsive design
const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-index scale
const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: 'auto',
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// Theme light mode (default)
const lightTheme = {
  colors: {
    ...colors,
    background: {
      body: colors.neutral[50],
      card: colors.background.card,
      input: colors.background.light,
      sidebar: colors.background.light,
      popup: colors.background.light,
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[700],
      muted: colors.neutral[500],
      inverse: colors.background.light,
    },
    border: {
      DEFAULT: colors.neutral[200],
      focus: colors.primary[400],
    },
  },
};

// Theme dark mode
const darkTheme = {
  colors: {
    ...colors,
    background: {
      body: colors.neutral[900],
      card: colors.neutral[800],
      input: colors.neutral[800],
      sidebar: colors.neutral[950],
      popup: colors.neutral[800],
    },
    text: {
      primary: colors.neutral[100],
      secondary: colors.neutral[300],
      muted: colors.neutral[400],
      inverse: colors.neutral[900],
    },
    border: {
      DEFAULT: colors.neutral[700],
      focus: colors.primary[400],
    },
  },
};

// Export the theme
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  light: lightTheme,
  dark: darkTheme,
};

export default theme;