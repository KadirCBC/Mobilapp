import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { CoinCard } from '@/components/CoinCard';
import { BorderRadius, BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { CoinItem, MOCK_COINS } from '@/data/mockData';
import { useTheme } from '@/hooks/use-theme';

const CATEGORIES = [
  'Tümü',
  'Lidya',
  'Antik Yunan',
  'Makedonya',
  'Roma',
  'Bizans',
  'Osmanlı',
];

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colors = theme ?? Colors.dark;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [isFavoriteFilterActive, setIsFavoriteFilterActive] = useState(false);

  // Anlık filtreleme (Kategori + Arama Sorgusu)
  const filteredCoins = useMemo(() => {
    return MOCK_COINS.filter((coin) => {
      // Kategori kontrolü
      const matchesCategory =
        selectedCategory === 'Tümü' ||
        coin.civilization.toLowerCase().includes(selectedCategory.toLowerCase());

      // Arama sorgusu kontrolü (başlık, hükümdar, medeniyet, dönem)
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        coin.title.toLowerCase().includes(q) ||
        coin.ruler.toLowerCase().includes(q) ||
        coin.civilization.toLowerCase().includes(q) ||
        coin.period.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleCoinPress = (coin: CoinItem) => {
    router.push(`/coin/${coin.id}` as any);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tümü');
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}>
      <StatusBar style="light" />

      <View style={styles.container}>
        {/* 1. ÜST BAŞLIK ALANI */}
        <View style={styles.header}>
          <View style={styles.headerTitles}>
            <Text style={[styles.eyebrow, { color: colors.gold }]}>
              MÜZE & KOLEKSİYON
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              TARİHİ ESER & SİKKE ARŞİVİ
            </Text>
          </View>

          {/* Favori / Kaydedilenler İkonu */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsFavoriteFilterActive((prev) => !prev)}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.surface,
                borderColor: isFavoriteFilterActive ? colors.gold : colors.border,
              },
            ]}>
            <Ionicons
              name={isFavoriteFilterActive ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isFavoriteFilterActive ? colors.gold : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* 2. ARAMA ÇUBUĞU */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Ionicons
            name="search-outline"
            size={19}
            color={colors.gold}
            style={styles.searchIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Sikke, hükümdar veya medeniyet ara..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && Platform.OS !== 'ios' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. KATEGORİ SEKMELERİ (Yatay Kaydırılabilir Hap Butonlar) */}
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.75}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryPill,
                    isSelected
                      ? {
                          backgroundColor: colors.gold,
                          borderColor: colors.goldLight,
                        }
                      : {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                  ]}>
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected
                        ? {
                            color: '#121417',
                            fontWeight: '700',
                          }
                        : {
                            color: colors.textSecondary,
                            fontWeight: '500',
                          },
                    ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. SİKKE LİSTESİ */}
        <FlatList
          data={filteredCoins}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CoinCard item={item} onPress={() => handleCoinPress(item)} />
          )}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: BottomTabInset + Spacing.lg + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderGold,
                  },
                ]}>
                <Ionicons
                  name="shield-outline"
                  size={36}
                  color={colors.gold}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Sonuç Bulunamadı
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Aramanıza veya seçtiğiniz kategoriye uygun antik sikke bulunamadı.
              </Text>
              {(searchQuery.length > 0 || selectedCategory !== 'Tümü') && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleClearFilters}
                  style={[
                    styles.resetButton,
                    {
                      borderColor: colors.gold,
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    },
                  ]}>
                  <Text style={[styles.resetButtonText, { color: colors.gold }]}>
                    Filtreleri Temizle
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitles: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.select({ ios: Spacing.sm, default: 6 }),
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  categoriesWrapper: {
    marginBottom: Spacing.md,
  },
  categoriesContent: {
    gap: Spacing.xs + 2,
    paddingRight: Spacing.md,
  },
  categoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  listContent: {
    paddingTop: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  resetButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
