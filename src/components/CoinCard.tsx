import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { CoinItem } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

export interface CoinCardProps {
  item: CoinItem;
  onPress: () => void;
}

export function CoinCard({ item, onPress }: CoinCardProps) {
  const theme = useTheme();
  const colors = theme ?? Colors.light;
  const isComposite = item.obverseImage === item.reverseImage;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      {/* 1. ÜST BİLGİ SATIRI (Medeniyet & Nadirlik Rozeti) */}
      <View style={styles.topRow}>
        <View style={styles.civBlock}>
          <Text style={[styles.civilization, { color: colors.primary }]}>
            {item.civilization.toUpperCase()}
          </Text>
          <Text style={[styles.periodText, { color: colors.textSecondary }]}>
            • {item.period}
          </Text>
        </View>

        <View
          style={[
            styles.rarityBadge,
            {
              backgroundColor: colors.primaryLight,
              borderColor: 'rgba(158, 123, 59, 0.25)',
            },
          ]}>
          <Ionicons name="sparkles" size={11} color={colors.primary} />
          <Text style={[styles.rarityText, { color: colors.primary }]}>
            {item.rarity}
          </Text>
        </View>
      </View>

      {/* 2. SİKKE BAŞLIĞI VE HÜKÜMDAR */}
      <Text numberOfLines={1} style={[styles.title, { color: colors.textPrimary }]}>
        {item.title}
      </Text>
      <Text numberOfLines={1} style={[styles.ruler, { color: colors.textSecondary }]}>
        {item.ruler}
      </Text>

      {/* 3. VİTRİN TEPSİSİ: 2 YUVARLAK SİKKE GÖRSELİ YAN YANA (AVERS & REVERS) */}
      <View
        style={[
          styles.coinTray,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.border,
          },
        ]}>
        {/* Ön Yüz (Avers) Dairesel Görsel */}
        <View style={styles.coinFaceWrapper}>
          <View
            style={[
              styles.circularCoinFrame,
              {
                borderColor: colors.primary,
                backgroundColor: colors.surface,
              },
            ]}>
            <Image
              source={{ uri: item.obverseImage }}
              style={isComposite ? styles.compositeLeft : styles.circularCoinImage}
              contentFit="cover"
              transition={200}
            />
          </View>
          <View
            style={[
              styles.faceLabelPill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.faceLabelText, { color: colors.textPrimary }]}>
              ÖN YÜZ (AVERS)
            </Text>
          </View>
        </View>

        {/* İki Sikke Arası Dekoratif Simge */}
        <View style={styles.connectorBlock}>
          <View style={[styles.connectorLine, { backgroundColor: colors.border }]} />
          <View
            style={[
              styles.connectorIconCircle,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Ionicons name="swap-horizontal" size={14} color={colors.primary} />
          </View>
          <View style={[styles.connectorLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Arka Yüz (Revers) Dairesel Görsel */}
        <View style={styles.coinFaceWrapper}>
          <View
            style={[
              styles.circularCoinFrame,
              {
                borderColor: colors.primary,
                backgroundColor: colors.surface,
              },
            ]}>
            <Image
              source={{ uri: item.reverseImage }}
              style={isComposite ? styles.compositeRight : styles.circularCoinImage}
              contentFit="cover"
              transition={200}
            />
          </View>
          <View
            style={[
              styles.faceLabelPill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.faceLabelText, { color: colors.textPrimary }]}>
              ARKA YÜZ (REVERS)
            </Text>
          </View>
        </View>
      </View>

      {/* 4. ALT SATIR: MATERYAL HAPI & MÜZAYEDE TAHMİNİ */}
      <View style={styles.footerRow}>
        {/* Materyal & Çap Rozeti */}
        <View
          style={[
            styles.specPill,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}>
          <Ionicons name="disc-outline" size={13} color={colors.primary} />
          <Text style={[styles.specText, { color: colors.textSecondary }]}>
            {item.material} • {item.weight} • {item.diameter}
          </Text>
        </View>

        {/* Tahmini Değer & İncele */}
        <View style={styles.priceContainer}>
          <Text style={[styles.pricePrefix, { color: colors.textSecondary }]}>
            Müzayede
          </Text>
          <Text style={[styles.priceValue, { color: colors.primary }]}>
            {item.estimatedValue.split('-')[0].trim()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing.xs + 2,
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  civBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: Spacing.xs,
  },
  civilization: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  periodText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 0.5,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
    lineHeight: 22,
  },
  ruler: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  coinTray: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginVertical: Spacing.xs,
  },
  coinFaceWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  circularCoinFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 8,
  },
  circularCoinImage: {
    width: '100%',
    height: '100%',
  },
  compositeLeft: {
    width: 200,
    height: 96,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  compositeRight: {
    width: 200,
    height: 96,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  faceLabelPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 0.5,
  },
  faceLabelText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  connectorBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
  },
  connectorLine: {
    width: 1,
    height: 14,
  },
  connectorIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    flex: 1,
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  pricePrefix: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
