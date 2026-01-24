/**
 * GOAL Brand Design Tokens
 * Based on brand-specs.md and example visuals
 */

export const GOAL_COLORS = {
  // Primary brand colors
  primary: '#1E88E5', // GOAL Blue (bright blue)
  primaryDark: '#0479DF', // Alternative GOAL Blue from plan doc
  
  // Dark colors
  dark: '#1A365D', // Dark Blue/Navy (for text and dark elements)
  darkText: '#1F2937', // Dark text color
  darkBlue: '#0D1B2A', // Very dark blue
  
  // Success/positive colors
  success: '#10B981', // Green for positive metrics
  teal: '#0D9488', // Teal for positive metrics/percentages
  
  // Neutral colors
  gray: '#9CA3AF', // Secondary gray
  neutralGray: '#94A3B8', // Neutral gray
  lightGray: '#F8FAFC', // Light gray background
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Additional colors from examples
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    600: '#2563EB',
    700: '#1D4ED8',
  },
} as const;

export const GOAL_TYPOGRAPHY = {
  fontFamily: {
    primary: 'Inter, system-ui, sans-serif',
    fallback: 'system-ui, -apple-system, sans-serif',
  },
  
  fontSize: {
    // KPI values
    kpiValue: '28px',
    kpiValueLg: '32px',
    kpiValueXl: '3xl', // 30px in Tailwind
    
    // Labels
    label: '13px',
    labelMd: '14px',
    
    // Headlines
    headline: '16px',
    headlineLg: '18px',
    
    // Large display
    display: '3xl', // 30px
    displayLg: '4xl', // 36px
  },
  
  fontWeight: {
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const GOAL_SPACING = {
  cardPadding: '1.5rem', // 24px
  cardGap: '1.5rem', // 24px
  sectionGap: '2rem', // 32px
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
} as const;

export const GOAL_COMPONENTS = {
  card: {
    background: GOAL_COLORS.white,
    borderRadius: '12px',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  
  bar: {
    height: '24px',
    heightSm: '12px',
    heightMd: '16px',
    borderRadius: '4px',
  },
  
  badge: {
    borderRadius: '9999px', // fully rounded
  },
} as const;

/**
 * CSS variable names for use in Tailwind or direct CSS
 */
export const GOAL_CSS_VARS = {
  '--goal-blue': GOAL_COLORS.primary,
  '--goal-dark': GOAL_COLORS.dark,
  '--success-green': GOAL_COLORS.success,
  '--neutral-gray': GOAL_COLORS.neutralGray,
  '--light-gray': GOAL_COLORS.lightGray,
  '--white': GOAL_COLORS.white,
} as const;
