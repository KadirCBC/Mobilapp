import { Platform } from 'react-native';

/**
 * Modern & Ferah Müze / Galeri Konseptli Renk Paleti.
 * Karakteristik: Açık mermer zemin, saf beyaz kart yüzeyleri ve Antik Bronz / Mat Altın aksanları.
 */
export const Colors = {
  light: {
    // Yüzey ve Zemin Renkleri
    background: '#F8F9FA', // Açık mermer / off-white
    surface: '#FFFFFF', // Saf beyaz kartlar
    surfaceSubtle: '#F1F3F5', // Hafif gri kutular / arama çubuğu zeminleri
    surfaceElevated: '#FFFFFF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F1F3F5',

    // Birincil Antik Vurgular
    primary: '#9E7B3B', // Antik Bronz / Mat Altın vurgusu
    primaryLight: '#F5EEDB', // Hafif altın tonlu rozet zeminleri
    gold: '#9E7B3B',
    goldLight: '#B8924D',
    goldDark: '#7A5E2A',
    accent: '#9E7B3B',

    // Tipografi Renkleri
    textPrimary: '#1A1D20', // Antrasit / koyu grafit ana metin
    text: '#1A1D20',
    textSecondary: '#6C757D', // Gri alt metinler
    textMuted: '#ADB5BD',
    textGold: '#9E7B3B',

    // Kenarlık ve Vurgular
    border: '#E9ECEF', // İnce zarif kenarlıklar
    borderGold: 'rgba(158, 123, 59, 0.25)',

    // Durum ve İkaz Renkleri
    success: '#2B8A3E',
    warning: '#D97706',
    error: '#E03131',
    info: '#1971C2',
  },
  dark: {
    // Müze teması gereği tutarlı açık mermer stilini korur
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F3F5',
    surfaceElevated: '#FFFFFF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F1F3F5',

    primary: '#9E7B3B',
    primaryLight: '#F5EEDB',
    gold: '#9E7B3B',
    goldLight: '#B8924D',
    goldDark: '#7A5E2A',
    accent: '#9E7B3B',

    textPrimary: '#1A1D20',
    text: '#1A1D20',
    textSecondary: '#6C757D',
    textMuted: '#ADB5BD',
    textGold: '#9E7B3B',

    border: '#E9ECEF',
    borderGold: 'rgba(158, 123, 59, 0.25)',

    success: '#2B8A3E',
    warning: '#D97706',
    error: '#E03131',
    info: '#1971C2',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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

  // Geriye dönük uyumluluk ölçeği
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
