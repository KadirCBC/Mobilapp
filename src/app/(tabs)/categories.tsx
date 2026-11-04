import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { CoinCard } from '@/components/CoinCard';
import { BorderRadius, BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { CATEGORIES, CivilizationCategory } from '@/data/categories';
import { MOCK_COINS } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;

export default function CategoriesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme ?? Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCivilization, setSelectedCivilization] = useState<CivilizationCategory | null>(null);

  // Arama filtresi
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.period.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Seçilen medeniyete ait sikkeler
  const civilizationCoins = useMemo(() => {
    if (!selectedCivilization) return [];
    const sel = selectedCivilization.name.toLowerCase();
    const short = selectedCivilization.shortName.toLowerCase();
    return MOCK_COINS.filter((c) => {
      const civ = c.civilization.toLowerCase();
      return (
        civ.includes(sel) ||
        civ.includes(short) ||
        (short.includes('yunan') && (civ.includes('yunan') || civ.includes('fenike'))) ||
        (short.includes('islam') && (civ.includes('islam') || civ.includes('sasani') || civ.includes('baktriya')))
      );
    });
  }, [selectedCivilization]);

  const handleCoinPress = (id: string) => {
    router.push(`/coin/${id}` as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* 1. ÜST BAŞLIK & ARAMA */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={[styles.headerEyebrow, { color: colors.primary }]}>
              TARİHSEL KRONOLOJİ
            </Text>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Medeniyetler & Çağlar
            </Text>
          </View>
          <View
            style={[
              styles.countPill,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}>
            <Text style={[styles.countPillText, { color: colors.primary }]}>
              {CATEGORIES.length} Medeniyet
            </Text>
          </View>
        </View>

        {/* Arama Kutusu */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}>
          <Ionicons name="search-outline" size={18} color={colors.primary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Medeniyet veya dönem ara..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Seçili Medeniyet Aktif Filtre Şeridi */}
        {selectedCivilization && (
          <View style={styles.activeFilterBar}>
            <Text style={[styles.activeFilterLabel, { color: colors.textSecondary }]}>
              Filtrelenen Medeniyet:
            </Text>
            <View
              style={[
                styles.activeFilterChip,
                { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}>
              <Text style={[styles.activeFilterChipText, { color: colors.primary }]}>
                {selectedCivilization.name}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedCivilization(null)}
                hitSlop={8}>
                <Ionicons name="close" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 2. İÇERİK: SEÇİLİ MEDENİYET SİKKELERİ VEYA MEDENİYET KARTLARI */}
      {selectedCivilization ? (
        <FlatList
          data={civilizationCoins}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.coinListContent,
            { paddingBottom: BottomTabInset + Spacing.xxl },
          ]}
          ListHeaderComponent={
            <View style={styles.civilizationBanner}>
              <Image
                source={{ uri: selectedCivilization.image }}
                style={styles.civilizationBannerImg}
                contentFit="cover"
              />
              <View style={styles.civilizationBannerOverlay} />
              <View style={styles.civilizationBannerContent}>
                <Text style={styles.civilizationBannerPeriod}>
                  {selectedCivilization.period}
                </Text>
                <Text style={styles.civilizationBannerTitle}>
                  {selectedCivilization.name}
                </Text>
                <Text style={styles.civilizationBannerDesc}>
                  {selectedCivilization.description}
                </Text>
                <View style={styles.bannerStatsRow}>
                  <Ionicons name="disc-outline" size={14} color="#D4AF37" />
                  <Text style={styles.bannerStatsText}>
                    Bu medeniyete ait {civilizationCoins.length} eser listeleniyor
                  </Text>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <CoinCard item={item} onPress={() => handleCoinPress(item.id)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="albums-outline" size={44} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Bu Medeniyete Ait Eser Yok
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Seçilen medeniyet için henüz arşiv kaydı girilmemiş.
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedCivilization(null)}
                style={[styles.resetButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.resetButtonText}>Tüm Medeniyetlere Dön</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.categoryListContent,
            { paddingBottom: BottomTabInset + Spacing.xxl },
          ]}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setSelectedCivilization(item)}
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                {/* Medeniyet Arkeoloji Fotoğrafı */}
                <View style={styles.cardImageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                    contentFit="cover"
                    transition={250}
                  />
                  <View style={styles.cardImageOverlay} />

                  {/* Rozetler */}
                  <View style={styles.cardBadgeRow}>
                    <View style={styles.periodBadge}>
                      <Text style={styles.periodBadgeText}>{item.period}</Text>
                    </View>
                    <View style={styles.coinCountBadge}>
                      <Ionicons name="disc-outline" size={12} color="#FFFFFF" />
                      <Text style={styles.coinCountBadgeText}>{item.coinCount} Eser</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>

                {/* Açıklama ve İncele Çubuğu */}
                <View style={styles.cardBody}>
                  <Text numberOfLines={2} style={[styles.cardDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={[styles.inspectLink, { color: colors.primary }]}>
                      Sikkeleri Listele
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? ANDROID_TOP_SPACING : 48,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginTop: 2,
  },
  countPill: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 8,
  },
  activeFilterLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  activeFilterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryListContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  categoryCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImageWrapper: {
    height: 140,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 29, 32, 0.48)',
  },
  cardBadgeRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  periodBadgeText: {
    color: '#F8F9FA',
    fontSize: 10,
    fontWeight: '700',
  },
  coinCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  coinCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardBody: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  inspectLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  coinListContent: {
    padding: Spacing.md,
  },
  civilizationBanner: {
    height: 160,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  civilizationBannerImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  civilizationBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 29, 32, 0.6)',
  },
  civilizationBannerContent: {
    gap: 4,
  },
  civilizationBannerPeriod: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '700',
  },
  civilizationBannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  civilizationBannerDesc: {
    fontSize: 12,
    color: '#E9ECEF',
    lineHeight: 16,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  bannerStatsText: {
    fontSize: 11,
    color: '#F8F9FA',
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

