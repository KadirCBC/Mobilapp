import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { CoinItem } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

export interface CoinCardProps {
  item: CoinItem;
  onPress: () => void;
}

export function CoinCard({ item, onPress }: CoinCardProps) {
  const theme = useTheme();
  // Müze/galeri estetiği için temayı kullanırken dark paleti temel alır
  const colors = theme ?? Colors.dark;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      {/* Sol: Kare Sikke Görseli */}
      <View
        style={[
          styles.imageWrapper,
          {
            backgroundColor: colors.background,
            borderColor: colors.borderGold,
          },
        ]}>
        <Image
          source={{ uri: item.obverseImage }}
          style={styles.image}
          contentFit="cover"
          transition={250}
        />
      </View>

      {/* Sağ: Bilgi Alanı */}
      <View style={styles.content}>
        {/* Medeniyet Başlığı (Altın rengi) */}
        <Text
          numberOfLines={1}
          style={[styles.civilization, { color: colors.gold }]}>
          {item.civilization.toUpperCase()}
        </Text>

        {/* Sikke Başlığı */}
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>

        {/* Hükümdar / Lider */}
        <Text
          numberOfLines={1}
          style={[styles.ruler, { color: colors.textSecondary }]}>
          {item.ruler}
        </Text>

        {/* Alt Satır: Materyal Rozeti ve Basım Dönemi */}
        <View style={styles.footerRow}>
          {/* Materyal Rozeti (Badge) */}
          <View
            style={[
              styles.badge,
              {
                borderColor: colors.borderGold,
                backgroundColor: 'rgba(212, 175, 55, 0.12)',
              },
            ]}>
            <Text style={[styles.badgeText, { color: colors.goldLight }]}>
              {item.material}
            </Text>
          </View>

          {/* Basım Dönemi */}
          <Text
            numberOfLines={1}
            style={[styles.period, { color: colors.textMuted }]}>
            {item.period}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    width: 86,
    height: 86,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
    minHeight: 86,
  },
  civilization: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  ruler: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  period: {
    fontSize: 11,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
});

