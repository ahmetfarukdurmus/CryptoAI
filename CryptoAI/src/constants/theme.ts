export interface ThemeColors {
  background: string;
  cardBg: string;
  cardBgElevated: string;
  modalBg: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryMuted: string;
  secondary: string;
  secondaryMuted: string;
  bullish: string;
  bullishMuted: string;
  bearish: string;
  bearishMuted: string;
  neutral: string;
  neutralMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  badgeBg: string;
  inputBg: string;
  inputBorder: string;
  shadow: string;
  overlay: string;
}

export const DarkThemeColors: ThemeColors = {
  background: '#0B0E14',
  cardBg: '#141A24',
  cardBgElevated: '#1B2230',
  modalBg: '#121721',
  border: '#242C3D',
  borderLight: '#2F3A50',
  primary: '#00D8F6', // Electric Cyan
  primaryMuted: 'rgba(0, 216, 246, 0.15)',
  secondary: '#7928CA',
  secondaryMuted: 'rgba(121, 40, 202, 0.15)',
  bullish: '#00E676', // Bright Green
  bullishMuted: 'rgba(0, 230, 118, 0.12)',
  bearish: '#FF5252', // Bright Red
  bearishMuted: 'rgba(255, 82, 82, 0.12)',
  neutral: '#FFA000',
  neutralMuted: 'rgba(255, 160, 0, 0.15)',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  badgeBg: '#1E293B',
  inputBg: '#111622',
  inputBorder: '#273145',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

export const LightThemeColors: ThemeColors = {
  background: '#F8FAFC', // Slate 50
  cardBg: '#FFFFFF', // Pure White
  cardBgElevated: '#F1F5F9', // Slate 100
  modalBg: '#FFFFFF',
  border: '#E2E8F0', // Slate 200
  borderLight: '#CBD5E1', // Slate 300
  primary: '#0284C7', // Sky 600 - High-contrast fintech blue
  primaryMuted: 'rgba(2, 132, 199, 0.12)',
  secondary: '#6D28D9', // Violet 700
  secondaryMuted: 'rgba(109, 40, 217, 0.12)',
  bullish: '#16A34A', // Green 600
  bullishMuted: 'rgba(22, 163, 74, 0.12)',
  bearish: '#DC2626', // Red 600
  bearishMuted: 'rgba(220, 38, 38, 0.12)',
  neutral: '#D97706', // Amber 600
  neutralMuted: 'rgba(217, 119, 6, 0.12)',
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  badgeBg: '#E2E8F0',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  shadow: 'rgba(15, 23, 42, 0.08)',
  overlay: 'rgba(15, 23, 42, 0.50)',
};

// Default fallback Colors
export const Colors = DarkThemeColors;

export const Typography = {
  fontFamily: undefined,
  h1: { fontSize: 26, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  mono: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.5 },
};
