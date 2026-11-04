import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { CoinCard } from '@/components/CoinCard';
import { BorderRadius, BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import { MOCK_COINS } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme ?? Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCivilization, setSelectedCivilization] = useState('Tümü');

  // Günün / Haftanın Nadir Eseri (Featured Hero)
  const featuredCoin = MOCK_COINS[0];

  // Arama ve Medeniyet Filtresi
  const filteredCoins = useMemo(() => {
    return MOCK_COINS.filter((coin) => {
      const sel = selectedCivilization.toLowerCase();
      const civ = coin.civilization.toLowerCase();
      const matchesCategory =
        selectedCivilization === 'Tümü' ||
        civ.includes(sel) ||
        sel.includes(civ) ||
        (sel.includes('yunan') && (civ.includes('yunan') || civ.includes('fenike'))) ||
        (sel.includes('islam') && (civ.includes('islam') || civ.includes('sasani') || civ.includes('baktriya')));

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        coin.title.toLowerCase().includes(q) ||
        coin.ruler.toLowerCase().includes(q) ||
        coin.civilization.toLowerCase().includes(q) ||
        coin.period.toLowerCase().includes(q) ||
        coin.material.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCivilization]);

  const handleCoinPress = (id: string) => {
    router.push(`/coin/${id}` as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />

      {/* 1. ÜST BAR & KARŞILAMA (HERO HEADER) */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandGroup}>
            <View
              style={[
                styles.brandLogoBox,
                { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}>
              <Ionicons name="diamond" size={17} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.brandEyebrow, { color: colors.primary }]}>
                KRALİYET & MÜZAYEDE ARŞİVİ
              </Text>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                NÜMİSMATİK KOLEKSİYONU
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* Sözlük Butonu */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push('/explore')}
              style={[
                styles.actionBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="book-outline" size={18} color={colors.primary} />
            </TouchableOpacity>

            {/* Bildirim Butonu */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.actionBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
              <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ferah Arama Çubuğu & Tarayıcı İkonu */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}>
          <Ionicons
            name="search-outline"
            size={19}
            color={colors.primary}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Sikke adı, hükümdar, darphane veya medeniyet..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.scanBtn} hitSlop={10}>
              <Ionicons name="scan-outline" size={19} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* SİKKE LİSTESİ (Ön & Arka Yüz Yan Yana Dairesel Kartlar) */}
      <FlatList
        data={filteredCoins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CoinCard item={item} onPress={() => handleCoinPress(item.id)} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.flatListContent,
          { paddingBottom: BottomTabInset + Spacing.xl + 20 },
        ]}
        ListHeaderComponent={
          <>
            {/* 2. GÜNÜN / HAFTANIN NADİR ESERİ (FEATURED HERO BANNER) */}
            {searchQuery === '' && selectedCivilization === 'Tümü' && (
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => handleCoinPress(featuredCoin.id)}
                style={[
                  styles.heroBanner,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                {/* Arka Plan Büyük Görseli ve Koyu Katman */}
                <Image
                  source={{ uri: featuredCoin.obverseImage }}
                  style={styles.heroBannerBgImage}
                  contentFit="cover"
                  transition={300}
                />
                <View style={styles.heroBannerOverlay} />

                {/* Banner İçerik */}
                <View style={styles.heroBannerContent}>
                  <View
                    style={[
                      styles.heroBadge,
                      {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primary,
                      },
                    ]}>
                    <Ionicons name="sparkles" size={12} color={colors.primary} />
                    <Text style={[styles.heroBadgeText, { color: colors.primary }]}>
                      HAFTANIN ESERİ • ÜNİK
                    </Text>
                  </View>

                  <Text style={[styles.heroCivilization, { color: colors.primaryLight }]}>
                    {featuredCoin.civilization.toUpperCase()}
                  </Text>
                  <Text numberOfLines={1} style={styles.heroTitle}>
                    {featuredCoin.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.heroRuler}>
                    {featuredCoin.ruler} ({featuredCoin.period})
                  </Text>

                  {/* Alt Satır: Değer ve İncele Butonu */}
                  <View style={styles.heroFooter}>
                    <View>
                      <Text style={styles.heroValueLabel}>MÜZAYEDE TAHMİNİ</Text>
                      <Text style={styles.heroValuePrice}>
                        {featuredCoin.estimatedValue}
                      </Text>
                    </View>

                    <View style={[styles.heroInspectBtn, { backgroundColor: colors.primary }]}>
                      <Text style={styles.heroInspectBtnText}>Eseri İncele</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* 3. HIZLI İSTATİSTİK ŞERİDİ */}
            <View
              style={[
                styles.statsStrip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <View style={styles.statBox}>
                <Ionicons name="albums-outline" size={18} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>3.400+</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Kayıtlı Eser
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statBox}>
                <Ionicons name="earth-outline" size={18} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>12</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Medeniyet
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statBox}>
                <Ionicons name="trending-up-outline" size={18} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>Canlı</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Müzayede
                </Text>
              </View>
            </View>

            {/* 4. DÖNEMLER VE MEDENİYETLER (HORIZONTAL STORY SLIDER) */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleBlock}>
                <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
                  TARİHSEL KRONOLOJİ
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Dönemler & Medeniyetler
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.civilizationsSlider}>
              {/* "Tümü" seçeneği */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedCivilization('Tümü')}
                style={styles.civCardWrapper}>
                <View
                  style={[
                    styles.civCircle,
                    selectedCivilization === 'Tümü'
                      ? {
                          borderColor: colors.primary,
                          backgroundColor: colors.primaryLight,
                          shadowColor: colors.primary,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 5,
                          elevation: 3,
                        }
                      : {
                          borderColor: colors.border,
                          backgroundColor: colors.surface,
                        },
                  ]}>
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color={selectedCivilization === 'Tümü' ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.civName,
                    selectedCivilization === 'Tümü'
                      ? { color: colors.primary, fontWeight: '700' }
                      : { color: colors.textSecondary, fontWeight: '500' },
                  ]}>
                  Tümü
                </Text>
                <Text style={[styles.civEra, { color: colors.textMuted }]}>
                  Tüm Çağlar
                </Text>
              </TouchableOpacity>

              {/* Medeniyet Listesi */}
              {CATEGORIES.map((civ) => {
                const isActive =
                  selectedCivilization === civ.name || selectedCivilization === civ.id;
                return (
                  <TouchableOpacity
                    key={civ.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedCivilization(civ.name)}
                    style={styles.civCardWrapper}>
                    <View
                      style={[
                        styles.civCircle,
                        isActive
                          ? {
                              borderColor: colors.primary,
                              backgroundColor: colors.primaryLight,
                              shadowColor: colors.primary,
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.25,
                              shadowRadius: 5,
                              elevation: 3,
                            }
                          : {
                              borderColor: colors.border,
                              backgroundColor: colors.surface,
                            },
                      ]}>
                      <Image
                        source={{ uri: civ.image }}
                        style={styles.civCircleImage}
                        contentFit="cover"
                        transition={200}
                      />
                    </View>

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.civName,
                        isActive
                          ? { color: colors.primary, fontWeight: '700' }
                          : { color: colors.textSecondary, fontWeight: '500' },
                      ]}>
                      {civ.shortName || civ.name}
                    </Text>
                    <Text style={[styles.civEra, { color: colors.textMuted }]}>
                      {civ.coinCount} Eser
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 5. VİTRİN KOLEKSİYONLARI BAŞLIĞI */}
            <View style={styles.gridHeaderRow}>
              <View>
                <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>
                  MÜZAYEDE KATALOĞU
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Öne Çıkan Koleksiyonlar (Ön & Arka Yüz)
                </Text>
              </View>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}>
                <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                  {filteredCoins.length} Eser
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={44} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Eşleşen Eser Bulunamadı
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Seçilen medeniyete veya arama terimine uygun sikke arşivi bulunamadı.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedCivilization('Tümü');
              }}
              style={[
                styles.resetBtn,
                { borderColor: colors.primary, backgroundColor: colors.primaryLight },
              ]}>
              <Text style={[styles.resetBtnText, { color: colors.primary }]}>
                Filtreleri Sıfırla
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    paddingBottom: Spacing.xs,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandLogoBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, default: 8 }),
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 2,
  },
  scanBtn: {
    padding: 2,
  },
  flatListContent: {
    paddingHorizontal: Spacing.md,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  heroBanner: {
    width: '100%',
    height: 190,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: Spacing.sm,
    justifyContent: 'flex-end',
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  heroBannerBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.45,
  },
  heroBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 29, 32, 0.72)',
  },
  heroBannerContent: {
    padding: Spacing.md,
    zIndex: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroCivilization: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
    color: '#FFFFFF',
  },
  heroRuler: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: Spacing.xs,
    color: '#D1D5DB',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  heroValueLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#9CA3AF',
  },
  heroValuePrice: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: '#F5EEDB',
  },
  heroInspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  heroInspectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm + 4,
    marginBottom: Spacing.xs + 2,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  civilizationsSlider: {
    gap: 12,
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.md,
  },
  civCardWrapper: {
    alignItems: 'center',
    width: 68,
  },
  civCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  civCircleImage: {
    width: '100%',
    height: '100%',
  },
  civName: {
    fontSize: 11,
    textAlign: 'center',
  },
  civEra: {
    fontSize: 9,
    marginTop: 1,
    textAlign: 'center',
  },
  gridHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.md + 4,
    marginBottom: Spacing.sm,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 0.5,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  resetBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
