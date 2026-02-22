// Approcure – Shared design tokens (Mobile)
// Single source of truth for all colors, spacing, typography, and radii.

export const colors = {
  bg: '#FFFFFF',
  surface: '#F7F8FA',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  primary: '#ff5a00',
  primaryHover: '#e64f00',
  primarySoft: '#FFF1E8',
  success: '#1E7F4F',
  successSoft: '#E9F5EF',
  warning: '#C47A00',
  warningSoft: '#FFF7E6',
  danger: '#C0362C',
  dangerSoft: '#FDECEC',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
} as const;

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const fontFamily = {
  sans: 'IBMPlexSans_400Regular',
  sansMedium: 'IBMPlexSans_500Medium',
  sansSemibold: 'IBMPlexSans_600SemiBold',
  sansBold: 'IBMPlexSans_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemibold: 'IBMPlexMono_600SemiBold',
};
