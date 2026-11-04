import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { CoinCard } from '@/components/CoinCard';
import { FilterModal } from '@/components/FilterModal';
import { BorderRadius, BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import {
  CIVILIZATIONS,
  DEFAULT_FILTER_STATE,
  FilterState,
  METALS,
  MINTS_AND_REGIONS,
  createDefaultFilterState,
} from '@/data/filterOptions';
import { CoinItem, MOCK_COINS } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

const ANDROID_TOP_SPACING = (RNStatusBar.currentHeight ?? 24) + 8;

export interface SmartPresetItem {
  id: string;
  label: string;
}

export const SMART_PRESETS: SmartPresetItem[] = [
  { id: 'all', label: 'Tüm Arşiv' },
  { id: 'museum_rare', label: '👑 Müzelik Nadirler' },
  { id: 'pure_gold', label: '🟡 Saf Altınlar' },
  { id: 'ancient_rome', label: '🏛️ Antik Roma' },
  { id: 'alexander_series', label: '⚡ Büyük İskender Serisi' },
  { id: 'over_50k', label: '🏷️ 50.000₺ Üzeri' },
];

interface QuickFilterItem {
  id: string;
  label: string;
  type: 'all' | 'metal' | 'civilization';
  value?: string;
  dotColor?: string;
}

const QUICK_FILTERS: QuickFilterItem[] = [
  { id: 'all', label: 'Tümü', type: 'all' },
  { id: 'gold', label: 'Altın', type: 'metal', value: 'gold', dotColor: '#D4AF37' },
  { id: 'silver', label: 'Gümüş', type: 'metal', value: 'silver', dotColor: '#CBD5E1' },
  { id: 'bronze', label: 'Bronz', type: 'metal', value: 'bronze', dotColor: '#CD7F32' },
  { id: 'roma', label: 'Roma', type: 'civilization', value: 'roman-empire' },
  { id: 'greek', label: 'Greek (Antik Yunan)', type: 'civilization', value: 'greek' },
  { id: 'bizans', label: 'Bizans', type: 'civilization', value: 'byzantine' },
  { id: 'osmanli', label: 'Osmanlı', type: 'civilization', value: 'ottoman' },
];

function parseCoinValue(val: string): number {
  const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ civ?: string; mint?: string; ruler?: string }>();
  const theme = useTheme();
  const colors = theme ?? Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCivilization, setSelectedCivilization] = useState(params.civ ?? 'Tümü');
  const [selectedPreset, setSelectedPreset] = useState<string>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  useEffect(() => {
    if (params.ruler) {
      setSearchQuery(params.ruler);
      setSelectedCivilization('Tümü');
      setSelectedPreset('all');
      router.setParams({ ruler: undefined });
    }
  }, [params.ruler]);

  useEffect(() => {
    if (params.civ) {
      setSelectedCivilization(params.civ);
      router.setParams({ civ: undefined });
    }
  }, [params.civ]);

  useEffect(() => {
    if (params.mint) {
      const targetMint = params.mint;
      if (targetMint === 'Tümü') {
        setFilters((prev) => ({ ...prev, mints: [] }));
      } else {
        // MINTS_AND_REGIONS içindeki tam isimle eşleştir (örn. 'Sardis' -> 'Sardis (Salihli)')
        const matched = MINTS_AND_REGIONS.find((m) => {
          const root = m.split('(')[0].trim().toLowerCase();
          const targetRoot = targetMint.split('(')[0].trim().toLowerCase();
          return root === targetRoot || root.startsWith(targetRoot) || targetRoot.startsWith(root);
        });
        const resolvedMint = matched || targetMint;

        setFilters(() => ({
          ...createDefaultFilterState(),
          mints: [resolvedMint],
        }));
        setSelectedCivilization('Tümü');
        setSelectedPreset('all');
      }
      // Parametreyi sıfırla ki filtre temizlendiğinde veya sayfa yenilendiğinde tekrar tetiklenmesin
      router.setParams({ mint: undefined });
    }
  }, [params.mint]);

  // Günün / Haftanın Nadir Eseri (Featured Hero)
  const featuredCoin = MOCK_COINS[0];

  // Akıllı filtre çipine tıklandığında
  const handlePresetPress = (presetId: string) => {
    if (selectedPreset === presetId && presetId !== 'all') {
      setSelectedPreset('all');
    } else {
      setSelectedPreset(presetId);
    }
  };

  const handleClearPreset = () => {
    setSelectedPreset('all');
  };

  // Aktif filtre sayısı (Rozette gösterilir)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedPreset !== 'all') count += 1;
    if (filters.metals.length > 0) count += filters.metals.length;
    if (filters.civilizations.length > 0) count += filters.civilizations.length;
    if (filters.eras.length > 0) count += filters.eras.length;
    if (filters.mints && filters.mints.length > 0) count += filters.mints.length;
    if (filters.conditions && filters.conditions.length > 0) count += filters.conditions.length;
    if (filters.hasImageBackAndFront) count += 1;
    if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
    if (filters.minYear !== null || filters.maxYear !== null) count += 1;
    if (filters.sortBy !== 'name') count += 1;
    return count;
  }, [filters, selectedPreset]);

  // Hızlı filtre çipine tıklandığında
  const handleQuickFilterPress = (chip: QuickFilterItem) => {
    if (chip.type === 'all') {
      setFilters(createDefaultFilterState());
      setSelectedCivilization('Tümü');
      setSelectedPreset('all');
      router.setParams({ mint: undefined, civ: undefined });
      return;
    }

    if (chip.type === 'metal' && chip.value) {
      setFilters((prev) => {
        const hasMetal = prev.metals.includes(chip.value!);
        return {
          ...prev,
          metals: hasMetal
            ? prev.metals.filter((m) => m !== chip.value)
            : [...prev.metals, chip.value!],
        };
      });
    }

    if (chip.type === 'civilization' && chip.value) {
      setFilters((prev) => {
        const hasCiv = prev.civilizations.includes(chip.value!);
        return {
          ...prev,
          civilizations: hasCiv
            ? prev.civilizations.filter((c) => c !== chip.value)
            : [...prev.civilizations, chip.value!],
        };
      });
    }
  };

  // Hızlı filtre çipinin aktifliği
  const getIsChipActive = (chip: QuickFilterItem) => {
    if (chip.type === 'all') {
      return (
        filters.metals.length === 0 &&
        filters.civilizations.length === 0 &&
        filters.eras.length === 0 &&
        selectedCivilization === 'Tümü'
      );
    }
    if (chip.type === 'metal' && chip.value) {
      return filters.metals.includes(chip.value);
    }
    if (chip.type === 'civilization' && chip.value) {
      return (
        filters.civilizations.includes(chip.value) ||
        (chip.id === 'roma' && selectedCivilization.toLowerCase().includes('roma')) ||
        (chip.id === 'greek' && selectedCivilization.toLowerCase().includes('yunan')) ||
        (chip.id === 'bizans' && selectedCivilization.toLowerCase().includes('bizans')) ||
        (chip.id === 'osmanli' && selectedCivilization.toLowerCase().includes('osmanlı'))
      );
    }
    return false;
  };

  // Tüm filtreleri sıfırla
  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCivilization('Tümü');
    setSelectedPreset('all');
    setFilters(createDefaultFilterState());
    router.setParams({ mint: undefined, civ: undefined });
  };

  // Çok Kriterli Gelişmiş Süzme (Akıllı Rozetler + Arama + Madenler + Medeniyetler + Çağlar + Sıralama)
  const filteredCoins = useMemo(() => {
    let list = MOCK_COINS.filter((coin) => {
      // 0. Akıllı Filtre Rozetleri (Smart Presets)
      if (selectedPreset !== 'all') {
        if (selectedPreset === 'museum_rare') {
          const rarityUpper = coin.rarity.toUpperCase();
          const condUpper = (coin.condition || '').toUpperCase();
          const isMuseum =
            rarityUpper.includes('R2') ||
            rarityUpper.includes('R3') ||
            rarityUpper.includes('R4') ||
            rarityUpper.includes('R5') ||
            rarityUpper.includes('MÜZELİK') ||
            rarityUpper.includes('ÜNİK') ||
            condUpper.includes('FDC') ||
            condUpper.includes('MS') ||
            condUpper.includes('XF') ||
            condUpper.includes('EF');
          if (!isMuseum) return false;
        } else if (selectedPreset === 'pure_gold') {
          const matLower = coin.material.toLowerCase();
          const isGold =
            matLower.includes('altın') ||
            matLower.includes('stater') ||
            matLower.includes('solidus') ||
            matLower.includes('dinar') ||
            matLower.includes('au');
          if (!isGold) return false;
        } else if (selectedPreset === 'ancient_rome') {
          const civLower = coin.civilization.toLowerCase();
          const rulerLower = coin.ruler.toLowerCase();
          const descLower = coin.description.toLowerCase();
          const isRome =
            civLower.includes('roma') ||
            rulerLower.includes('roma') ||
            rulerLower.includes('nero') ||
            rulerLower.includes('vespasian') ||
            rulerLower.includes('titus') ||
            rulerLower.includes('caesar') ||
            rulerLower.includes('severus') ||
            rulerLower.includes('augustus') ||
            rulerLower.includes('domitian') ||
            descLower.includes('roma');
          if (!isRome) return false;
        } else if (selectedPreset === 'alexander_series') {
          const textScope = `${coin.title} ${coin.ruler} ${coin.civilization} ${coin.period} ${coin.description}`.toLowerCase();
          const isAlex =
            textScope.includes('iskender') ||
            textScope.includes('alexander') ||
            textScope.includes('makedon') ||
            textScope.includes('lysimachos') ||
            textScope.includes('aleksandros');
          if (!isAlex) return false;
        } else if (selectedPreset === 'over_50k') {
          // 50.000 TL Üzeri (USD karşılığı yaklaşık ~1,300$+ veya numericPrice * 38 >= 50000)
          const valInUSD = coin.numericPrice ?? parseCoinValue(coin.estimatedValue);
          const isOver50k = valInUSD * 38 >= 50000 || valInUSD >= 1300;
          if (!isOver50k) return false;
        }
      }

      // 1. Metin araması
      const q = searchQuery.trim().toLowerCase();
      if (q !== '') {
        const matchesQuery =
          coin.title.toLowerCase().includes(q) ||
          coin.ruler.toLowerCase().includes(q) ||
          coin.civilization.toLowerCase().includes(q) ||
          coin.period.toLowerCase().includes(q) ||
          coin.material.toLowerCase().includes(q) ||
          coin.description.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Madenler Dizisi (filters.metals)
      if (filters.metals.length > 0) {
        const coinMat = coin.material.toLowerCase();
        const matchesMetal = filters.metals.some((metalId) => {
          const metalOpt = METALS.find((m) => m.id === metalId);
          if (!metalOpt) return false;
          return (
            coinMat.includes(metalOpt.code.toLowerCase()) ||
            coinMat.includes(metalOpt.name.toLowerCase().split(' ')[0]) ||
            (metalOpt.code === 'AU' && (coinMat.includes('altın') || coinMat.includes('stater') || coinMat.includes('solidus'))) ||
            (metalOpt.code === 'AR' && (coinMat.includes('gümüş') || coinMat.includes('denarius') || coinMat.includes('tetradrahmi') || coinMat.includes('drahmi'))) ||
            (metalOpt.code === 'AE' && (coinMat.includes('bronz') || coinMat.includes('bakır') || coinMat.includes('follis') || coinMat.includes('sestertius'))) ||
            (metalOpt.code === 'EL' && coinMat.includes('elektrum')) ||
            (metalOpt.code === 'BI' && coinMat.includes('bilyon'))
          );
        });
        if (!matchesMetal) return false;
      }

      // 3. Medeniyetler Dizisi (filters.civilizations) & Hızlı Medeniyet Seçimi
      if (filters.civilizations.length > 0) {
        const coinCiv = coin.civilization.toLowerCase();
        const matchesCiv = filters.civilizations.some((civId) => {
          if (civId === 'greek') {
            return coinCiv.includes('yunan') || coinCiv.includes('sicilya') || coinCiv.includes('grek') || coinCiv.includes('makedonya');
          }
          if (civId === 'roman-empire' || civId === 'roman-republic') {
            return coinCiv.includes('roma');
          }
          if (civId === 'byzantine') {
            return coinCiv.includes('bizans');
          }
          if (civId === 'macedon') {
            return coinCiv.includes('makedonya');
          }
          if (civId === 'lydia') {
            return coinCiv.includes('lidya');
          }
          if (civId === 'seljuk') {
            return coinCiv.includes('selçuklu') || coinCiv.includes('islam');
          }
          if (civId === 'ottoman') {
            return coinCiv.includes('osmanlı');
          }
          const opt = CIVILIZATIONS.find((c) => c.id === civId);
          return opt ? coinCiv.includes(opt.name.toLowerCase()) : false;
        });
        if (!matchesCiv) return false;
      } else if (selectedCivilization !== 'Tümü') {
        const sel = selectedCivilization.toLowerCase();
        const civ = coin.civilization.toLowerCase();
        const matchesSingleCiv =
          civ.includes(sel) ||
          sel.includes(civ) ||
          (sel.includes('yunan') && (civ.includes('yunan') || civ.includes('fenike') || civ.includes('sicilya'))) ||
          (sel.includes('islam') && (civ.includes('islam') || civ.includes('sasani') || civ.includes('selçuklu')));
        if (!matchesSingleCiv) return false;
      }

      // 4. Tarihsel Çağlar (filters.eras)
      if (filters.eras.length > 0) {
        const searchScope = `${coin.period} ${coin.description} ${coin.ruler}`.toLowerCase();
        const matchesEra = filters.eras.some((eraName) => {
          const root = eraName.replace('Dönem', '').replace('Çağ', '').trim().toLowerCase();
          return searchScope.includes(root);
        });
        if (!matchesEra) return false;
      }

      // 5. Darphaneler ve Bölgeler (filters.mints)
      if (filters.mints && filters.mints.length > 0) {
        const coinMint = (coin.mint || '').toLowerCase();
        const matchesMint = filters.mints.some((m) => {
          const keyword = m.split('(')[0].trim().toLowerCase();
          return coinMint.includes(keyword) || coin.description.toLowerCase().includes(keyword);
        });
        if (!matchesMint) return false;
      }

      // 6. Kondisyon Derecesi (filters.conditions)
      if (filters.conditions && filters.conditions.length > 0) {
        const coinCond = (coin.condition || '').toLowerCase();
        const matchesCondition = filters.conditions.some((c) => {
          const code = c.split('/')[0].trim().toLowerCase();
          return coinCond.includes(code);
        });
        if (!matchesCondition) return false;
      }

      // 7. Ön ve Arka Yüz Görseli Eksiksiz Olanlar
      if (filters.hasImageBackAndFront) {
        if (!coin.obverseImage || !coin.reverseImage) return false;
      }

      // 8. Fiyat Aralığı
      if (filters.minPrice !== null || filters.maxPrice !== null) {
        const price = coin.numericPrice ?? parseCoinValue(coin.estimatedValue);
        if (filters.minPrice !== null && price < filters.minPrice) return false;
        if (filters.maxPrice !== null && price > filters.maxPrice) return false;
      }

      return true;
    });

    // 5. Sıralama (filters.sortBy)
    if (filters.sortBy === 'name') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    } else if (filters.sortBy === 'value_desc') {
      list = [...list].sort((a, b) => parseCoinValue(b.estimatedValue) - parseCoinValue(a.estimatedValue));
    } else if (filters.sortBy === 'value_asc') {
      list = [...list].sort((a, b) => parseCoinValue(a.estimatedValue) - parseCoinValue(b.estimatedValue));
    }

    return list;
  }, [searchQuery, filters, selectedCivilization, selectedPreset]);

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
            <Image
              source={require('../../../assets/images/brand-logo.png')}
              style={styles.brandLogoImage}
              contentFit="contain"
              priority="high"
            />
          </View>

          <View style={styles.headerRightCol}>
            <View style={styles.headerActions}>
              {/* Hanedanlar & İmparatorlar Soyağacı Butonu */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/dynasties' as any)}
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <Ionicons name="git-network-outline" size={17} color={colors.primary} />
              </TouchableOpacity>

              {/* Antik Darphaneler Atlası Harita Butonu */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/map')}
                style={[
                  styles.actionBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <Ionicons name="map-outline" size={17} color={colors.primary} />
              </TouchableOpacity>

              {/* Sözlük Butonu */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => router.push('/(tabs)/glossary' as any)}
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

            {/* Sayfanın Sağ Üstünde Toplam Listelenen Eser Sayısı Rozeti */}
            <View
              style={[
                styles.topCountBadge,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Ionicons name="layers-outline" size={11} color={colors.primary} />
              <Text style={[styles.topCountBadgeText, { color: colors.textSecondary }]}>
                Gösterilen:{' '}
                <Text style={[styles.topCountBadgeHighlight, { color: colors.primary }]}>
                  {filteredCoins.length}
                </Text>{' '}
                / {MOCK_COINS.length} Eser
              </Text>
            </View>
          </View>
        </View>

        {/* 2. ARAMA ÇUBUĞU VE FİLTRELE BUTONU SATIRI */}
        <View style={styles.searchFilterRow}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.primary}
              style={styles.searchIcon}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Sikke, hükümdar, darphane veya medeniyet..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
                <Ionicons name="close-circle" size={17} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filtrele Butonu & Sayaç Rozeti */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFilterModalVisible(true)}
            style={[
              styles.filterBtn,
              activeFilterCount > 0
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}>
            <Ionicons
              name="options-outline"
              size={19}
              color={activeFilterCount > 0 ? '#FFFFFF' : colors.primary}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 3. AKILLI FİLTRE ROZETLERİ (SMART PRESETS) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetScrollContainer}>
          {SMART_PRESETS.map((preset) => {
            const isActive = selectedPreset === preset.id;
            const isAll = preset.id === 'all';

            return (
              <TouchableOpacity
                key={preset.id}
                activeOpacity={0.8}
                onPress={() => handlePresetPress(preset.id)}
                style={[
                  styles.presetChip,
                  isActive
                    ? [styles.presetChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
                    : [styles.presetChipInactive, { backgroundColor: colors.surface, borderColor: colors.border }],
                ]}>
                <Text
                  style={[
                    styles.presetChipText,
                    isActive
                      ? styles.presetChipTextActive
                      : [styles.presetChipTextInactive, { color: colors.textPrimary }],
                  ]}>
                  {preset.label}
                </Text>

                {isActive && !isAll && (
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleClearPreset();
                    }}
                    style={styles.presetCloseBtn}>
                    <Ionicons name="close" size={11} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
            {searchQuery === '' && selectedCivilization === 'Tümü' && activeFilterCount === 0 && (
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

            {/* ANTİK DARPHANELER ATLASI MODÜLÜ (HARİTA BANNERI) */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => router.push('/map')}
              style={[
                styles.atlasCardBanner,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.atlasCardInner}>
                <View style={[styles.atlasCompassCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="compass" size={24} color={colors.primary} />
                </View>

                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={styles.atlasTagRow}>
                    <Ionicons name="map-outline" size={11} color={colors.primary} />
                    <Text style={[styles.atlasTagText, { color: colors.primary }]}>
                      İNTERAKTİF COĞRAFYA
                    </Text>
                  </View>
                  <Text style={[styles.atlasCardTitle, { color: colors.textPrimary }]}>
                    Antik Darphaneler Atlası
                  </Text>
                  <Text style={[styles.atlasCardSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                    Sardis, Efes, Roma, Bergama ve İskenderiye para merkezlerini haritada keşfedin.
                  </Text>
                </View>

                <View style={[styles.atlasArrowBtn, { backgroundColor: colors.primary }]}>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>

            {/* HANEDANLAR & İMPARATORLAR SOYAĞACI BANNERI */}
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => router.push('/dynasties' as any)}
              style={[
                styles.atlasCardBanner,
                { backgroundColor: colors.surface, borderColor: colors.border, marginTop: Spacing.sm },
              ]}>
              <View style={styles.atlasCardInner}>
                <View style={[styles.atlasCompassCircle, { backgroundColor: '#FBF5E8' }]}>
                  <Ionicons name="git-network" size={23} color={colors.primary} />
                </View>

                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={styles.atlasTagRow}>
                    <Ionicons name="ribbon-outline" size={11} color={colors.primary} />
                    <Text style={[styles.atlasTagText, { color: colors.primary }]}>
                      HANEDAN SOYAĞACI
                    </Text>
                  </View>
                  <Text style={[styles.atlasCardTitle, { color: colors.textPrimary }]}>
                    İmparatorlar & Soyağacı
                  </Text>
                  <Text style={[styles.atlasCardSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                    Roma, Bizans, Antik Yunan ve Osmanlı hükümdarlarının taht silsilesini ve meşhur sikkelerini keşfedin.
                  </Text>
                </View>

                <View style={[styles.atlasArrowBtn, { backgroundColor: colors.primary }]}>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>

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
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/categories' as any)}
                activeOpacity={0.7}
                style={styles.seeAllBtn}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Katalog</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
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
                  selectedCivilization === civ.name || selectedCivilization === civ.shortName;
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

            {/* AKTİF DARPHANE FİLTRESİ ROZETİ */}
            {filters.mints && filters.mints.length > 0 && (
              <View style={styles.activeMintFilterBar}>
                <View
                  style={[
                    styles.activeMintBadge,
                    { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                  ]}>
                  <Ionicons name="business" size={13} color={colors.primary} />
                  <Text style={[styles.activeMintText, { color: colors.primary }]}>
                    Darphane Filtresi: <Text style={{ fontWeight: '800' }}>{filters.mints.join(', ')}</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setFilters((prev) => ({ ...prev, mints: [] }));
                      router.setParams({ mint: undefined });
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[styles.activeMintCloseBtn, { backgroundColor: colors.primary }]}>
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="search-outline" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Kriterlere Uygun Tarihi Eser Bulunamadı
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Belirlediğiniz arama terimi veya filtre kombinasyonuna uyan sikke bulunamadı. Lütfen filtrelerinizi gevşetin veya sıfırlayın.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleResetAllFilters}
              style={[
                styles.emptyResetBtn,
                { backgroundColor: colors.primary },
              ]}>
              <Ionicons name="refresh-outline" size={15} color="#FFFFFF" />
              <Text style={styles.emptyResetBtnText}>Filtreleri Sıfırla</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* 6. GELİŞMİŞ FİLTRELEME MODAL BİLEŞENİ */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        currentFilters={filters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
        }}
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
  brandLogoImage: {
    width: 175,
    height: 42,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: 5,
  },
  topCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  topCountBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  topCountBadgeHighlight: {
    fontWeight: '800',
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
  // Arama ve Filtreleme Satırı
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, default: 8 }),
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 2,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E03131', // Canlı kırmızı dikkat rozeti
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#E03131',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // Akıllı Filtre Rozetleri (Smart Presets)
  presetScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingRight: Spacing.md,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  presetChipActive: {
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  presetChipInactive: {},
  presetChipText: {
    fontSize: 11.5,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  presetChipTextInactive: {
    fontWeight: '600',
  },
  presetCloseBtn: {
    marginLeft: 5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
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
  // Antik Darphaneler Atlası Bannerı
  atlasCardBanner: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginVertical: Spacing.xs + 2,
    padding: Spacing.sm + 4,
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  atlasCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  atlasCompassCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(158, 123, 59, 0.3)',
  },
  atlasTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  atlasTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  atlasCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  atlasCardSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  atlasArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  // Aktif Darphane Filtresi Rozeti
  activeMintFilterBar: {
    marginBottom: Spacing.sm,
    marginTop: 2,
  },
  activeMintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  activeMintText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  activeMintCloseBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
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
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
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
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl + 4,
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#1A1D20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5EEDB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm + 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: Spacing.lg,
    maxWidth: 290,
  },
  emptyResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    shadowColor: '#9E7B3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyResetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
