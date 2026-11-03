import { Platform } from 'react-native';

/**
 * Müze ve Antik Galeri konseptli koyu tema renk paleti.
 * Birincil odak: #121417 (Koyu Arka Plan), #1E2228 (Kart Yüzeyi), #D4AF37 (Antik Altın Aksan)
 */
export const Colors = {
  dark: {
    // Yüzey ve Arka Plan
    background: '#121417',
    backgroundElement: '#1E2228',
    backgroundSelected: '#2A303A',
    surface: '#1E2228',
    surfaceElevated: '#252B34',

    // Antik Altın Aksanlar (Primary)
    primary: '#D4AF37',
    gold: '#D4AF37',
    goldLight: '#ECD57B',
    goldDark: '#997E25',
    accent: '#D4AF37',

    // Metin Renkleri
    text: '#F5F6F8',
    textSecondary: '#9EA3AE',
    textMuted: '#676E7B',
    textGold: '#D4AF37',

    // Kenarlık ve Vurgular
    border: '#2C323D',
    borderGold: 'rgba(212, 175, 55, 0.35)',

    // Durum ve İkaz Renkleri
    success: '#34D399',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#60A5FA',
  },
  light: {
    // Galeri Müze Koyu Tema Garantisi (Cihaz açık modda olsa bile konsepti korur)
    background: '#121417',
    backgroundElement: '#1E2228',
    backgroundSelected: '#2A303A',
    surface: '#1E2228',
    surfaceElevated: '#252B34',

    primary: '#D4AF37',
    gold: '#D4AF37',
    goldLight: '#ECD57B',
    goldDark: '#997E25',
    accent: '#D4AF37',

    text: '#F5F6F8',
    textSecondary: '#9EA3AE',
    textMuted: '#676E7B',
    textGold: '#D4AF37',

    border: '#2C323D',
    borderGold: 'rgba(212, 175, 55, 0.35)',

    success: '#34D399',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#60A5FA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.dark & keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  // Standart boşluk ölçeği
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Geriye dönük uyumluluk için mevcut ölçek
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
